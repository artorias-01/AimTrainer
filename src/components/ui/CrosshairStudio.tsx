import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CrosshairPreview } from './CrosshairPreview';
import { HexColorInput } from './HexColorInput';
import {
  migrateCrosshairConfig,
  getSavedCrosshairPresets,
  saveSavedCrosshairPresets,
  type SavedCrosshairPreset,
} from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import {
  Crosshair,
  Save,
  Trash2,
  Copy,
  Download,
} from 'lucide-react';

const presetSwatches = [
  { name: 'PINK', hex: '#F5B8C9' },
  { name: 'GREEN', hex: '#39FF14' },
  { name: 'CYAN', hex: '#00FFFF' },
  { name: 'YELLOW', hex: '#FFFF00' },
  { name: 'WHITE', hex: '#FFFFFF' },
  { name: 'RED', hex: '#FF3333' },
];

export const CrosshairStudio: React.FC = () => {
  const { crosshair, updateCrosshair, setScenarioCrosshair } = useSettingsStore();
  const c = migrateCrosshairConfig(crosshair);

  const [savedPresets, setSavedPresets] = useState<SavedCrosshairPreset[]>(() =>
    getSavedCrosshairPresets()
  );
  const [presetNameInput, setPresetNameInput] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState<string | null>(null);

  const showSaveConfirmation = (msg: string) => {
    setSaveConfirmation(msg);
    setTimeout(() => setSaveConfirmation(null), 2500);
  };

  const updateInner = (p: Partial<typeof c.innerLines>) => {
    updateCrosshair({ innerLines: { ...c.innerLines, ...p } });
  };

  const updateOuter = (p: Partial<typeof c.outerLines>) => {
    updateCrosshair({ outerLines: { ...c.outerLines, ...p } });
  };

  const updateDotConfig = (p: Partial<typeof c.dot>) => {
    updateCrosshair({ dot: { ...c.dot, ...p } });
  };

  const updateOutlineConfig = (p: Partial<typeof c.outline>) => {
    updateCrosshair({ outline: { ...c.outline, ...p } });
  };

  const setAllColors = (colorHex: string) => {
    updateCrosshair({
      color: colorHex,
      innerLines: { ...c.innerLines, color: colorHex },
      outerLines: { ...c.outerLines, color: colorHex },
      dot: { ...c.dot, color: colorHex },
    });
    showSaveConfirmation(`ALL ELEMENTS COLOR SET TO ${colorHex.toUpperCase()}`);
  };

  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: SavedCrosshairPreset = {
      id: `preset_${Date.now()}`,
      name: presetNameInput.trim().toUpperCase(),
      config: JSON.parse(JSON.stringify(c)),
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    saveSavedCrosshairPresets(updated);
    setPresetNameInput('');
    setSelectedPresetId(newPreset.id);
    soundManager.playClick();
    showSaveConfirmation(`SAVED PRESET: ${newPreset.name}`);
  };

  const handleLoadPreset = (preset: SavedCrosshairPreset) => {
    updateCrosshair(preset.config);
    setSelectedPresetId(preset.id);
    soundManager.playClick();
    showSaveConfirmation(`LOADED PRESET: ${preset.name}`);
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    saveSavedCrosshairPresets(updated);
    if (selectedPresetId === id) setSelectedPresetId('');
    soundManager.playClick();
    showSaveConfirmation('PRESET DELETED');
  };

  const handleExportCode = () => {
    navigator.clipboard.writeText(JSON.stringify(c, null, 2));
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
    soundManager.playClick();
  };

  const handleImportJsonCode = () => {
    if (!importCodeInput.trim()) return;
    try {
      const parsed = JSON.parse(importCodeInput.trim());
      updateCrosshair(parsed);
      setImportStatusMsg('SUCCESSFULLY IMPORTED CONFIG!');
      setImportCodeInput('');
      soundManager.playClick();
      setTimeout(() => setImportStatusMsg(null), 3000);
    } catch {
      setImportStatusMsg('ERROR: INVALID JSON STRING');
      setTimeout(() => setImportStatusMsg(null), 3000);
    }
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#f5b8c9]" /> VALORANT-STYLE CROSSHAIR STUDIO
        </h3>
        <span className="text-xs font-mono text-neutral-400">MULTI-LAYER ENGINE</span>
      </div>

      {saveConfirmation && (
        <div className="bg-[#141414] border border-[#f5b8c9] text-[#f5b8c9] p-3 rounded-[12px] font-mono text-xs font-bold text-center">
          {saveConfirmation}
        </div>
      )}

      {/* Real-time Preview with Background Swatches */}
      <div className="flex justify-center py-4 bg-[#0d0d0d] rounded-[12px] border border-[#262626] p-4">
        <CrosshairPreview config={c} sizePx={200} showSwatchPicker={true} />
      </div>

      {/* Saved Named Crosshair Presets Manager */}
      <div className="space-y-3 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
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

      {/* Per-Scenario Crosshair Profile Assignment */}
      <div className="space-y-3 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
          ASSIGN CROSSHAIR PRESET TO SPECIFIC DRILL OR CATEGORY
        </label>
        <p className="font-sans-ui text-xs text-neutral-400">
          Automatically override active crosshair when launching specific scenarios (e.g. dot for precision, cross for clicking).
        </p>
        <div className="flex gap-2">
          <select
            id="scenario-crosshair-select-studio"
            className="flex-1 bg-[#141414] border border-[#262626] rounded-[12px] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#f5b8c9]"
          >
            <option value="tracking">CATEGORY: TRACKING</option>
            <option value="clicking">CATEGORY: CLICKING</option>
            <option value="precision">CATEGORY: PRECISION</option>
            <option value="switching">CATEGORY: SWITCHING</option>
          </select>

          <button
            onClick={() => {
              const sel = document.getElementById('scenario-crosshair-select-studio') as HTMLSelectElement;
              if (sel && selectedPresetId) {
                setScenarioCrosshair(sel.value, selectedPresetId);
                showSaveConfirmation(`ASSIGNED PRESET TO ${sel.value.toUpperCase()}`);
              } else {
                showSaveConfirmation('PLEASE SELECT A SAVED PRESET FIRST');
              }
            }}
            className="btn-editorial-pink px-4 py-2 text-xs font-bold uppercase"
          >
            LINK PRESET
          </button>
        </div>
      </div>

      {/* Quick Global Color Shortcut */}
      <div className="space-y-3 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>QUICK SET ALL ELEMENTS COLOR</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={c.color || '#f5b8c9'}
              onChange={(e) => setAllColors(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
            />
            <span className="text-white font-bold">{c.color || '#f5b8c9'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {presetSwatches.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => setAllColors(swatch.hex)}
              className="py-1.5 px-2 rounded-[8px] text-[10px] font-mono font-bold border transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: swatch.hex,
                color: ['#FFFFFF', '#F5B8C9', '#39FF14', '#00FFFF', '#FFFF00'].includes(swatch.hex) ? '#0d0d0d' : '#ffffff',
              }}
            >
              <span>{swatch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. INNER LINES LAYER CONTROLS */}
      <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <span className="text-[10px] font-mono text-[#f5b8c9] font-bold uppercase tracking-widest">
            1. INNER LINES
          </span>
          <button
            type="button"
            onClick={() => updateInner({ show: !c.innerLines.show })}
            className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
              c.innerLines.show ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]' : 'bg-[#141414] text-neutral-500 border-[#262626]'
            }`}
          >
            {c.innerLines.show ? 'SHOW: ON' : 'SHOW: OFF'}
          </button>
        </div>

        {c.innerLines.show && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>INNER LINE LENGTH</span>
                  <span className="text-white font-bold">{c.innerLines.length} PX</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={c.innerLines.length}
                  onChange={(e) => updateInner({ length: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>INNER LINE THICKNESS</span>
                  <span className="text-white font-bold">{c.innerLines.thickness} PX</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={c.innerLines.thickness}
                  onChange={(e) => updateInner({ thickness: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>INNER LINE OFFSET (GAP)</span>
                  <span className="text-white font-bold">{c.innerLines.offset} PX</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={c.innerLines.offset}
                  onChange={(e) => updateInner({ offset: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>INNER LINE OPACITY</span>
                  <span className="text-white font-bold">{Math.round(c.innerLines.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={c.innerLines.opacity}
                  onChange={(e) => updateInner({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <span className="text-neutral-400">INNER LINE COLOR</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.innerLines.color}
                  onChange={(e) => updateInner({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                />
                <HexColorInput
                  value={c.innerLines.color}
                  onChange={(val) => updateInner({ color: val })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. OUTER LINES LAYER CONTROLS */}
      <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <span className="text-[10px] font-mono text-[#f5b8c9] font-bold uppercase tracking-widest">
            2. OUTER LINES
          </span>
          <button
            type="button"
            onClick={() => updateOuter({ show: !c.outerLines.show })}
            className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
              c.outerLines.show ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]' : 'bg-[#141414] text-neutral-500 border-[#262626]'
            }`}
          >
            {c.outerLines.show ? 'SHOW: ON' : 'SHOW: OFF'}
          </button>
        </div>

        {c.outerLines.show && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTER LINE LENGTH</span>
                  <span className="text-white font-bold">{c.outerLines.length} PX</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={c.outerLines.length}
                  onChange={(e) => updateOuter({ length: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTER LINE THICKNESS</span>
                  <span className="text-white font-bold">{c.outerLines.thickness} PX</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={c.outerLines.thickness}
                  onChange={(e) => updateOuter({ thickness: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTER LINE OFFSET</span>
                  <span className="text-white font-bold">{c.outerLines.offset} PX</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={c.outerLines.offset}
                  onChange={(e) => updateOuter({ offset: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTER LINE OPACITY</span>
                  <span className="text-white font-bold">{Math.round(c.outerLines.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={c.outerLines.opacity}
                  onChange={(e) => updateOuter({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <span className="text-neutral-400">OUTER LINE COLOR</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.outerLines.color}
                  onChange={(e) => updateOuter({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                />
                <HexColorInput
                  value={c.outerLines.color}
                  onChange={(val) => updateOuter({ color: val })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CENTER DOT CONTROLS */}
      <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <span className="text-[10px] font-mono text-[#f5b8c9] font-bold uppercase tracking-widest">
            3. CENTER DOT
          </span>
          <button
            type="button"
            onClick={() => updateDotConfig({ show: !c.dot.show })}
            className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
              c.dot.show ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]' : 'bg-[#141414] text-neutral-500 border-[#262626]'
            }`}
          >
            {c.dot.show ? 'SHOW: ON' : 'SHOW: OFF'}
          </button>
        </div>

        {c.dot.show && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>CENTER DOT SIZE</span>
                  <span className="text-white font-bold">{c.dot.size} PX</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={c.dot.size}
                  onChange={(e) => updateDotConfig({ size: parseInt(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>CENTER DOT OPACITY</span>
                  <span className="text-white font-bold">{Math.round(c.dot.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={c.dot.opacity}
                  onChange={(e) => updateDotConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <span className="text-neutral-400">CENTER DOT COLOR</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.dot.color}
                  onChange={(e) => updateDotConfig({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                />
                <HexColorInput
                  value={c.dot.color}
                  onChange={(val) => updateDotConfig({ color: val })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. OUTLINE CONTROLS */}
      <div className="space-y-4 bg-[#0d0d0d] p-5 rounded-[12px] border border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <span className="text-[10px] font-mono text-[#f5b8c9] font-bold uppercase tracking-widest">
            4. ELEMENT OUTLINES
          </span>
          <button
            type="button"
            onClick={() => updateOutlineConfig({ show: !c.outline.show })}
            className={`px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-all ${
              c.outline.show ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]' : 'bg-[#141414] text-neutral-500 border-[#262626]'
            }`}
          >
            {c.outline.show ? 'SHOW: ON' : 'SHOW: OFF'}
          </button>
        </div>

        {c.outline.show && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTLINE THICKNESS</span>
                  <span className="text-white font-bold">{c.outline.thickness} PX</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  value={c.outline.thickness}
                  onChange={(e) => updateOutlineConfig({ thickness: parseFloat(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>OUTLINE OPACITY</span>
                  <span className="text-white font-bold">{Math.round(c.outline.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={c.outline.opacity}
                  onChange={(e) => updateOutlineConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#f5b8c9] bg-[#262626] rounded-lg h-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <span className="text-neutral-400">OUTLINE COLOR</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.outline.color}
                  onChange={(e) => updateOutlineConfig({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent"
                />
                <HexColorInput
                  value={c.outline.color}
                  onChange={(val) => updateOutlineConfig({ color: val })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* JSON Config Import & Export */}
      <div className="space-y-3 bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
        <label className="text-[10px] font-mono text-[#f5b8c9] uppercase tracking-widest block font-bold">
          GENERIC JSON CONFIG IMPORT & EXPORT
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='Paste JSON config e.g. {"innerLines":{"show":true,"length":6},"dot":{"show":true}}'
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
  );
};
