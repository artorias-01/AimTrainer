import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Target, Library, BarChart3, Sliders, Layers } from 'lucide-react';
import { getAllScenarios, PRESET_ROUTINES } from '../../utils/scenarios';
import { useGameStore } from '../../store/useGameStore';
import { soundManager } from '../../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { setScenario, startRoutine } = useGameStore();

  const scenarios = getAllScenarios();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredRoutines = PRESET_ROUTINES.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase())
  );

  const pages = [
    { id: 'library', name: 'DRILL LIBRARY', icon: Library },
    { id: 'dashboard', name: 'ANALYTICS DASHBOARD', icon: BarChart3 },
    { id: 'settings', name: 'OPTIONS & CONFIGURATION', icon: Sliders },
  ].filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelectScenario = (id: string) => {
    soundManager.playClick();
    setScenario(id);
    onNavigate('arena', id);
    onClose();
  };

  const handleSelectRoutine = (routine: any) => {
    soundManager.playClick();
    startRoutine(routine);
    onNavigate('arena');
    onClose();
  };

  const handleSelectPage = (pageId: string) => {
    soundManager.playClick();
    onNavigate(pageId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#141414] border border-pink rounded-[12px] max-w-xl w-full overflow-hidden shadow-2xl text-left"
      >
        <div className="flex items-center gap-3 p-4 border-b border-[#262626] bg-[#0d0d0d]">
          <Search className="w-5 h-5 text-pink" />
          <input
            type="text"
            autoFocus
            placeholder="Type a drill name, category, or page... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-white placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-neutral-400 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#262626]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-[#262626] font-mono text-xs">
          {/* Quick Navigation Pages */}
          {pages.length > 0 && (
            <div className="py-2 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest px-3 block font-bold">
                PAGES
              </span>
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPage(p.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-full flex items-center justify-between p-2.5 rounded-[8px] hover:bg-pink/10 text-neutral-300 hover:text-pink transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-pink" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">JUMP TO PAGE</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Warmup Routines */}
          {filteredRoutines.length > 0 && (
            <div className="py-2 space-y-1">
              <span className="text-[10px] text-pink uppercase tracking-widest px-3 block font-bold">
                WARMUP ROUTINES
              </span>
              {filteredRoutines.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoutine(r)}
                  onMouseEnter={() => soundManager.playHover()}
                  className="w-full flex items-center justify-between p-2.5 rounded-[8px] hover:bg-pink/10 text-neutral-300 hover:text-pink transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-pink" />
                    <span className="font-bold">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">{r.drillIds.length} DRILLS</span>
                </button>
              ))}
            </div>
          )}

          {/* Training Scenarios */}
          {filteredScenarios.length > 0 && (
            <div className="py-2 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest px-3 block font-bold">
                DRILLS ({filteredScenarios.length})
              </span>
              {filteredScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  onMouseEnter={() => soundManager.playHover()}
                  className="w-full flex items-center justify-between p-2.5 rounded-[8px] hover:bg-pink/10 text-neutral-300 hover:text-pink transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-neutral-400 group-hover:text-pink" />
                    <span className="font-bold">{sc.name}</span>
                    {sc.isCustom && (
                      <span className="text-[9px] bg-pink text-[#0d0d0d] font-bold px-1.5 py-0.5 rounded">CUSTOM</span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 uppercase">
                    {sc.category} // {sc.durationSeconds}S
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
