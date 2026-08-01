import { create } from 'zustand';
import { getScenarioById, BENCHMARK_SEQUENCE_IDS } from '../utils/scenarios';
import type { ScenarioDef, WarmupRoutine } from '../utils/scenarios';
import { saveSessionResult, saveBenchmarkRun } from '../utils/storage';
import type { SessionResult, BenchmarkRunResult } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { useSettingsStore } from './useSettingsStore';

export interface TargetInstance {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  spawnTime: number;
  vx?: number;
  vy?: number;
  vz?: number;
  baseSpeed?: number;
  lastDirectionChange?: number;
  phaseOffset?: number;
}

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'finished';

let activeCountdownInterval: number | null = null;

function clearActiveCountdownInterval() {
  if (activeCountdownInterval !== null) {
    clearInterval(activeCountdownInterval);
    activeCountdownInterval = null;
  }
}

interface GameState {
  activeScenario: ScenarioDef;
  status: GameStatus;
  countdown: number;
  timeLeft: number;
  score: number;
  hits: number;
  misses: number;
  streak: number;
  maxCombo: number;
  targets: TargetInstance[];
  hitTimingsMs: number[];
  hitLocations: { x: number; y: number }[];
  lastHitResult: { x: number; y: number; isHit: boolean; timestamp: number } | null;
  lastSessionSummary: SessionResult | null;
  isNewPB: boolean;

  /* Playlist / Warmup Routine State */
  activeRoutine: WarmupRoutine | null;
  routineStepIndex: number;
  routineResults: SessionResult[];

  /* Benchmark Test State */
  isBenchmarkMode: boolean;
  benchmarkStepIndex: number;
  benchmarkDrillResults: { scenarioId: string; scenarioName: string; score: number; accuracy: number; avgTtkMs: number }[];
  lastBenchmarkSummary: BenchmarkRunResult | null;

  /* Continuous tracking fields */
  timeOnTargetMs: number;
  totalSessionTimeMs: number;
  currentTrackingStreakMs: number;
  longestTrackingStreakMs: number;
  trackingHp: number;
  trackingTimeline: { timeSec: number; onTargetPct: number }[];

  setScenario: (scenarioId: string) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  tickSecond: () => void;
  registerHit: (targetId: string, hitX?: number, hitY?: number) => void;
  registerMiss: (clickX?: number, clickY?: number) => void;
  flushTrackingTicks: (hitsDelta: number, missesDelta: number) => void;
  recordTrackingTick: (frameMs: number, isOnTarget: boolean) => void;
  updateTargetPositions: (delta: number) => void;

  startRoutine: (routine: WarmupRoutine) => void;
  startBenchmark: () => void;
  advancePlaylistStep: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeScenario: getScenarioById('gridshot-classic'),
  status: 'idle',
  countdown: 3,
  timeLeft: 60,
  score: 0,
  hits: 0,
  misses: 0,
  streak: 0,
  maxCombo: 0,
  targets: [],
  hitTimingsMs: [],
  hitLocations: [],
  lastHitResult: null,
  lastSessionSummary: null,
  isNewPB: false,

  timeOnTargetMs: 0,
  totalSessionTimeMs: 0,
  currentTrackingStreakMs: 0,
  longestTrackingStreakMs: 0,
  trackingHp: 100,
  trackingTimeline: [],

  activeRoutine: null,
  routineStepIndex: 0,
  routineResults: [],

  isBenchmarkMode: false,
  benchmarkStepIndex: 0,
  benchmarkDrillResults: [],
  lastBenchmarkSummary: null,

  setScenario: (scenarioId) => {
    clearActiveCountdownInterval();
    const sc = getScenarioById(scenarioId);
    set({
      activeScenario: sc,
      timeLeft: sc.durationSeconds,
      status: 'idle',
      targets: [],
      score: 0,
      hits: 0,
      misses: 0,
      streak: 0,
      maxCombo: 0,
      activeRoutine: null,
      isBenchmarkMode: false,
    });
  },

  startRoutine: (routine) => {
    clearActiveCountdownInterval();
    if (!routine || routine.drillIds.length === 0) return;
    const firstScenario = getScenarioById(routine.drillIds[0]);
    set({
      activeRoutine: routine,
      routineStepIndex: 0,
      routineResults: [],
      isBenchmarkMode: false,
      activeScenario: firstScenario,
      timeLeft: firstScenario.durationSeconds,
      status: 'idle',
    });
    get().startSession();
  },

