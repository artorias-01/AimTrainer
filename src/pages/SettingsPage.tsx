import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import { useStatsStore } from '../store/useStatsStore';
import { CrosshairPreview } from '../components/ui/CrosshairPreview';
import { calculateSensFromCm360 } from '../utils/sensitivity';
import type { GameEngine } from '../utils/sensitivity';
import { isValidHexColor, normalizeHexColor, parseGenericCrosshairCode, exportCrosshairConfigToJSON } from '../utils/crosshairImporter';
import {
  getSavedCrosshairPresets,
  saveCrosshairPreset,
  deleteCrosshairPreset,
} from '../utils/storage';
import type { SavedCrosshairPreset } from '../utils/storage';
import { soundManager } from '../utils/audio';
import {
  Sliders,
  Crosshair,
  Check,
  Volume2,
  VolumeX,
  Keyboard,
  User,
  Download,
  Copy,
  Trash2,
  CheckCircle2,
  Gauge,
  AlertCircle,
  Cpu,
  Save,
  Zap,
  ArrowLeft,
  Tv,
  Gamepad2,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const {
    settings,
    updateSettings,
    crosshair,
    updateCrosshair,
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
  } = useSettingsStore();

  const { clearHistory } = useStatsStore();

  const [activeCategory, setActiveCategory] = useState<
    'game' | 'crosshair' | 'audio' | 'video' | 'controls' | null
  >(null);

  const [listeningKeyFor, setListeningKeyFor] = useState<'pause' | 'restart' | null>(null);
  const [hexInput, setHexInput] = useState(crosshair.color || '#F5B8C9');
  const [hexError, setHexError] = useState<string | null>(null);
  const [dotHexInput, setDotHexInput] = useState(crosshair.dotColor || crosshair.color || '#F5B8C9');
  const [outlineHexInput, setOutlineHexInput] = useState(crosshair.outlineColor || '#000000');
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [savedPresets, setSavedPresets] = useState<SavedCrosshairPreset[]>(getSavedCrosshairPresets);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const showSaveConfirmation = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2000);
  };

  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    const updated = saveCrosshairPreset(presetNameInput, crosshair);
    setSavedPresets(updated);
    setPresetNameInput('');
    showSaveConfirmation(`SAVED PRESET: ${presetNameInput.toUpperCase()}`);
  };

  const handleDeletePreset = (id: string) => {
    const updated = deleteCrosshairPreset(id);
    setSavedPresets(updated);
    if (selectedPresetId === id) setSelectedPresetId('');
    showSaveConfirmation('PRESET DELETED');
  };

  const handleLoadPreset = (preset: SavedCrosshairPreset) => {
    updateCrosshair(preset.config);
    setHexInput(preset.config.color || '#F5B8C9');
    setDotHexInput(preset.config.dotColor || preset.config.color || '#F5B8C9');
    setOutlineHexInput(preset.config.outlineColor || '#000000');
    setHexError(null);
    setSelectedPresetId(preset.id);
    showSaveConfirmation(`LOADED PRESET: ${preset.name.toUpperCase()}`);
  };

  const engines: { id: GameEngine; label: string }[] = [
    { id: 'valorant', label: 'VALORANT' },
    { id: 'cs2', label: 'CS2 / SOURCE' },
    { id: 'overwatch', label: 'OVERWATCH 2' },
    { id: 'apex', label: 'APEX LEGENDS' },
  ];

  const presetSwatches = [
    { name: 'EDITORIAL PINK', hex: '#F5B8C9' },
    { name: 'PURE WHITE', hex: '#FFFFFF' },
    { name: 'NEON LIME', hex: '#39FF14' },
    { name: 'CYAN GLOW', hex: '#00FFFF' },
    { name: 'VIBRANT ORANGE', hex: '#FF6600' },
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

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);

    if (!val.trim()) {
      setHexError('PLEASE ENTER A HEX COLOR CODE (E.G. #39FF14)');
      return;
    }

    if (isValidHexColor(val)) {
      setHexError(null);
      const normalized = normalizeHexColor(val);
      updateCrosshair({ color: normalized });
      showSaveConfirmation(`COLOR SET TO ${normalized}`);
    } else {
      setHexError('INVALID HEX COLOR — USE FORMAT #RRGGBB OR #RGB (E.G. #39FF14)');
    }
  };

  const handleSelectPresetColor = (hex: string, name: string) => {
    setHexInput(hex);
    setHexError(null);
    updateCrosshair({ color: hex });
    showSaveConfirmation(`COLOR SET TO ${name}`);
  };

  const handleImportJsonCode = () => {
    if (!importCodeInput.trim()) {
      setImportStatusMsg('PLEASE PASTE A VALID JSON CROSSHAIR CONFIG');
      return;
    }
    const parsed = parseGenericCrosshairCode(importCodeInput);
    if (parsed) {
      updateCrosshair(parsed);
      setHexInput(parsed.color || '#F5B8C9');
      setDotHexInput(parsed.dotColor || parsed.color || '#F5B8C9');
      setOutlineHexInput(parsed.outlineColor || '#000000');
      setHexError(null);
      setImportStatusMsg('SUCCESSFULLY IMPORTED CROSSHAIR CONFIG!');
      showSaveConfirmation('CROSSHAIR CONFIG IMPORTED');
      setTimeout(() => setImportStatusMsg(null), 3000);
    } else {
      setImportStatusMsg('INVALID JSON FORMAT — COULD NOT PARSE CONFIG');
    }
  };

  const handleExportCode = () => {
    const jsonStr = exportCrosshairConfigToJSON(crosshair);
    navigator.clipboard.writeText(jsonStr);
    setCopiedMsg(true);
    showSaveConfirmation('JSON COPIED TO CLIPBOARD');
    setTimeout(() => setCopiedMsg(false), 2500);
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
      className="w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 focus:outline-none select-none"
    >
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
            {activeCategory === 'crosshair' && (
              <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-[#f5b8c9]" /> CUSTOM CROSSHAIR STUDIO
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">REAL-TIME PREVIEW</span>
                </div>

                <div className="flex justify-center py-4">
                  <CrosshairPreview config={crosshair} sizePx={200} />
                </div>

                {/* Saved Named Crosshair Presets Manager */}
                <div className="space-y-3 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
                  <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block">
                    SAVED NAMED CROSSHAIR PRESETS
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => {
                        const presetId = e.target.value;
                        if (!presetId) return;
                        const found = savedPresets.find((p) => p.id === presetId);
                        if (found) {
                          handleLoadPreset(found);
                        }
                      }}
                      className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#f5b8c9]"
                    >
                      <option value="">-- SELECT SAVED PRESET ({savedPresets.length}) --</option>
                      {savedPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {selectedPresetId && (
                      <button
                        onClick={() => handleDeletePreset(selectedPresetId)}
                        className="px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded-[12px] text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all"
                        title="Delete Selected Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="e.g. My Precision X or Dot Only"
                      value={presetNameInput}
                      onChange={(e) => setPresetNameInput(e.target.value)}
                      className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#f5b8c9]"
                    />
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetNameInput.trim()}
                      className="btn-editorial-pink px-4 py-2 text-xs font-bold uppercase flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3.5 h-3.5" /> SAVE PRESET
                    </button>
                  </div>
                </div>

                {/* Line Color Hex Input */}
                <div className="space-y-3 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
                  <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block">
                    LINE COLOR (HEX CODE)
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-[8px] border border-[#333] shrink-0"
                      style={{ backgroundColor: crosshair.color || '#f5b8c9' }}
                    />
                    <input
                      type="text"
                      placeholder="#F5B8C9 or #FFF"
                      value={hexInput}
                      onChange={handleHexChange}
                      className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] px-4 py-2.5 text-xs font-mono text-white font-bold uppercase focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                    />
                  </div>

                  {hexError && (
                    <div className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{hexError}</span>
                    </div>
                  )}
                </div>

                {/* Preset Color Swatches */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400">PRESET COLOR SWATCHES</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {presetSwatches.map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => handleSelectPresetColor(swatch.hex, swatch.name)}
                        className={`py-2 px-3 rounded-[12px] text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                          crosshair.color?.toUpperCase() === swatch.hex.toUpperCase()
                            ? 'border-[#f5b8c9] ring-1 ring-[#f5b8c9]'
                            : 'border-[#262626]'
                        }`}
                        style={{
                          backgroundColor: swatch.hex,
                          color: swatch.hex === '#FFFFFF' || swatch.hex === '#F5B8C9' || swatch.hex === '#39FF14' || swatch.hex === '#00FFFF' ? '#0d0d0d' : '#ffffff',
                        }}
                      >
                        {crosshair.color?.toUpperCase() === swatch.hex.toUpperCase() && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400">CROSSHAIR SHAPE</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(['cross-dot', 'cross', 'dot', 'circle', 't-shape', 'x-shape'] as const).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => {
                          updateCrosshair({ type: shape });
                          showSaveConfirmation(`SHAPE SET TO ${shape.toUpperCase()}`);
                        }}
                        className={`py-2 rounded-[12px] text-[10px] font-mono uppercase font-bold transition-all border ${
                          crosshair.type === shape
                            ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                            : 'bg-[#0d0d0d] text-neutral-400 border-[#262626] hover:text-white'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fine Geometry Tuning Sliders */}
                <div className="space-y-4 pt-2 border-t border-[#262626]">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>LINE LENGTH / SIZE</span>
                      <span className="text-white font-bold">{crosshair.size} PX</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      step="1"
                      value={crosshair.size}
                      onChange={(e) => updateCrosshair({ size: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>LINE THICKNESS</span>
                      <span className="text-white font-bold">{crosshair.thickness} PX</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={crosshair.thickness}
                      onChange={(e) => updateCrosshair({ thickness: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>CENTER GAP / OFFSET</span>
                      <span className="text-white font-bold">{crosshair.gap} PX</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={crosshair.gap}
                      onChange={(e) => updateCrosshair({ gap: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>OVERALL OPACITY</span>
                      <span className="text-white font-bold">{Math.round((crosshair.opacity || 1.0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={crosshair.opacity || 1.0}
                      onChange={(e) => updateCrosshair({ opacity: parseFloat(e.target.value) })}
                      className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                    />
                  </div>
                </div>

                {/* Center Dot Controls Card */}
                <div className="space-y-3 bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest">
                      CENTER DOT CONTROLS
                    </label>
                    <button
                      onClick={() => {
                        const currentShowDot = crosshair.showDot !== undefined ? crosshair.showDot : (crosshair.type === 'dot' || crosshair.type === 'cross-dot');
                        updateCrosshair({ showDot: !currentShowDot });
                      }}
                      className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
                        (crosshair.showDot !== undefined ? crosshair.showDot : (crosshair.type === 'dot' || crosshair.type === 'cross-dot'))
                          ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                          : 'bg-[#141414] text-neutral-500 border-[#262626]'
                      }`}
                    >
                      {(crosshair.showDot !== undefined ? crosshair.showDot : (crosshair.type === 'dot' || crosshair.type === 'cross-dot')) ? 'DOT: ON' : 'DOT: OFF'}
                    </button>
                  </div>

                  {(crosshair.showDot !== undefined ? crosshair.showDot : (crosshair.type === 'dot' || crosshair.type === 'cross-dot')) && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-neutral-400">
                          <span>DOT SIZE</span>
                          <span className="text-white font-bold">{crosshair.dotSize} PX</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={crosshair.dotSize}
                          onChange={(e) => updateCrosshair({ dotSize: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 block">DOT COLOR (HEX)</span>
                        <input
                          type="text"
                          placeholder="#F5B8C9"
                          value={dotHexInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDotHexInput(val);
                            if (isValidHexColor(val)) {
                              updateCrosshair({ dotColor: normalizeHexColor(val) });
                            }
                          }}
                          className="w-full bg-[#141414] border border-[#262626] rounded-[8px] px-3 py-1.5 text-xs font-mono text-white font-bold uppercase focus:outline-none focus:border-[#f5b8c9]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Outline Controls Card */}
                <div className="space-y-3 bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest">
                      OUTLINE CONTROLS
                    </label>
                    <button
                      onClick={() => updateCrosshair({ outline: !crosshair.outline })}
                      className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
                        crosshair.outline
                          ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                          : 'bg-[#141414] text-neutral-500 border-[#262626]'
                      }`}
                    >
                      {crosshair.outline ? 'OUTLINE: ON' : 'OUTLINE: OFF'}
                    </button>
                  </div>

                  {crosshair.outline && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-neutral-400">
                          <span>OUTLINE THICKNESS</span>
                          <span className="text-white font-bold">{crosshair.outlineThickness || 1.5} PX</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="4"
                          step="0.5"
                          value={crosshair.outlineThickness || 1.5}
                          onChange={(e) => updateCrosshair({ outlineThickness: parseFloat(e.target.value) })}
                          className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 block">OUTLINE COLOR (HEX)</span>
                        <input
                          type="text"
                          placeholder="#000000"
                          value={outlineHexInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOutlineHexInput(val);
                            if (isValidHexColor(val)) {
                              updateCrosshair({ outlineColor: normalizeHexColor(val) });
                            }
                          }}
                          className="w-full bg-[#141414] border border-[#262626] rounded-[8px] px-3 py-1.5 text-xs font-mono text-white font-bold uppercase focus:outline-none focus:border-[#f5b8c9]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* JSON Config Import & Export */}
                <div className="space-y-3 bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
                  <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block">
                    GENERIC JSON CONFIG IMPORT & EXPORT
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder='Paste JSON config e.g. {"type":"cross","size":12,"color":"#39FF14"}'
                      value={importCodeInput}
                      onChange={(e) => setImportCodeInput(e.target.value)}
                      className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#f5b8c9]"
                    />
                    <button
                      onClick={handleImportJsonCode}
                      className="btn-editorial-pink px-4 py-2 text-xs font-bold uppercase flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> IMPORT
                    </button>
                  </div>

                  {importStatusMsg && (
                    <p className={`text-[10px] font-mono font-bold ${importStatusMsg.includes('SUCCESS') ? 'text-green-400' : 'text-red-400'}`}>
                      {importStatusMsg}
                    </p>
                  )}

                  <button
                    onClick={handleExportCode}
                    className="w-full py-2 bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#2d2d2d] rounded-[12px] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#f5b8c9]" />
                    {copiedMsg ? 'COPIED TO CLIPBOARD!' : 'EXPORT CURRENT CONFIG (JSON)'}
                  </button>
                </div>
              </div>
            )}

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
  );
};
