import { create } from 'zustand';
import { getScenarioById } from '../utils/scenarios';
import type { ScenarioDef } from '../utils/scenarios';
import { saveSessionResult } from '../utils/storage';
import type { SessionResult } from '../utils/storage';
import { soundManager } from '../utils/audio';

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

  setScenario: (scenarioId: string) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  tickSecond: () => void;
  registerHit: (targetId: string, hitX?: number, hitY?: number) => void;
  registerMiss: (clickX?: number, clickY?: number) => void;
  flushTrackingTicks: (hitsDelta: number, missesDelta: number) => void;
  updateTargetPositions: (delta: number) => void;
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
    });
  },

  startSession: () => {
    // Guard against re-entrant calls while status is already 'countdown'
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

  stopSession: () => {
    clearActiveCountdownInterval();
    const { status, score, hits, misses, hitTimingsMs, hitLocations, activeScenario, maxCombo } = get();
    if (status === 'finished') return;

    const totalShots = hits + misses;
    const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 1000) / 10 : 0;
    const avgTtk = hitTimingsMs.length > 0 ? Math.round(hitTimingsMs.reduce((a, b) => a + b, 0) / hitTimingsMs.length) : 0;

    let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
    if (accuracy >= 95 && score > 70000) grade = 'S+';
    else if (accuracy >= 90 && score > 60000) grade = 'S';
    else if (accuracy >= 85 && score > 45000) grade = 'A';
    else if (accuracy >= 75 && score > 30000) grade = 'B';
    else if (accuracy >= 60) grade = 'C';
    else grade = 'D';

    const summary: SessionResult = {
      id: 'session-' + Date.now(),
      scenarioId: activeScenario.id,
      scenarioName: activeScenario.name,
      timestamp: Date.now(),
      score,
      accuracy,
      hits,
      misses,
      avgTtkMs: avgTtk,
      maxCombo,
      grade,
      hitLocations,
    };

    const { isNewPB } = saveSessionResult(summary);
    if (isNewPB) {
      soundManager.playPersonalBest();
    }

    set({
      status: 'finished',
      lastSessionSummary: summary,
      isNewPB,
    });
  },

  tickSecond: () => {
    const { status, timeLeft } = get();
    if (status !== 'playing') return;

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

    const updatedTargets = targets.map((t) => {
      if (t.id === targetId) {
        // Reuse stable target.id key across hits for seamless component updates
        return createRandomTarget(activeScenario, t.id);
      }
      return t;
    });

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

    // Check lifetime limits for reflex / timed scenarios (discrete state update ONLY on expiry)
    if (activeScenario.hasLifetimeLimit && activeScenario.lifetimeMs) {
      const limit = activeScenario.lifetimeMs;
      const hasExpired = targets.some((t) => now - t.spawnTime > limit);

      if (hasExpired) {
        const updated = targets.map((t) => {
          if (now - t.spawnTime > limit) {
            // Reuse stable target ID key (t.id) to eliminate unmount/remount pop jitter!
            return createRandomTarget(activeScenario, t.id);
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

function generateTargetsForScenario(scenario: ScenarioDef): TargetInstance[] {
  const list: TargetInstance[] = [];
  for (let i = 0; i < scenario.targetCount; i++) {
    list.push(createRandomTarget(scenario, `target-${i}`));
  }
  return list;
}

function createRandomTarget(scenario: ScenarioDef, id: string): TargetInstance {
  const radius = scenario.targetRadius;
  const clearance = radius + 0.12; // Wall clearance offset so spheres never intersect wall geometry

  // Default Front Wall (Wall plane at Z = -6.5)
  let z = -6.5 + clearance;
  let x = (Math.random() - 0.5) * (18 - clearance * 2);
  let y = clearance + 0.4 + Math.random() * (5.8 - clearance * 2);

  if (scenario.id === 'long-range-sniper') {
    z = -6.5 + clearance; // Spawn in front of front wall
    x = (Math.random() - 0.5) * 14;
    y = 1.2 + Math.random() * 4.2;
  } else if (scenario.arenaType === '6-wall') {
    const wallChoice = Math.floor(Math.random() * 4);
    if (wallChoice === 0) {
      // Front Wall (Z = -6.5)
      z = -6.5 + clearance;
      x = (Math.random() - 0.5) * (14 - clearance * 2);
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else if (wallChoice === 1) {
      // Rear Wall (Z = +6.5)
      z = 6.5 - clearance;
      x = (Math.random() - 0.5) * (14 - clearance * 2);
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else if (wallChoice === 2) {
      // Left Wall (X = -11.0)
      x = -11.0 + clearance;
      z = (Math.random() - 0.5) * (9.5 - clearance * 2) - 1.5;
      y = clearance + 0.5 + Math.random() * (5.5 - clearance * 2);
    } else {
      // Right Wall (X = +11.0)
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