  startBenchmark: () => {
    clearActiveCountdownInterval();
    const firstScenario = getScenarioById(BENCHMARK_SEQUENCE_IDS[0]);
    set({
      isBenchmarkMode: true,
      benchmarkStepIndex: 0,
      benchmarkDrillResults: [],
      activeRoutine: null,
      activeScenario: firstScenario,
      timeLeft: firstScenario.durationSeconds,
      status: 'idle',
    });
    get().startSession();
  },

  advancePlaylistStep: () => {
    const { activeRoutine, routineStepIndex, isBenchmarkMode, benchmarkStepIndex } = get();

    if (activeRoutine) {
      const nextIndex = routineStepIndex + 1;
      if (nextIndex < activeRoutine.drillIds.length) {
        const nextScenario = getScenarioById(activeRoutine.drillIds[nextIndex]);
        set({
          routineStepIndex: nextIndex,
          activeScenario: nextScenario,
          timeLeft: nextScenario.durationSeconds,
          status: 'idle',
        });
        get().startSession();
        return true;
      }
    } else if (isBenchmarkMode) {
      const nextIndex = benchmarkStepIndex + 1;
      if (nextIndex < BENCHMARK_SEQUENCE_IDS.length) {
        const nextScenario = getScenarioById(BENCHMARK_SEQUENCE_IDS[nextIndex]);
        set({
          benchmarkStepIndex: nextIndex,
          activeScenario: nextScenario,
          timeLeft: nextScenario.durationSeconds,
          status: 'idle',
        });
        get().startSession();
        return true;
      }
    }
    return false;
  },

  startSession: () => {
    if (get().status === 'countdown') return;

    clearActiveCountdownInterval();
    const { activeScenario } = get();
    const initialTargets = generateTargetsForScenario(activeScenario);

    set({
      status: 'countdown',
      countdown: 3,
      timeLeft: activeScenario.durationSeconds,
      score: 0,
      hits: 0,
      misses: 0,
      streak: 0,
      maxCombo: 0,
      targets: initialTargets,
      hitTimingsMs: [],
      hitLocations: [],
      lastHitResult: null,
      isNewPB: false,
      timeOnTargetMs: 0,
      totalSessionTimeMs: 0,
      currentTrackingStreakMs: 0,
      longestTrackingStreakMs: 0,
      trackingHp: 100,
      trackingTimeline: [],
    });

    soundManager.playBeep(false);

    activeCountdownInterval = window.setInterval(() => {
      const current = get().countdown;
      if (current > 1) {
        set({ countdown: current - 1 });
        soundManager.playBeep(false);
      } else if (current === 1) {
        set({ countdown: 0, status: 'playing' });
        soundManager.playBeep(true);
        clearActiveCountdownInterval();
      } else {
        clearActiveCountdownInterval();
      }
    }, 1000);
  },

  pauseSession: () => {
    clearActiveCountdownInterval();
    if (get().status === 'playing') {
      set({ status: 'paused' });
    }
  },

