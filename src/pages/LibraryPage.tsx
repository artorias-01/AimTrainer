import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SCENARIOS } from '../utils/scenarios';
import type { ScenarioDef } from '../utils/scenarios';
import { Card3DTilt } from '../components/3d/Card3DTilt';
import { useStatsStore } from '../store/useStatsStore';
import { soundManager } from '../utils/audio';
import { Play, Trophy, Filter } from 'lucide-react';

interface LibraryPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedModalScenario, setSelectedModalScenario] = useState<ScenarioDef | null>(null);
  const { personalBests } = useStatsStore();

  const filteredScenarios = SCENARIOS.filter(
    (sc) => activeCategory === 'all' || sc.category === activeCategory
  );

  const categories = [
    { id: 'all', label: 'ALL DRILLS' },
    { id: 'clicking', label: 'CLICKING' },
    { id: 'tracking', label: 'TRACKING' },
    { id: 'switching', label: 'SWITCHING' },
    { id: 'precision', label: 'PRECISION' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 space-y-12 select-none"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 border-b border-[#262626] pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5" />
          DRILL CATALOG // {SCENARIOS.length} ACTIVE SCENARIOS
        </div>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
          SCENARIO LIBRARY
        </h1>
        <p className="font-sans-ui text-neutral-400 text-sm max-w-xl">
          Select a targeted scenario to build reflex muscle memory, spatial flick accuracy, and smooth tracking.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundManager.playClick();
              setActiveCategory(cat.id);
            }}
            onMouseEnter={() => soundManager.playHover()}
            className={`px-5 py-2.5 rounded-[12px] text-xs font-mono font-bold tracking-wider transition-all duration-150 active:scale-95 border focus-visible:ring-2 focus-visible:ring-[#f5b8c9] ${
              activeCategory === cat.id
                ? 'bg-[#f5b8c9] text-[#0d0d0d] border-[#f5b8c9]'
                : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white hover:border-[#f5b8c9]/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scenario Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScenarios.map((sc) => {
          const pb = personalBests[sc.id];
          return (
            <Card3DTilt
              key={sc.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedModalScenario(sc);
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 flex flex-col justify-between space-y-6 hover:border-[#f5b8c9] transition-all duration-200 group active:scale-[0.99]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#0d0d0d] bg-[#f5b8c9] px-2.5 py-1 rounded-[6px]">
                    {sc.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 bg-[#0d0d0d] px-2.5 py-1 rounded-[12px] border border-[#262626]">
                    {sc.difficulty}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-white group-hover:text-[#f5b8c9] transition-colors">
                    {sc.name}
                  </h3>
                  <p className="font-sans-ui text-sm text-neutral-400 leading-relaxed">
                    {sc.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#262626]">
                {/* Personal Best indicator if exists */}
                {pb ? (
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-300 bg-[#0d0d0d] p-3 rounded-[12px] border border-[#262626]">
                    <span className="flex items-center gap-1.5 text-[#f5b8c9] font-bold">
                      <Trophy className="w-3.5 h-3.5" /> PB: {pb.highScore.toLocaleString()}
                    </span>
                    <span className="text-neutral-400">{pb.bestAccuracy}% ACC</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-neutral-500 bg-[#0d0d0d] p-3 rounded-[12px] border border-[#262626]">
                    NO COMPLETED SESSIONS YET
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playClick();
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                    onNavigate('arena', sc.id);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="btn-editorial-pink w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider active:scale-95"
                >
                  <Play className="w-4 h-4 fill-[#0d0d0d]" />
                  LAUNCH DRILL ({sc.durationSeconds}S)
                </button>
              </div>
            </Card3DTilt>
          );
        })}
      </div>

      {/* Scenario Detail Drawer Modal */}
      {selectedModalScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#0d0d0d] border border-[#f5b8c9] rounded-[12px] text-white p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <span className="text-xs font-mono text-[#f5b8c9] uppercase tracking-widest">
                DRILL SPECIFICATION
              </span>
              <button
                onClick={() => setSelectedModalScenario(null)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-3xl text-white">
                {selectedModalScenario.name}
              </h2>
              <p className="font-sans-ui text-sm text-neutral-300 leading-relaxed">
                {selectedModalScenario.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#141414] p-4 rounded-[12px] border border-[#262626]">
              <div>
                <span className="text-neutral-500 block">CATEGORY</span>
                <span className="text-white font-bold">{selectedModalScenario.category.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">TARGET COUNT</span>
                <span className="text-white font-bold">{selectedModalScenario.targetCount} ACTIVE</span>
              </div>
              <div>
                <span className="text-neutral-500 block">DURATION</span>
                <span className="text-white font-bold">{selectedModalScenario.durationSeconds} SECONDS</span>
              </div>
              <div>
                <span className="text-neutral-500 block">RECOMMENDED SENS</span>
                <span className="text-[#f5b8c9] font-bold">{selectedModalScenario.recommendedCm360}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                  onNavigate('arena', selectedModalScenario.id);
                  setSelectedModalScenario(null);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-pink flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-[#0d0d0d]" />
                START DRILL NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
