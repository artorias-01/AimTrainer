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
} from '../utils/storage';
import type { CrosshairConfig } from '../utils/storage';
import { soundManager } from '../utils/audio';

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

  updateSettings: (partial: Partial<SensitivityProfile>) => void;
  updateCrosshair: (partial: Partial<CrosshairConfig>) => void;
  setMasterVolume: (vol: number) => void;
  setHitVolume: (vol: number) => void;
  setTargetSpeedMultiplier: (mult: number) => void;
  togglePerformanceMode: () => void;
  toggleSound: () => void;
  setDisplayName: (name: string) => void;
  setKeybinds: (pause: string, restart: string) => void;
}

const initialSettings = getStoredSettings();
const initialCrosshair = getStoredCrosshair();
const initialAudio = getStoredAudio();
const initialHandle = localStorage.getItem('aimtt_handle_v1') || 'PLAYER';
const initialPauseKey = localStorage.getItem('aimtt_pause_key') || 'Escape';
const initialRestartKey = localStorage.getItem('aimtt_restart_key') || 'KeyR';
const initialSpeedMult = parseFloat(localStorage.getItem('aimtt_speed_mult_v1') || '1.0');
const initialPerfMode = localStorage.getItem('aimtt_perf_mode_v1') === 'true';

// Initialize audio sound manager with stored levels
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
}));