  resumeSession: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' });
    }
  },

  recordTrackingTick: (frameMs, isOnTarget) => {
    const { status, timeOnTargetMs, totalSessionTimeMs, currentTrackingStreakMs, longestTrackingStreakMs, score, trackingHp } = get();
    if (status !== 'playing' || frameMs <= 0) return;

    const newTotalTime = totalSessionTimeMs + frameMs;
    let newTimeOnTarget = timeOnTargetMs;
    let newCurrentStreak = currentTrackingStreakMs;
    let newLongestStreak = longestTrackingStreakMs;
    let scoreDelta = 0;
    let newHp = trackingHp;

    if (isOnTarget) {
      newTimeOnTarget += frameMs;
      newCurrentStreak += frameMs;
      newLongestStreak = Math.max(longestTrackingStreakMs, newCurrentStreak);
      const streakMult = Math.min(2.0, 1.0 + newCurrentStreak / 5000);
      scoreDelta = frameMs * 1.25 * streakMult;
      newHp = Math.min(100, trackingHp + (frameMs * 0.02));
    } else {
      newCurrentStreak = 0;
      newHp = Math.max(0, trackingHp - (frameMs * 0.035));
    }

    const infinitePracticeMode = useSettingsStore.getState().infinitePracticeMode;

    if (newHp <= 0 && !infinitePracticeMode) {
      set({
        totalSessionTimeMs: newTotalTime,
        timeOnTargetMs: newTimeOnTarget,
        currentTrackingStreakMs: 0,
        longestTrackingStreakMs: newLongestStreak,
        trackingHp: 0,
      });
      get().stopSession();
      return;
    }

    set({
      totalSessionTimeMs: newTotalTime,
      timeOnTargetMs: newTimeOnTarget,
      currentTrackingStreakMs: newCurrentStreak,
      longestTrackingStreakMs: newLongestStreak,
      trackingHp: newHp,
      score: Math.round(score + scoreDelta),
    });
  },

  stopSession: () => {
    clearActiveCountdownInterval();
    const {
      status,
      score,
      hits,
      misses,
      hitTimingsMs,
      hitLocations,
      activeScenario,
      maxCombo,
      activeRoutine,
      routineResults,
      isBenchmarkMode,
      benchmarkDrillResults,
      timeOnTargetMs,
      totalSessionTimeMs,
      longestTrackingStreakMs,
      trackingTimeline,
    } = get();
    if (status === 'finished') return;

    const isTracking = activeScenario.category === 'tracking';

    let accuracy = 0;
    let avgTtk = 0;
    let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'C';

    if (isTracking) {
      const durationMs = (activeScenario.durationSeconds || 60) * 1000;
      const totalTimeMs = totalSessionTimeMs > 0 ? totalSessionTimeMs : durationMs;
      accuracy = totalTimeMs > 0 ? Math.round((timeOnTargetMs / totalTimeMs) * 1000) / 10 : 0;

      if (accuracy >= 85 && score > 65000) grade = 'S+';
      else if (accuracy >= 75 && score > 55000) grade = 'S';
      else if (accuracy >= 65 && score > 40000) grade = 'A';
      else if (accuracy >= 50 && score > 25000) grade = 'B';
      else if (accuracy >= 35) grade = 'C';
      else grade = 'D';
    } else {
      const totalShots = hits + misses;
      accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 1000) / 10 : 0;
      avgTtk = hitTimingsMs.length > 0 ? Math.round(hitTimingsMs.reduce((a, b) => a + b, 0) / hitTimingsMs.length) : 0;

      if (accuracy >= 95 && score > 70000) grade = 'S+';
      else if (accuracy >= 90 && score > 60000) grade = 'S';
      else if (accuracy >= 85 && score > 45000) grade = 'A';
      else if (accuracy >= 75 && score > 30000) grade = 'B';
      else if (accuracy >= 60) grade = 'C';
      else grade = 'D';
    }

    const summary: SessionResult = {
      id: 'session-' + Date.now(),
      scenarioId: activeScenario.id,
      scenarioName: activeScenario.name,
      timestamp: Date.now(),
      score,
      accuracy,
      hits: isTracking ? Math.round(timeOnTargetMs / 1000) : hits,
      misses: isTracking ? Math.round(Math.max(0, totalSessionTimeMs - timeOnTargetMs) / 1000) : misses,
      avgTtkMs: isTracking ? 0 : avgTtk,
      maxCombo: isTracking ? Math.round((longestTrackingStreakMs / 1000) * 10) / 10 : maxCombo,
      grade,
      hitLocations: isTracking ? [] : hitLocations,
      reactionTimesMs: isTracking ? [] : hitTimingsMs,
      isTracking,
      timeOnTargetMs,
      totalSessionTimeMs,
      longestStreakMs: longestTrackingStreakMs,
      trackingTimeline,
    };

    const { isNewPB } = saveSessionResult(summary);
    if (isNewPB) {
      soundManager.playPersonalBest();
    }

    /* Accumulate Routine or Benchmark Step Results */
    if (activeRoutine) {
      const updatedRoutineResults = [...routineResults, summary];
      set({ routineResults: updatedRoutineResults });
    } else if (isBenchmarkMode) {
      const updatedBenchmarkDrills = [
        ...benchmarkDrillResults,
        {
          scenarioId: activeScenario.id,
          scenarioName: activeScenario.name,
          score,
          accuracy,
          avgTtkMs: avgTtk,
        },
      ];
      set({ benchmarkDrillResults: updatedBenchmarkDrills });

      // If benchmark sequence completed (all 4 drills)
      if (updatedBenchmarkDrills.length === BENCHMARK_SEQUENCE_IDS.length) {
        const avgScore = Math.round(
          updatedBenchmarkDrills.reduce((acc, d) => acc + Math.min(1000, Math.round((d.score / 60000) * 1000)), 0) / updatedBenchmarkDrills.length
        );
        let benchGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
        if (avgScore >= 900) benchGrade = 'S+';
        else if (avgScore >= 800) benchGrade = 'S';
        else if (avgScore >= 700) benchGrade = 'A';
        else if (avgScore >= 600) benchGrade = 'B';
        else if (avgScore >= 500) benchGrade = 'C';
        else benchGrade = 'D';

        const benchmarkRun: BenchmarkRunResult = {
          id: 'bench-' + Date.now(),
          timestamp: Date.now(),
          compositeScore: avgScore,
          grade: benchGrade,
          drillScores: updatedBenchmarkDrills,
        };
        saveBenchmarkRun(benchmarkRun);
        set({ lastBenchmarkSummary: benchmarkRun });
      }
    }

    set({
      status: 'finished',
      lastSessionSummary: summary,
      isNewPB,
    });
  },

  tickSecond: () => {
    const { status, timeLeft, activeScenario, timeOnTargetMs, totalSessionTimeMs, trackingTimeline } = get();
    if (status !== 'playing') return;

    if (activeScenario.category === 'tracking') {
      const elapsedSec = activeScenario.durationSeconds - timeLeft + 1;
      const currentPct = totalSessionTimeMs > 0 ? Math.round((timeOnTargetMs / totalSessionTimeMs) * 100) : 0;
      set({
        trackingTimeline: [...trackingTimeline, { timeSec: elapsedSec, onTargetPct: currentPct }],
      });
    }

    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      set({ timeLeft: 0 });
      get().stopSession();
    }
  },

  registerHit: (targetId, hitX = 0, hitY = 0) => {
    const { status, activeScenario, targets, score, hits, streak, maxCombo, hitTimingsMs, hitLocations } = get();
    if (status !== 'playing') return;

    soundManager.playHit();

    const target = targets.find((t) => t.id === targetId);
    const ttk = target ? Date.now() - target.spawnTime : 300;

    const newStreak = streak + 1;
    const newMaxCombo = Math.max(maxCombo, newStreak);
    const comboMultiplier = Math.min(2.5, 1 + newStreak * 0.05);
    const hitPoints = Math.round(500 * comboMultiplier);
    const newScore = score + hitPoints;

    const updatedTargets: TargetInstance[] = [];
    for (const t of targets) {
      if (t.id === targetId) {
        const otherActive = targets.filter((x) => x.id !== targetId);
        updatedTargets.push(createRandomTarget(activeScenario, t.id, otherActive));
      } else {
        updatedTargets.push(t);
      }
    }

    set({
      score: newScore,
      hits: hits + 1,
      streak: newStreak,
      maxCombo: newMaxCombo,
      targets: updatedTargets,
      hitTimingsMs: [...hitTimingsMs, ttk],
      hitLocations: [...hitLocations, { x: hitX, y: hitY }],
      lastHitResult: { x: hitX, y: hitY, isHit: true, timestamp: Date.now() },
    });
  },

  registerMiss: (clickX = 0, clickY = 0) => {
    const { status, misses, score } = get();
    if (status !== 'playing') return;

    soundManager.playMiss();
    const newScore = Math.max(0, score - 150);

    set({
      score: newScore,
      misses: misses + 1,
      streak: 0,
      lastHitResult: { x: clickX, y: clickY, isHit: false, timestamp: Date.now() },
    });
  },

  flushTrackingTicks: (hitsDelta, missesDelta) => {
    const { status, score, hits, misses, streak, maxCombo } = get();
    if (status !== 'playing' || (hitsDelta === 0 && missesDelta === 0)) return;

    if (hitsDelta > 0) {
      const newStreak = streak + hitsDelta;
      const newMaxCombo = Math.max(maxCombo, newStreak);
      set({
        score: score + hitsDelta * 15,
        hits: hits + hitsDelta,
        streak: newStreak,
        maxCombo: newMaxCombo,
      });
    } else if (missesDelta > 0) {
      set({
        misses: misses + missesDelta,
        streak: 0,
      });
    }
  },

  updateTargetPositions: () => {
    const { status, targets, activeScenario } = get();
    if (status !== 'playing') return;

    const now = Date.now();

    if (activeScenario.hasLifetimeLimit && activeScenario.lifetimeMs) {
      const speedMult = useSettingsStore.getState().targetSpeedMultiplier || 1.0;
      const effectiveLifetimeMs = Math.round(activeScenario.lifetimeMs / speedMult);
      const hasExpired = targets.some((t) => now - t.spawnTime > effectiveLifetimeMs);

      if (hasExpired) {
        const otherActive = targets.filter((x) => now - x.spawnTime <= effectiveLifetimeMs);
        const updated = targets.map((t) => {
          if (now - t.spawnTime > effectiveLifetimeMs) {
            return createRandomTarget(activeScenario, t.id, otherActive);
          }
          return t;
        });

        soundManager.playMiss();
        set({
          targets: updated,
          misses: get().misses + 1,
          streak: 0,
        });
      }
    }
  },
}));

