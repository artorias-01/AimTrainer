import type { SensitivityProfile } from './sensitivity';

export interface CrosshairConfig {
  type: 'dot' | 'cross' | 'circle' | 'cross-dot' | 't-shape' | 'x-shape';
  color: string; // '#f5b8c9' (pink), '#ffffff', '#0d0d0d'
  size: number; // 4 to 30
  thickness: number; // 1 to 10
  gap: number; // 0 to 20
  outline: boolean;
  dotSize: number; // 1 to 10
  opacity?: number;
  outlineColor?: string;
  outlineThickness?: number;
  showDot?: boolean;
  dotColor?: string;
}

export interface SavedCrosshairPreset {
  id: string;
  name: string;
  config: CrosshairConfig;
}

export interface AudioSettings {
  masterVolume: number;
  hitVolume: number;
  soundEnabled: boolean;
}

export interface SessionResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  timestamp: number;
  score: number;
  accuracy: number; // 0 - 100
  hits: number;
  misses: number;
  avgTtkMs: number;
  maxCombo: number;
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  hitLocations?: { x: number; y: number }[]; // 2D matrix hit coordinates normalized -1 to 1 for heatmap
  reactionTimesMs?: number[]; // Reaction times for histogram
}

export interface PersonalBest {
  scenarioId: string;
  highScore: number;
  bestAccuracy: number;
  bestTtkMs: number;
  timestamp: number;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  description: string;
  drillIds: string[];
  isBuiltIn?: boolean;
}

export interface BenchmarkRunResult {
  id: string;
  timestamp: number;
  compositeScore: number;
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  drillScores: {
    scenarioId: string;
    scenarioName: string;
    score: number;
    accuracy: number;
    avgTtkMs: number;
  }[];
}

export interface DailyStreak {
  streakCount: number;
  lastCompletedDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD completed dates
}

const SETTINGS_KEY = 'aimtt_settings_v1';
const CROSSHAIR_KEY = 'aimtt_crosshair_v1';
const AUDIO_KEY = 'aimtt_audio_v1';
const SESSIONS_KEY = 'aimtt_sessions_v1';
const PB_KEY = 'aimtt_pb_v1';
const PRESETS_KEY = 'aimtt_saved_crosshair_presets_v1';
const CUSTOM_SCENARIOS_KEY = 'aimtt_custom_scenarios_v1';
const ROUTINES_KEY = 'aimtt_warmup_routines_v1';
const BENCHMARK_KEY = 'aimtt_benchmark_runs_v1';
const DAILY_STREAK_KEY = 'aimtt_daily_streak_v1';
const SCENARIO_CROSSHAIRS_KEY = 'aimtt_scenario_crosshairs_v1';
const ONBOARDING_KEY = 'aimtt_onboarding_completed_v1';

export const DEFAULT_SETTINGS: SensitivityProfile = {
  sensitivity: 0.35,
  dpi: 800,
  engine: 'valorant',
  fov: 103,
  invertY: false,
  rawInput: true,
};

export const DEFAULT_CROSSHAIR: CrosshairConfig = {
  type: 'cross-dot',
  color: '#f5b8c9',
  size: 10,
  thickness: 2,
  gap: 4,
  outline: true,
  dotSize: 3,
  opacity: 1.0,
  outlineColor: '#000000',
};

export const DEFAULT_AUDIO: AudioSettings = {
  masterVolume: 0.8,
  hitVolume: 0.9,
  soundEnabled: true,
};

export function getStoredSettings(): SensitivityProfile {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SensitivityProfile) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getStoredCrosshair(): CrosshairConfig {
  try {
    const raw = localStorage.getItem(CROSSHAIR_KEY);
    return raw ? { ...DEFAULT_CROSSHAIR, ...JSON.parse(raw) } : DEFAULT_CROSSHAIR;
  } catch {
    return DEFAULT_CROSSHAIR;
  }
}

export function saveStoredCrosshair(crosshair: CrosshairConfig) {
  localStorage.setItem(CROSSHAIR_KEY, JSON.stringify(crosshair));
}

export function getStoredAudio(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_KEY);
    return raw ? { ...DEFAULT_AUDIO, ...JSON.parse(raw) } : DEFAULT_AUDIO;
  } catch {
    return DEFAULT_AUDIO;
  }
}

export function saveStoredAudio(audio: AudioSettings) {
  localStorage.setItem(AUDIO_KEY, JSON.stringify(audio));
}

export function getStoredSessions(): SessionResult[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSessionResult(session: SessionResult): { isNewPB: boolean } {
  const sessions = getStoredSessions();
  sessions.unshift(session);
  const cappedSessions = sessions.slice(0, 200);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(cappedSessions));

  const pbs = getPersonalBests();
  const currentPb = pbs[session.scenarioId];
  let isNewPB = false;

  if (!currentPb || session.score > currentPb.highScore) {
    isNewPB = true;
    pbs[session.scenarioId] = {
      scenarioId: session.scenarioId,
      highScore: session.score,
      bestAccuracy: session.accuracy,
      bestTtkMs: session.avgTtkMs,
      timestamp: session.timestamp,
    };
    localStorage.setItem(PB_KEY, JSON.stringify(pbs));
  }

  return { isNewPB };
}

export function getPersonalBests(): Record<string, PersonalBest> {
  try {
    const raw = localStorage.getItem(PB_KEY);
    if (raw) return JSON.parse(raw);
    return {};
  } catch {
    return {};
  }
}

export function clearSessionHistory() {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(PB_KEY);
  } catch {
    // Ignore
  }
}

