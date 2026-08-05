import { create } from 'zustand';
import { calculateCm360 } from '../utils/sensitivity';
import type { SensitivityProfile } from '../utils/sensitivity';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredCrosshair,
  saveStoredCrosshair,
  getStoredAudio,
  saveStoredAudio,
  getScenarioCrosshairMap,
  saveScenarioCrosshairMap,
  getSavedCrosshairPresets,
} from '../utils/storage';
import type { CrosshairConfig } from '../utils/storage';
import { soundManager } from '../utils/audio';

export type TargetShapeType = 'sphere' | 'torus' | 'cube' | 'octahedron' | 'cylinder' | 'cone' | 'capsule';
export type ArenaBackdrop = 'grid-room' | 'minimal-void' | 'gradient-room' | 'custom-image';

export interface TargetShapeConfig {
  shape: TargetShapeType;
  scale: number;
  wireframe: boolean;
  emissiveIntensity: number;
  idleRotation: boolean;
}

export const DEFAULT_TARGET_SHAPE_CONFIG: TargetShapeConfig = {
  shape: 'sphere',
  scale: 1.0,
  wireframe: false,
  emissiveIntensity: 0.65,
  idleRotation: true,
};

function getStoredTargetShapeConfig(): TargetShapeConfig {
  try {
    const raw = localStorage.getItem('aimtt_target_shape_config_v1');
    if (raw) return { ...DEFAULT_TARGET_SHAPE_CONFIG, ...JSON.parse(raw) };
    const legacyShape = localStorage.getItem('aimtt_target_shape_v1') as TargetShapeType;
    if (legacyShape) return { ...DEFAULT_TARGET_SHAPE_CONFIG, shape: legacyShape };
    return DEFAULT_TARGET_SHAPE_CONFIG;
  } catch {
    return DEFAULT_TARGET_SHAPE_CONFIG;
  }
}

export function applyThemeAccent(hex: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--accent-color', hex);
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16) || 245;
      const g = parseInt(clean.substring(2, 4), 16) || 184;
      const b = parseInt(clean.substring(4, 6), 16) || 201;
      document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    }
  }
}

interface SettingsState {
  settings: SensitivityProfile;
  crosshair: CrosshairConfig;
  masterVolume: number;
  hitVolume: number;
  soundEnabled: boolean;
  targetSpeedMultiplier: number;
  performanceMode: boolean;
  cm360: number;
  displayName: string;
  pauseKey: string;
  restartKey: string;
  targetShapeConfig: TargetShapeConfig;
  targetColor: string;
  arenaBackdrop: ArenaBackdrop;
  arenaColor: string;
  themeAccentColor: string;
  globalMultiHitTargets?: never;
  scenarioCrosshairMap: Record<string, string>;

  updateSettings: (partial: Partial<SensitivityProfile>) => void;
  updateCrosshair: (partial: Partial<CrosshairConfig>) => void;
  setMasterVolume: (vol: number) => void;
  setHitVolume: (vol: number) => void;
  setTargetSpeedMultiplier: (mult: number) => void;
  togglePerformanceMode: () => void;
  toggleSound: () => void;
  setDisplayName: (name: string) => void;
  setKeybinds: (pause: string, restart: string) => void;
  setTargetShapeConfig: (partial: Partial<TargetShapeConfig>) => void;
  setTargetColor: (color: string) => void;
  setArenaBackdrop: (backdrop: ArenaBackdrop) => void;
  setArenaColor: (color: string) => void;
  setThemeAccentColor: (color: string) => void;
  setScenarioCrosshair: (targetKey: string, presetId: string) => void;
  getCrosshairForScenario: (scenarioId: string, category: string) => CrosshairConfig;
}

const initialSettings = getStoredSettings();
const initialCrosshair = getStoredCrosshair();
const initialAudio = getStoredAudio();
const initialHandle = localStorage.getItem('aimtt_handle_v1') || 'PLAYER';
const initialPauseKey = localStorage.getItem('aimtt_pause_key') || 'Escape';
const initialRestartKey = localStorage.getItem('aimtt_restart_key') || 'KeyR';
const initialSpeedMult = parseFloat(localStorage.getItem('aimtt_speed_mult_v1') || '1.0');
const initialPerfMode = localStorage.getItem('aimtt_perf_mode_v1') === 'true';
const initialShapeConfig = getStoredTargetShapeConfig();
const initialTargetColor = localStorage.getItem('aimtt_target_color_v1') || '#f5b8c9';
const initialBackdrop = (localStorage.getItem('aimtt_arena_backdrop_v1') as ArenaBackdrop) || 'grid-room';
const initialArenaColor = localStorage.getItem('aimtt_arena_color_v1') || '#121212';
const initialThemeAccent = localStorage.getItem('aimtt_theme_accent_v1') || '#f5b8c9';
const initialCrosshairMap = getScenarioCrosshairMap();

