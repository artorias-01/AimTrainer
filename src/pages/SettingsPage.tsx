import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { useSettingsStore } from '../store/useSettingsStore';
import { useStatsStore } from '../store/useStatsStore';
import { calculateSensFromCm360 } from '../utils/sensitivity';
import type { GameEngine } from '../utils/sensitivity';
import { isValidHexColor, normalizeHexColor } from '../utils/crosshairImporter';
import { soundManager } from '../utils/audio';
import {
  Sliders,
  Volume2,
  VolumeX,
  User,
  Trash2,
  CheckCircle2,
  Gauge,
  AlertCircle,
  Zap,
  ArrowLeft,
  Tv,
  Gamepad2,
} from 'lucide-react';

import { TargetPreview3D } from '../components/ui/TargetPreview3D';
import { CrosshairStudio } from '../components/ui/CrosshairStudio';

function getHexLuminance(hex: string): number {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return 1.0;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function isLowContrastTarget(hex: string): boolean {
  const bgLuminance = 0.005; // #0d0d0d
  const targetLuminance = getHexLuminance(hex);
  const ratio = (targetLuminance + 0.05) / (bgLuminance + 0.05);
  return ratio < 2.5;
}

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const {
    settings,
    updateSettings,
    masterVolume,
    setMasterVolume,
    hitVolume,
    setHitVolume,
    soundEnabled,
    toggleSound,
    targetSpeedMultiplier,
    setTargetSpeedMultiplier,
    performanceMode,
    togglePerformanceMode,
    cm360,
    displayName,
    setDisplayName,
    pauseKey,
    restartKey,
    setKeybinds,
    targetShapeConfig,
    setTargetShapeConfig,
    targetColor,
    setTargetColor,
    arenaBackdrop,
    setArenaBackdrop,
    arenaColor,
    setArenaColor,
    themeAccentColor,
    setThemeAccentColor,
  } = useSettingsStore();

  const { clearHistory } = useStatsStore();

  const [activeCategory, setActiveCategory] = useState<
    'game' | 'crosshair' | 'audio' | 'video' | 'controls' | null
  >(null);

  const [listeningKeyFor, setListeningKeyFor] = useState<'pause' | 'restart' | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const showSaveConfirmation = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2000);
  };

  const engines: { id: GameEngine; label: string }[] = [
    { id: 'valorant', label: 'VALORANT' },
    { id: 'cs2', label: 'CS2 / SOURCE' },
    { id: 'overwatch', label: 'OVERWATCH 2' },
    { id: 'apex', label: 'APEX LEGENDS' },
  ];

  const speedPacingPresets = [
    { value: 0.5, label: '0.5x EASY' },
    { value: 0.75, label: '0.75x MODERATE' },
    { value: 1.0, label: '1.0x NORMAL' },
    { value: 1.25, label: '1.25x FAST' },
    { value: 1.5, label: '1.5x EXPERT' },
  ];

  const handleKeyDownRebind = (e: React.KeyboardEvent) => {
    if (!listeningKeyFor) return;
    e.preventDefault();
    const newKey = e.code || e.key;

    if (listeningKeyFor === 'pause') {
      setKeybinds(newKey, restartKey);
    } else {
      setKeybinds(pauseKey, newKey);
    }
    setListeningKeyFor(null);
    showSaveConfirmation('KEYBIND SAVED');
  };

  const handleClearHistoryConfirm = () => {
    clearHistory();
    setShowClearConfirm(false);
    showSaveConfirmation('SESSION HISTORY CLEARED');
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDownRebind}
      className="relative w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 focus:outline-none select-none overflow-hidden"
    >
      {/* Background 3D Real-Time Scene for Settings Atmosphere */}
      <div className="fixed inset-0 z-0 opacity-35 pointer-events-none">
        <HeroScene />
      </div>

      {/* Radial Dark Vignette Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/85 to-[#0d0d0d]/95 pointer-events-none" />

      {/* Settings Content Layer */}
      <div className="relative z-10">
        {/* Save Confirmation Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141414] border border-[#f5b8c9] text-white px-4 py-3 rounded-[12px] text-xs font-mono flex items-center gap-2.5 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#f5b8c9]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-extrabold text-xl text-white">CLEAR SESSION HISTORY?</h3>
            <p className="font-sans-ui text-xs text-neutral-400">
              This action will permanently delete all stored training session results and personal best scores from localStorage. This cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClearHistoryConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-[12px] transition-all"
              >
                CONFIRM CLEAR
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-[#1a1a1a] hover:bg-[#262626] text-neutral-300 font-mono text-xs font-bold rounded-[12px] border border-[#262626]"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* LEVEL 1: OPTIONS LANDING MENU VIEW */}
        {activeCategory === null ? (
          <motion.div
            key="options-landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-md mx-auto text-center space-y-10 py-12"
          >
            {/* Options Title & Ornamental Line Divider */}
            <div className="space-y-4">
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-wider text-white">
                OPTIONS
              </h1>
              <div className="flex items-center justify-center gap-3 w-48 mx-auto opacity-75">
                <div className="h-px bg-gradient-to-r from-transparent to-[#f5b8c9] flex-1" />
                <span className="text-[#f5b8c9] text-xs font-mono">◆</span>
                <div className="h-px bg-gradient-to-l from-transparent to-[#f5b8c9] flex-1" />
              </div>
            </div>

            {/* Vertical Text-First Menu List */}
            <div className="flex flex-col items-center gap-6 py-2">
              {[
                { id: 'game', label: 'GAME' },
                { id: 'crosshair', label: 'CROSSHAIR' },
                { id: 'audio', label: 'AUDIO' },
                { id: 'video', label: 'VIDEO' },
                { id: 'controls', label: 'CONTROLS' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategory(cat.id as any);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="group relative font-display font-extrabold text-xl md:text-3xl tracking-widest text-neutral-300 hover:text-[#f5b8c9] transition-colors duration-200 py-1 flex items-center justify-center gap-3 focus:outline-none"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-base">‹</span>
                  <span className="relative">
                    {cat.label}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-base">›</span>
                </button>
              ))}

              {/* BACK Option */}
              <div className="pt-8">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    if (onNavigate) {
                      onNavigate('landing');
                    } else {
                      window.history.back();
                    }
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-400 hover:text-white transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">‹</span>
                  <span className="relative">
                    BACK
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">›</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* LEVEL 2: SUB-CATEGORY SETTINGS CONTENT VIEW */
          <motion.div
            key={`category-${activeCategory}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Category Breadcrumb Bar */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategory(null);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="text-[#f5b8c9] hover:text-white font-bold transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <ArrowLeft className="w-4 h-4" /> OPTIONS
                </button>
                <span>/</span>
                <span className="text-white font-bold uppercase tracking-widest">{activeCategory}</span>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(null);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="text-xs font-mono text-neutral-400 hover:text-[#f5b8c9] transition-colors"
              >
                RETURN TO CATEGORIES
              </button>
            </div>

            {/* CATEGORY 1: GAME */}
            {activeCategory === 'game' && (
              <div className="space-y-8">
                {/* User Profile Handle */}
                <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-4">
                  <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-[#f5b8c9]" /> PLAYER DISPLAY HANDLE
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-400">LOCAL HANDLE (SAVED LOCALLY)</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value.toUpperCase().replace(/\s+/g, '_'));
                        showSaveConfirmation('HANDLE UPDATED');
                      }}
                      className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm font-mono text-white font-bold tracking-wider focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                    />
                  </div>
                </div>

                {/* Sensitivity & DPI Calculator */}
                <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                    <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#f5b8c9]" /> SENSITIVITY & DPI CALCULATOR
                    </h3>
                    <span className="text-xs font-mono bg-[#f5b8c9] text-[#0d0d0d] font-bold px-3 py-1 rounded-[12px]">
                      {cm360} CM / 360°
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-400">TARGET GAME ENGINE</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {engines.map((eng) => (
                        <button
                          key={eng.id}
                          onClick={() => {
                            updateSettings({ engine: eng.id });
                            showSaveConfirmation(`ENGINE SET TO ${eng.label}`);
                          }}
                          className={`py-2.5 rounded-[12px] text-xs font-mono font-bold tracking-wider transition-all border ${
                            settings.engine === eng.id
                              ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                              : 'bg-[#0d0d0d] text-neutral-400 border-[#262626] hover:text-white'
                          }`}
                        >
                          {eng.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-neutral-400">GAME SENSITIVITY</label>
                      <input
                        type="number"
                        step="0.001"
                        value={settings.sensitivity}
                        onChange={(e) => {
                          updateSettings({ sensitivity: parseFloat(e.target.value) || 0.1 });
                          showSaveConfirmation('SENSITIVITY UPDATED');
                        }}
                        className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm font-mono text-white focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-neutral-400">MOUSE DPI</label>
                      <select
                        value={settings.dpi}
                        onChange={(e) => {
                          updateSettings({ dpi: parseInt(e.target.value) });
                          showSaveConfirmation('DPI UPDATED');
                        }}
                        className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm font-mono text-white focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                      >
                        <option value={400}>400 DPI</option>
                        <option value={800}>800 DPI</option>
                        <option value={1200}>1200 DPI</option>
                        <option value={1600}>1600 DPI</option>
                        <option value={3200}>3200 DPI</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#262626]">
                    <label className="text-xs font-mono text-neutral-400">DIRECT TARGET CM/360 INPUT</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cm360}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 5) {
                          const newSens = calculateSensFromCm360(val, settings.dpi, settings.engine);
                          updateSettings({ sensitivity: newSens });
                          showSaveConfirmation('CM/360 UPDATED');
                        }
                      }}
                      className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm font-mono text-[#f5b8c9] font-bold focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                    />
                  </div>
                </div>

                {/* Global Target Pacing Multiplier */}
                <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                    <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[#f5b8c9]" /> GLOBAL TARGET PACING MULTIPLIER
                    </h3>
                    <span className="text-xs font-mono text-white font-bold bg-[#0d0d0d] px-3 py-1 rounded-[12px] border border-[#262626]">
                      {targetSpeedMultiplier}x PACING
                    </span>
                  </div>
                  <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                    Globally scale target movement speeds and timed target exposure windows across all tracking, strafe, and reflex gauntlet scenarios.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                    {speedPacingPresets.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          setTargetSpeedMultiplier(p.value);
                          showSaveConfirmation(`PACING MULTIPLIER SET TO ${p.label}`);
                        }}
                        className={`py-2 rounded-[12px] text-xs font-mono font-bold transition-all border ${
                          targetSpeedMultiplier === p.value
                            ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                            : 'bg-[#0d0d0d] text-neutral-400 border-[#262626] hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Stats History Section */}
                <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 flex items-center justify-between">
                  <div>
                    <span className="font-display font-bold text-sm text-white block">STATS & HISTORY</span>
                    <span className="text-xs font-mono text-neutral-400">Permanently delete stored scores and personal bests</span>
                  </div>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2.5 rounded-[12px] bg-[#1a1a1a] hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-[#262626] hover:border-red-900/50 text-xs font-mono font-bold flex items-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    CLEAR STATS HISTORY
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY 2: CROSSHAIR */}
            {activeCategory === 'crosshair' && <CrosshairStudio />}

            {/* CATEGORY 3: AUDIO */}
            {activeCategory === 'audio' && (
              <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#f5b8c9]" /> AUDIO & SOUND EFFECTS
                  </h3>
                  <button
                    onClick={() => {
                      toggleSound();
                      showSaveConfirmation(!soundEnabled ? 'AUDIO ENABLED' : 'AUDIO MUTED');
                    }}
                    className={`px-3 py-1.5 rounded-[12px] text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                      soundEnabled
                        ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                        : 'bg-[#0d0d0d] text-neutral-500 border-[#262626]'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    {soundEnabled ? 'AUDIO ENABLED' : 'MUTED'}
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-2">
                    <div className="flex justify-between text-neutral-400">
                      <span>MASTER VOLUME</span>
                      <span className="text-white font-bold">{Math.round(masterVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={masterVolume}
                      onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-neutral-400">
                      <span>HIT POP SOUND VOLUME</span>
                      <span className="text-white font-bold">{Math.round(hitVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={hitVolume}
                      onChange={(e) => setHitVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 4: VIDEO (PERFORMANCE MODE) */}
            {activeCategory === 'video' && (
              <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                    <Tv className="w-4 h-4 text-[#f5b8c9]" /> VIDEO & PERFORMANCE MODE
                  </h3>
                  <button
                    onClick={() => {
                      togglePerformanceMode();
                      showSaveConfirmation(!performanceMode ? 'PERFORMANCE MODE ACTIVE (DPR=1)' : 'PERFORMANCE MODE DISABLED');
                    }}
                    className={`px-3.5 py-1.5 rounded-[12px] text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                      performanceMode
                        ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                        : 'bg-[#0d0d0d] text-neutral-400 border-[#262626] hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {performanceMode ? 'PERFORMANCE: ACTIVE (DPR=1)' : 'PERFORMANCE: BALANCED'}
                  </button>
                </div>
                <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                  Disables ambient background particle fields, caps 3D Canvas resolution to 1.0 DPR, and disables non-essential animations to maximize frame rate and eliminate input latency on low-spec hardware.
                </p>

                {/* UI Theme Accent Color Customizer */}
                <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
                  <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                    <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
                      UI THEME ACCENT COLOR
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: themeAccentColor }}
                      />
                      <span className="text-xs font-mono text-white font-bold">{themeAccentColor.toUpperCase()}</span>
                    </div>
                  </div>

                  <p className="font-sans-ui text-xs text-neutral-400">
                    Customizes the primary accent color across all UI chrome, active buttons, focus indicators, and dividers.
                  </p>

                  {/* Contrast Safeguard Warning */}
                  {isLowContrastTarget(themeAccentColor) && (
                    <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-[10px] flex items-center gap-2.5 text-xs font-mono text-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>LOW CONTRAST WARNING: Selected accent color may be difficult to read against dark UI backgrounds!</span>
                    </div>
                  )}

                  {/* Quick-Select Presets */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-neutral-400 font-bold block uppercase">
                      PRESET ACCENT PALETTES
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { name: 'EDITORIAL PINK', hex: '#F5B8C9' },
                        { name: 'VALORANT RED', hex: '#FF3344' },
                        { name: 'NEON CYAN', hex: '#00FFFF' },
                        { name: 'ELECTRIC BLUE', hex: '#3B82F6' },
                        { name: 'LIME GREEN', hex: '#39FF14' },
                      ].map((swatch) => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => {
                            setThemeAccentColor(swatch.hex);
                            showSaveConfirmation(`THEME ACCENT SET TO ${swatch.name}`);
                          }}
                          className={`py-2 px-3 rounded-[10px] text-xs font-mono font-bold transition-all border flex items-center justify-between ${
                            themeAccentColor.toUpperCase() === swatch.hex.toUpperCase()
                              ? 'border-white text-white shadow-md'
                              : 'border-[#262626] text-neutral-400 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: themeAccentColor.toUpperCase() === swatch.hex.toUpperCase() ? swatch.hex : '#141414',
                            color: themeAccentColor.toUpperCase() === swatch.hex.toUpperCase()
                              ? (['#F5B8C9', '#00FFFF', '#39FF14'].includes(swatch.hex) ? '#0d0d0d' : '#ffffff')
                              : undefined,
                          }}
                        >
                          <span>{swatch.name}</span>
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: swatch.hex }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Picker */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]/60 font-mono text-xs">
                    <span className="text-neutral-400">CUSTOM ACCENT HEX COLOR</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeAccentColor}
                        onChange={(e) => {
                          setThemeAccentColor(e.target.value);
                          showSaveConfirmation(`THEME ACCENT SET TO ${e.target.value.toUpperCase()}`);
                        }}
                        className="w-7 h-7 rounded cursor-pointer border border-[#262626] bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeAccentColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isValidHexColor(val)) {
                            setThemeAccentColor(normalizeHexColor(val));
                            showSaveConfirmation(`THEME ACCENT SET TO ${normalizeHexColor(val)}`);
                          }
                        }}
                        className="w-28 bg-[#141414] border border-[#262626] rounded-[8px] px-3 py-1 text-xs font-mono uppercase text-white font-bold"
                      />
                      <button
                        onClick={() => {
                          setThemeAccentColor('#f5b8c9');
                          showSaveConfirmation('RESET TO DEFAULT PINK ACCENT');
                        }}
                        className="px-3 py-1 rounded-[8px] bg-[#141414] hover:bg-[#262626] text-neutral-400 hover:text-white border border-[#262626] text-xs font-mono font-bold"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>

                {/* Target Shape & Parameter Studio */}
                <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
                  <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                    <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
                      TARGET GEOMETRY & PARAMETER STUDIO
                    </label>
                  </div>

                  {/* 3D Live Target Preview */}
                  <TargetPreview3D />

                  {/* Base Shape Selection (7 Geometries) */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-neutral-400 font-bold block uppercase">
                      BASE SHAPE TYPE
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'sphere', label: 'SPHERE' },
                        { id: 'torus', label: 'TORUS' },
                        { id: 'cube', label: 'CUBE' },
                        { id: 'octahedron', label: 'OCTAHEDRON' },
                        { id: 'cylinder', label: 'CYLINDER' },
                        { id: 'cone', label: 'CONE' },
                        { id: 'capsule', label: 'CAPSULE' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setTargetShapeConfig({ shape: s.id as any });
                            showSaveConfirmation(`TARGET SHAPE SET TO ${s.label}`);
                          }}
                          className={`py-2 rounded-[12px] text-xs font-mono font-bold transition-all border ${
                            targetShapeConfig.shape === s.id
                              ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                              : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Adjustable Parameters (Scale, Wireframe, Glow, Rotation) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#262626]/60 font-mono text-xs">
                    {/* Size / Scale Multiplier */}
                    <div className="space-y-1 bg-[#141414] p-3 rounded-[10px] border border-[#262626]">
                      <div className="flex justify-between text-neutral-400">
                        <span>SCALE MULTIPLIER</span>
                        <span className="text-white font-bold">{(targetShapeConfig.scale ?? 1.0).toFixed(2)}X</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={targetShapeConfig.scale ?? 1.0}
                        onChange={(e) => setTargetShapeConfig({ scale: parseFloat(e.target.value) })}
                        className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                      />
                    </div>

                    {/* Emissive Glow Intensity */}
                    <div className="space-y-1 bg-[#141414] p-3 rounded-[10px] border border-[#262626]">
                      <div className="flex justify-between text-neutral-400">
                        <span>GLOW INTENSITY</span>
                        <span className="text-white font-bold">{Math.round((targetShapeConfig.emissiveIntensity ?? 0.65) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.05"
                        value={targetShapeConfig.emissiveIntensity ?? 0.65}
                        onChange={(e) => setTargetShapeConfig({ emissiveIntensity: parseFloat(e.target.value) })}
                        className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                      />
                    </div>

                    {/* Wireframe Toggle */}
                    <div className="flex items-center justify-between bg-[#141414] p-3 rounded-[10px] border border-[#262626]">
                      <span className="text-neutral-400 font-bold">WIREFRAME MODE</span>
                      <button
                        type="button"
                        onClick={() => setTargetShapeConfig({ wireframe: !targetShapeConfig.wireframe })}
                        className={`px-3 py-1 rounded-[8px] text-[10px] font-bold border transition-all ${
                          targetShapeConfig.wireframe
                            ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                            : 'bg-[#0d0d0d] text-neutral-400 border-[#262626]'
                        }`}
                      >
                        {targetShapeConfig.wireframe ? 'ACTIVE' : 'SOLID'}
                      </button>
                    </div>

                    {/* Idle Rotation Toggle */}
                    <div className="flex items-center justify-between bg-[#141414] p-3 rounded-[10px] border border-[#262626]">
                      <span className="text-neutral-400 font-bold">IDLE ROTATION</span>
                      <button
                        type="button"
                        onClick={() => setTargetShapeConfig({ idleRotation: !targetShapeConfig.idleRotation })}
                        className={`px-3 py-1 rounded-[8px] text-[10px] font-bold border transition-all ${
                          targetShapeConfig.idleRotation !== false
                            ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                            : 'bg-[#0d0d0d] text-neutral-400 border-[#262626]'
                        }`}
                      >
                        {targetShapeConfig.idleRotation !== false ? 'ENABLED' : 'STATIC'}
                      </button>
                    </div>
                  </div>

                  {/* Target Color Picker with Contrast Safety Alert */}
                  <div className="space-y-2 pt-2 border-t border-[#262626]/60">
                    <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                      <span>CUSTOM TARGET HEX COLOR</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={targetColor || '#f5b8c9'}
                          onChange={(e) => {
                            setTargetColor(e.target.value);
                            showSaveConfirmation(`TARGET COLOR UPDATED TO ${e.target.value.toUpperCase()}`);
                          }}
                          className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                        />
                        <span className="text-white font-bold">{targetColor || '#f5b8c9'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={targetColor || '#f5b8c9'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTargetColor(val);
                        }}
                        placeholder="#f5b8c9"
                        className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#f5b8c9]"
                      />
                      <button
                        onClick={() => {
                          setTargetColor('#f5b8c9');
                          showSaveConfirmation('TARGET COLOR RESET TO DEFAULT PINK');
                        }}
                        className="px-3 py-2 bg-[#141414] hover:bg-[#262626] text-neutral-400 hover:text-white border border-[#262626] rounded-[12px] text-[10px] font-mono font-bold transition-all"
                      >
                        RESET
                      </button>
                    </div>

                    {/* Low Contrast Warning Alert */}
                    {isLowContrastTarget(targetColor || '#f5b8c9') && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 p-2.5 rounded-[10px] text-amber-400 text-[11px] font-mono">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>LOW CONTRAST WARNING: Target color may blend into dark arena environment!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cosmetic Arena Backdrops & Wall Color */}
                <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
                  <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
                    COSMETIC ARENA BACKDROP & WALL COLOR
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'grid-room', label: 'GRID ROOM' },
                      { id: 'minimal-void', label: 'MINIMAL VOID' },
                      { id: 'gradient-room', label: 'GRADIENT ROOM' },
                    ].map((backdrop) => (
                      <button
                        key={backdrop.id}
                        onClick={() => {
                          setArenaBackdrop(backdrop.id as any);
                          showSaveConfirmation(`BACKDROP SET TO ${backdrop.label}`);
                        }}
                        className={`py-2 rounded-[12px] text-xs font-mono font-bold transition-all border ${
                          arenaBackdrop === backdrop.id
                            ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                            : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white'
                        }`}
                      >
                        {backdrop.label}
                      </button>
                    ))}
                  </div>

                  {/* Arena Wall Color Hex Picker */}
                  <div className="space-y-2 pt-2 border-t border-[#262626]/60">
                    <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                      <span>ARENA WALL HEX COLOR</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={arenaColor || '#121212'}
                          onChange={(e) => {
                            setArenaColor(e.target.value);
                            showSaveConfirmation(`ARENA COLOR UPDATED TO ${e.target.value.toUpperCase()}`);
                          }}
                          className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                        />
                        <span className="text-white font-bold">{arenaColor || '#121212'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={arenaColor || '#121212'}
                        onChange={(e) => setArenaColor(e.target.value)}
                        placeholder="#121212"
                        className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#f5b8c9]"
                      />
                      <button
                        onClick={() => {
                          setArenaColor('#121212');
                          showSaveConfirmation('ARENA COLOR RESET TO DEFAULT');
                        }}
                        className="px-3 py-2 bg-[#141414] hover:bg-[#262626] text-neutral-400 hover:text-white border border-[#262626] rounded-[12px] text-[10px] font-mono font-bold transition-all"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 5: CONTROLS */}
            {activeCategory === 'controls' && (
              <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-[#f5b8c9]" /> KEYBIND REBINDING STUDIO
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">CUSTOM HOTKEYS</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
                    <div>
                      <span className="font-display font-bold text-sm text-white block">PAUSE / UNLOCK</span>
                      <span className="text-[10px] font-mono text-neutral-400">Pauses active session and unlocks pointer</span>
                    </div>
                    <button
                      onClick={() => setListeningKeyFor('pause')}
                      className={`px-4 py-2 rounded-[12px] font-mono text-xs font-bold border transition-all ${
                        listeningKeyFor === 'pause'
                          ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9] animate-pulse'
                          : 'bg-[#1a1a1a] text-white border-[#2d2d2d] hover:border-[#f5b8c9]'
                      }`}
                    >
                      {listeningKeyFor === 'pause' ? 'PRESS ANY KEY...' : pauseKey}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
                    <div>
                      <span className="font-display font-bold text-sm text-white block">QUICK RESTART</span>
                      <span className="text-[10px] font-mono text-neutral-400">Instantly restarts current scenario</span>
                    </div>
                    <button
                      onClick={() => setListeningKeyFor('restart')}
                      className={`px-4 py-2 rounded-[12px] font-mono text-xs font-bold border transition-all ${
                        listeningKeyFor === 'restart'
                          ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9] animate-pulse'
                          : 'bg-[#1a1a1a] text-white border-[#2d2d2d] hover:border-[#f5b8c9]'
                      }`}
                    >
                      {listeningKeyFor === 'restart' ? 'PRESS ANY KEY...' : restartKey}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