export function getSavedCrosshairPresets(): SavedCrosshairPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCrosshairPreset(name: string, config: CrosshairConfig): SavedCrosshairPreset[] {
  const current = getSavedCrosshairPresets();
  const newPreset: SavedCrosshairPreset = {
    id: 'preset-' + Date.now(),
    name: name.trim() || 'Custom Crosshair',
    config: { ...config },
  };
  const updated = [newPreset, ...current];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCrosshairPreset(id: string): SavedCrosshairPreset[] {
  const current = getSavedCrosshairPresets();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  return updated;
}

/* Custom Scenarios Storage */
export function getStoredCustomScenarios(): any[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomScenario(scenario: any): any[] {
  const current = getStoredCustomScenarios();
  const existingIdx = current.findIndex((s) => s.id === scenario.id);
  let updated: any[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = scenario;
  } else {
    updated = [scenario, ...current];
  }
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCustomScenario(id: string): any[] {
  const current = getStoredCustomScenarios();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(updated));
  return updated;
}

/* Warmup Routines Storage */
export function getStoredWarmupRoutines(): WarmupRoutine[] {
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWarmupRoutine(routine: WarmupRoutine): WarmupRoutine[] {
  const current = getStoredWarmupRoutines();
  const existingIdx = current.findIndex((r) => r.id === routine.id);
  let updated: WarmupRoutine[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = routine;
  } else {
    updated = [routine, ...current];
  }
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteWarmupRoutine(id: string): WarmupRoutine[] {
  const current = getStoredWarmupRoutines();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(updated));
  return updated;
}

/* Benchmark Run Results Storage */
export function getStoredBenchmarkRuns(): BenchmarkRunResult[] {
  try {
    const raw = localStorage.getItem(BENCHMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBenchmarkRun(result: BenchmarkRunResult): BenchmarkRunResult[] {
  const current = getStoredBenchmarkRuns();
  const updated = [result, ...current].slice(0, 100);
  localStorage.setItem(BENCHMARK_KEY, JSON.stringify(updated));
  return updated;
}

/* Daily Streak Tracker Storage */
export function getDailyStreak(): DailyStreak {
  try {
    const raw = localStorage.getItem(DAILY_STREAK_KEY);
    if (!raw) return { streakCount: 0, lastCompletedDate: '', historyDates: [] };
    return JSON.parse(raw);
  } catch {
    return { streakCount: 0, lastCompletedDate: '', historyDates: [] };
  }
}

export function recordDailyCompletion(todayDateStr: string): DailyStreak {
  const current = getDailyStreak();
  if (current.lastCompletedDate === todayDateStr) {
    return current; // Already completed today
  }

  // Calculate yesterday date string
  const today = new Date(todayDateStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (current.lastCompletedDate === yesterdayStr) {
    newStreak = current.streakCount + 1;
  }

  const newHistory = Array.from(new Set([...current.historyDates, todayDateStr]));
  const updated: DailyStreak = {
    streakCount: newStreak,
    lastCompletedDate: todayDateStr,
    historyDates: newHistory,
  };
  localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(updated));
  return updated;
}

/* Scenario Crosshair Mapping Storage */
export function getScenarioCrosshairMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SCENARIO_CROSSHAIRS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveScenarioCrosshairMap(map: Record<string, string>): void {
  localStorage.setItem(SCENARIO_CROSSHAIRS_KEY, JSON.stringify(map));
}

/* First-Run Onboarding Storage */
export function getOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(val: boolean): void {
  localStorage.setItem(ONBOARDING_KEY, val ? 'true' : 'false');
}

/* Export / Import All Data */
export function exportAllDataJSON(): string {
  const data = {
    settings: getStoredSettings(),
    crosshair: getStoredCrosshair(),
    audio: getStoredAudio(),
    sessions: getStoredSessions(),
    pbs: getPersonalBests(),
    presets: getSavedCrosshairPresets(),
    customScenarios: getStoredCustomScenarios(),
    routines: getStoredWarmupRoutines(),
    benchmarkRuns: getStoredBenchmarkRuns(),
    dailyStreak: getDailyStreak(),
    scenarioCrosshairs: getScenarioCrosshairMap(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    if (data.crosshair) localStorage.setItem(CROSSHAIR_KEY, JSON.stringify(data.crosshair));
    if (data.audio) localStorage.setItem(AUDIO_KEY, JSON.stringify(data.audio));
    if (data.sessions) localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.sessions));
    if (data.pbs) localStorage.setItem(PB_KEY, JSON.stringify(data.pbs));
    if (data.presets) localStorage.setItem(PRESETS_KEY, JSON.stringify(data.presets));
    if (data.customScenarios) localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(data.customScenarios));
    if (data.routines) localStorage.setItem(ROUTINES_KEY, JSON.stringify(data.routines));
    if (data.benchmarkRuns) localStorage.setItem(BENCHMARK_KEY, JSON.stringify(data.benchmarkRuns));
    if (data.dailyStreak) localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(data.dailyStreak));
    if (data.scenarioCrosshairs) localStorage.setItem(SCENARIO_CROSSHAIRS_KEY, JSON.stringify(data.scenarioCrosshairs));
    return true;
  } catch {
    return false;
  }
}

export function exportSessionsCSV(): string {
  const sessions = getStoredSessions();
  const headers = ['ID', 'Scenario ID', 'Scenario Name', 'Timestamp', 'Date', 'Score', 'Accuracy (%)', 'Hits', 'Misses', 'Avg TTK (ms)', 'Max Combo', 'Grade'];
  const rows = sessions.map((s) => [
    s.id,
    s.scenarioId,
    `"${s.scenarioName}"`,
    s.timestamp,
    new Date(s.timestamp).toISOString(),
    s.score,
    s.accuracy,
    s.hits,
    s.misses,
    s.avgTtkMs,
    s.maxCombo,
    s.grade,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