function isTooCloseToExisting(
  candidate: { x: number; y: number; z: number; radius: number },
  existingTargets: TargetInstance[],
  idToExclude?: string
): boolean {
  const minPadding = candidate.radius < 0.25 ? 0.25 : 0.45;
  const minDist = candidate.radius * 2 + minPadding;

  for (const existing of existingTargets) {
    if (idToExclude && existing.id === idToExclude) continue;
    const dx = candidate.x - existing.x;
    const dy = candidate.y - existing.y;
    const dz = candidate.z - existing.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < minDist) {
      return true;
    }
  }
  return false;
}

function generateTargetsForScenario(scenario: ScenarioDef): TargetInstance[] {
  const list: TargetInstance[] = [];
  for (let i = 0; i < scenario.targetCount; i++) {
    list.push(createRandomTarget(scenario, `target-${i}`, list));
  }
  return list;
}

function generateCandidateTarget(scenario: ScenarioDef, id: string): TargetInstance {
  const radius = scenario.targetRadius;
  const clearance = radius + 0.12;

  let z = -6.5 + clearance;
  let x = (Math.random() - 0.5) * (18 - clearance * 2);
  let y = clearance + 0.4 + Math.random() * (5.8 - clearance * 2);

  if (scenario.id === 'long-range-sniper') {
    z = -6.5 + clearance;
    x = (Math.random() - 0.5) * 14;
    y = 1.2 + Math.random() * 4.2;
  } else if (scenario.arenaType === '6-wall') {
    const wallChoice = Math.floor(Math.random() * 4);
    if (wallChoice === 0) {
      z = -6.5 + clearance;
      x = (Math.random() - 0.5) * (14 - clearance * 2);
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else if (wallChoice === 1) {
      z = 6.5 - clearance;
      x = (Math.random() - 0.5) * (14 - clearance * 2);
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else if (wallChoice === 2) {
      x = -11.0 + clearance;
      z = (Math.random() - 0.5) * (9.5 - clearance * 2) - 1.5;
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else {
      x = 11.0 - clearance;
      z = (Math.random() - 0.5) * (9.5 - clearance * 2) - 1.5;
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    }
  }

  if (scenario.id === 'micro-flicks' || scenario.id === 'gridshot-small-grid') {
    x = (Math.random() - 0.5) * 6;
    y = 2.0 + (Math.random() - 0.5) * 3;
    z = -6.5 + clearance;
  }

  const baseSpeed = scenario.targetSpeed;
  const angle = Math.random() * Math.PI * 2;
  const vx = baseSpeed ? Math.cos(angle) * baseSpeed : 0;
  const vy = baseSpeed ? Math.sin(angle) * baseSpeed : 0;

  return {
    id,
    x,
    y,
    z,
    radius: scenario.targetRadius,
    spawnTime: Date.now(),
    vx,
    vy,
    baseSpeed,
    lastDirectionChange: Date.now(),
    phaseOffset: Math.random() * Math.PI * 2,
  };
}

function createRandomTarget(
  scenario: ScenarioDef,
  id: string,
  existingTargets: TargetInstance[] = []
): TargetInstance {
  let candidate = generateCandidateTarget(scenario, id);
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!isTooCloseToExisting(candidate, existingTargets, id)) {
      return candidate;
    }
    candidate = generateCandidateTarget(scenario, id);
  }

  return candidate;
}
