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
}

export interface PersonalBest {
  scenarioId: string;
  highScore: number;
  bestAccuracy: number;
  bestTtkMs: number;
  timestamp: number;
}

const SETTINGS_KEY = 'aimtt_settings_v1';
const CROSSHAIR_KEY = 'aimtt_crosshair_v1';
const AUDIO_KEY = 'aimtt_audio_v1';
const SESSIONS_KEY = 'aimtt_sessions_v1';
const PB_KEY = 'aimtt_pb_v1';

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
  // Cap stored sessions to most recent 200 entries to prevent localStorage overflow
  const cappedSessions = sessions.slice(0, 200);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(cappedSessions));

  // Check personal best
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
    // Ignore storage errors
  }
}

const PRESETS_KEY = 'aimtt_saved_crosshair_presets_v1';

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
