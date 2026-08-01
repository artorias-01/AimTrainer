import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Play, RotateCcw, Home, Sliders, Volume2, VolumeX } from 'lucide-react';
import type { GameEngine } from '../../utils/sensitivity';

interface PauseModalProps {
  onNavigate: (page: string) => void;
  onResume: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onNavigate, onResume }) => {
  const { activeScenario, startSession } = useGameStore();
  const { settings, updateSettings, masterVolume, setMasterVolume, soundEnabled, toggleSound, cm360 } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-[#0d0d0d] border border-[#262626] rounded-[12px] text-white p-8 max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div>
            <span className="text-[10px] font-mono text-pink tracking-widest uppercase">
              SESSION PAUSED
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white">
              {activeScenario.name}
            </h2>
          </div>
          <span className="text-xs font-mono bg-[#1a1a1a] px-3 py-1.5 rounded-[12px] text-neutral-400 border border-[#2d2d2d]">
            ESC TO RESUME
          </span>
        </div>

        {/* Quick Settings Adjustment */}
        <div className="space-y-4 bg-[#141414] p-5 rounded-[12px] border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-pink" /> LIVE SENSITIVITY PRESET
            </span>
            <span className="text-xs font-mono text-pink font-bold">
              {cm360} cm / 360°
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sensitivity Slider */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400">SENSITIVITY</label>
              <input
                type="range"
                min="0.05"
                max="3.0"
                step="0.01"
                value={settings.sensitivity}
                onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
                className="w-full accent-pink bg-[#262626] rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>0.05</span>
                <span className="text-white font-bold">{settings.sensitivity}</span>
                <span>3.00</span>
              </div>
            </div>

            {/* DPI */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400">DPI</label>
              <select
                value={settings.dpi}
                onChange={(e) => updateSettings({ dpi: parseInt(e.target.value) })}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-2 text-xs font-mono text-white focus:outline-none focus:border-pink"
              >
                <option value={400}>400 DPI</option>
                <option value={800}>800 DPI</option>
                <option value={1200}>1200 DPI</option>
                <option value={1600}>1600 DPI</option>
                <option value={3200}>3200 DPI</option>
              </select>
            </div>
          </div>

          {/* Engine Selector */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-mono text-neutral-400">GAME ENGINE SENS PRESET</label>
            <div className="grid grid-cols-4 gap-2">
              {(['valorant', 'cs2', 'overwatch', 'apex'] as GameEngine[]).map((eng) => (
                <button
                  key={eng}
                  onClick={() => updateSettings({ engine: eng })}
                  className={`py-1.5 rounded-[12px] text-[10px] font-mono uppercase font-bold transition-all border ${
                    settings.engine === eng
                      ? 'bg-pink text-[#0d0d0d] border-pink'
                      : 'bg-[#0d0d0d] text-neutral-400 border-[#262626] hover:text-white'
                  }`}
                >
                  {eng}
                </button>
              ))}
            </div>
          </div>

          {/* Master Volume */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleSound}
              className="flex items-center gap-2 text-xs font-mono text-neutral-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-pink" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
              <span>AUDIO</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-36 accent-pink bg-[#262626] rounded-lg h-1.5"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onResume}
              className="btn-editorial-pink flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-[#0d0d0d]" />
              RESUME DRILL
            </button>

            <button
              onClick={() => {
                startSession();
                onResume();
              }}
              className="btn-editorial-secondary flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase text-white border-[#262626] hover:bg-[#262626] tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              RESTART
            </button>
          </div>

          <button
            onClick={() => {
              if (document.pointerLockElement) {
                document.exitPointerLock();
              }
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onNavigate('landing');
            }}
            className="w-full py-3.5 rounded-[12px] bg-[#1a1a1a] hover:bg-[#b91c1c] text-white hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#262626] transition-all"
          >
            <Home className="w-4 h-4" />
            EXIT DRILL (QUIT TO MAIN MENU)
          </button>
        </div>
      </div>
    </div>
  );
};