applyThemeAccent(initialThemeAccent);

soundManager.setMasterVolume(initialAudio.masterVolume);
soundManager.setHitVolume(initialAudio.hitVolume);
soundManager.setSoundEnabled(initialAudio.soundEnabled);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: initialSettings,
  crosshair: initialCrosshair,
  masterVolume: initialAudio.masterVolume,
  hitVolume: initialAudio.hitVolume,
  soundEnabled: initialAudio.soundEnabled,
  targetSpeedMultiplier: initialSpeedMult,
  performanceMode: initialPerfMode,
  cm360: calculateCm360(
    initialSettings.sensitivity,
    initialSettings.dpi,
    initialSettings.engine
  ),
  displayName: initialHandle,
  pauseKey: initialPauseKey,
  restartKey: initialRestartKey,
  targetShapeConfig: initialShapeConfig,
  targetColor: initialTargetColor,
  arenaBackdrop: initialBackdrop,
  arenaColor: initialArenaColor,
  themeAccentColor: initialThemeAccent,
  scenarioCrosshairMap: initialCrosshairMap,

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    const cm360 = calculateCm360(updated.sensitivity, updated.dpi, updated.engine);
    saveStoredSettings(updated);
    set({ settings: updated, cm360 });
  },

  updateCrosshair: (partial) => {
    const updated = { ...get().crosshair, ...partial };
    saveStoredCrosshair(updated);
    set({ crosshair: updated });
  },

  setMasterVolume: (vol) => {
    soundManager.setMasterVolume(vol);
    saveStoredAudio({
      masterVolume: vol,
      hitVolume: get().hitVolume,
      soundEnabled: get().soundEnabled,
    });
    set({ masterVolume: vol });
  },

  setHitVolume: (vol) => {
    soundManager.setHitVolume(vol);
    saveStoredAudio({
      masterVolume: get().masterVolume,
      hitVolume: vol,
      soundEnabled: get().soundEnabled,
    });
    set({ hitVolume: vol });
  },

  setTargetSpeedMultiplier: (mult) => {
    localStorage.setItem('aimtt_speed_mult_v1', mult.toString());
    set({ targetSpeedMultiplier: mult });
  },

  togglePerformanceMode: () => {
    const next = !get().performanceMode;
    localStorage.setItem('aimtt_perf_mode_v1', next ? 'true' : 'false');
    set({ performanceMode: next });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundManager.setSoundEnabled(next);
    saveStoredAudio({
      masterVolume: get().masterVolume,
      hitVolume: get().hitVolume,
      soundEnabled: next,
    });
    set({ soundEnabled: next });
  },

  setDisplayName: (name) => {
    localStorage.setItem('aimtt_handle_v1', name);
    set({ displayName: name });
  },

  setKeybinds: (pause, restart) => {
    localStorage.setItem('aimtt_pause_key', pause);
    localStorage.setItem('aimtt_restart_key', restart);
    set({ pauseKey: pause, restartKey: restart });
  },

  setTargetShapeConfig: (partial) => {
    const updated = { ...get().targetShapeConfig, ...partial };
    localStorage.setItem('aimtt_target_shape_config_v1', JSON.stringify(updated));
    set({ targetShapeConfig: updated });
  },

  setTargetColor: (color) => {
    localStorage.setItem('aimtt_target_color_v1', color);
    set({ targetColor: color });
  },

  setArenaBackdrop: (backdrop) => {
    localStorage.setItem('aimtt_arena_backdrop_v1', backdrop);
    set({ arenaBackdrop: backdrop });
  },

  setArenaColor: (color) => {
    localStorage.setItem('aimtt_arena_color_v1', color);
    set({ arenaColor: color });
  },

  setThemeAccentColor: (color) => {
    localStorage.setItem('aimtt_theme_accent_v1', color);
    applyThemeAccent(color);
    set({ themeAccentColor: color });
  },

  setScenarioCrosshair: (targetKey, presetId) => {
    const map = { ...get().scenarioCrosshairMap };
    if (!presetId) {
      delete map[targetKey];
    } else {
      map[targetKey] = presetId;
    }
    saveScenarioCrosshairMap(map);
    set({ scenarioCrosshairMap: map });
  },

  getCrosshairForScenario: (scenarioId, category) => {
    const map = get().scenarioCrosshairMap;
    const presetId = map[scenarioId] || map[category];
    if (presetId) {
      const presets = getSavedCrosshairPresets();
      const match = presets.find((p) => p.id === presetId);
      if (match) return match.config;
    }
    return get().crosshair; // Fallback to global default crosshair
  },
}));
