import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllScenarios, PRESET_ROUTINES } from '../utils/scenarios';
import type { ScenarioDef, WarmupRoutine } from '../utils/scenarios';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Card3DTilt } from '../components/3d/Card3DTilt';
import { useStatsStore } from '../store/useStatsStore';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Play, Trophy, Filter, Plus, Layers, Award, Trash2 } from 'lucide-react';
import { CustomScenarioModal } from '../components/ui/CustomScenarioModal';
import { RoutineBuilderModal } from '../components/ui/RoutineBuilderModal';
import { getStoredWarmupRoutines, deleteCustomScenario, deleteWarmupRoutine } from '../utils/storage';

interface LibraryPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'drills' | 'routines' | 'benchmark'>('drills');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedModalScenario, setSelectedModalScenario] = useState<ScenarioDef | null>(null);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingCustomScenario, setEditingCustomScenario] = useState<ScenarioDef | null>(null);

  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routinesList, setRoutinesList] = useState<WarmupRoutine[]>([]);

  const { personalBests } = useStatsStore();
  const { startRoutine, startBenchmark } = useGameStore();

  const loadRoutines = () => {
    const custom = getStoredWarmupRoutines();
    setRoutinesList([...PRESET_ROUTINES, ...custom]);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const allScenarios = getAllScenarios();
  const filteredScenarios = allScenarios.filter(
    (sc) => activeCategory === 'all' || sc.category === activeCategory
  );

  const categories = [
    { id: 'all', label: 'ALL DRILLS' },
    { id: 'clicking', label: 'CLICKING' },
    { id: 'tracking', label: 'TRACKING' },
    { id: 'switching', label: 'SWITCHING' },
    { id: 'precision', label: 'PRECISION' },
  ];

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    soundManager.playClick();
    deleteCustomScenario(id);
    setActiveCategory(activeCategory);
  };

  const handleDeleteRoutine = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    soundManager.playClick();
    deleteWarmupRoutine(id);
    loadRoutines();
  };

  const handleStartRoutine = (routine: WarmupRoutine) => {
    soundManager.playClick();
    startRoutine(routine);
    onNavigate('arena');
  };

  const handleStartBenchmark = () => {
    soundManager.playClick();
    startBenchmark();
    onNavigate('arena');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 space-y-10 select-none text-left"
    >
      {/* Modals */}
      {showCustomModal && (
        <CustomScenarioModal
          initialScenario={editingCustomScenario}
          onClose={() => {
            setShowCustomModal(false);
            setEditingCustomScenario(null);
          }}
          onSaved={() => setActiveCategory(activeCategory)}
        />
      )}

      {showRoutineModal && (
        <RoutineBuilderModal
          onClose={() => setShowRoutineModal(false)}
          onSaved={loadRoutines}
        />
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-pink uppercase tracking-widest font-bold">
            <Filter className="w-3.5 h-3.5" />
            DRILL CATALOG // {allScenarios.length} DRILLS AVAILABLE
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
            SCENARIO LIBRARY
          </h1>
          <p className="font-sans-ui text-neutral-400 text-sm max-w-xl">
            Select an individual scenario, launch an automated warmup routine playlist, or take the official Benchmark Test.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              setEditingCustomScenario(null);
              setShowCustomModal(true);
            }}
            className="btn-editorial-pink px-4 py-2.5 text-xs font-bold uppercase flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> CREATE CUSTOM DRILL
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setShowRoutineModal(true);
            }}
            className="px-4 py-2.5 rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#262626] hover:border-pink text-xs font-mono font-bold flex items-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-pink" /> NEW ROUTINE
          </button>
        </div>
      </div>

      {/* Primary Section Mode Tabs */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-[#262626] pb-4">
        <div className="flex gap-4 font-mono text-xs relative">
          {[
            { id: 'drills', label: `INDIVIDUAL DRILLS (${allScenarios.length})` },
            { id: 'routines', label: `WARMUP ROUTINES (${routinesList.length})` },
            { id: 'benchmark', label: 'BENCHMARK TEST' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`relative pb-2 font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab.id ? 'text-pink' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="librarySectionTabPill"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink rounded-full shadow-[0_0_8px_var(--accent-color)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: INDIVIDUAL DRILLS GRID */}
      {activeTab === 'drills' && (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(cat.id);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className={`relative px-5 py-2.5 rounded-[12px] text-xs font-mono font-bold tracking-wider transition-all duration-150 active:scale-95 border focus-visible:ring-2 focus-visible:ring-pink ${
                  activeCategory === cat.id
                    ? 'text-[#0d0d0d] border-pink'
                    : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white hover:border-pink/50'
                }`}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="libraryCategoryTabPill"
                    className="absolute inset-0 bg-pink rounded-[12px]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Scenario Grid with AnimatePresence Filter Transitions & Card3DTilt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredScenarios.map((sc) => {
                const pb = personalBests[sc.id];
                return (
                  <motion.div
                    key={sc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.22 }}
                  >
                    <SpotlightCard
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedModalScenario(sc);
                      }}
                      onMouseEnter={() => soundManager.playHover()}
                      className="cursor-pointer h-full flex flex-col justify-between"
                    >
                      <Card3DTilt className="h-full flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#0d0d0d] bg-pink px-2.5 py-1 rounded-[6px]">
                                {sc.category.toUpperCase()}
                              </span>
                              {sc.isCustom && (
                                <span className="text-[10px] font-mono font-bold text-white bg-pink-600 px-2 py-0.5 rounded-[6px]">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-neutral-400 bg-[#0d0d0d] px-2.5 py-1 rounded-[12px] border border-[#262626]">
                              {sc.difficulty}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-display font-bold text-2xl text-white group-hover:text-pink transition-colors">
                              {sc.name}
                            </h3>
                            <p className="font-sans-ui text-sm text-neutral-400 leading-relaxed">
                              {sc.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[#262626]">
                          {pb ? (
                            <div className="flex items-center justify-between text-xs font-mono text-neutral-300 bg-[#0d0d0d] p-3 rounded-[12px] border border-[#262626]">
                              <span className="flex items-center gap-1.5 text-pink font-bold">
                                <Trophy className="w-3.5 h-3.5" /> PB: {pb.highScore.toLocaleString()}
                              </span>
                              <span className="text-neutral-400">{pb.bestAccuracy}% ACC</span>
                            </div>
                          ) : (
                            <div className="text-[11px] font-mono text-neutral-500 bg-[#0d0d0d] p-3 rounded-[12px] border border-[#262626]">
                              NO COMPLETED SESSIONS YET
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.playClick();
                                onNavigate('arena', sc.id);
                              }}
                              onMouseEnter={() => soundManager.playHover()}
                              className="btn-editorial-pink flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider active:scale-95"
                            >
                              <Play className="w-4 h-4 fill-[#0d0d0d]" />
                              LAUNCH DRILL ({sc.durationSeconds}S)
                            </button>

                            {sc.isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustom(e, sc.id)}
                                className="px-3 bg-[#0d0d0d] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-[#262626] hover:border-red-900/50 rounded-[12px] flex items-center justify-center transition-colors"
                                title="Delete Custom Drill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card3DTilt>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB 2: WARMUP ROUTINES */}
      {activeTab === 'routines' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routinesList.map((r) => (
            <div
              key={r.id}
              className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 flex flex-col justify-between space-y-6 hover:border-pink transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#0d0d0d] bg-pink px-2.5 py-1 rounded-[6px]">
                    PLAYLIST ROUTINE
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {r.drillIds.length} DRILLS
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-white">
                    {r.name}
                  </h3>
                  <p className="font-sans-ui text-sm text-neutral-400 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 font-mono text-xs">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block">SEQUENCE</span>
                  {r.drillIds.map((did, idx) => {
                    const sc = allScenarios.find((s) => s.id === did);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-neutral-300">
                        <span className="text-pink font-bold">#{idx + 1}</span>
                        <span>{sc?.name || did}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#262626] flex gap-2">
                <button
                  onClick={() => handleStartRoutine(r)}
                  className="btn-editorial-pink flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-[#0d0d0d]" /> START ROUTINE
                </button>
                {!r.isBuiltIn && (
                  <button
                    onClick={(e) => handleDeleteRoutine(e, r.id)}
                    className="px-3 bg-[#0d0d0d] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-[#262626] hover:border-red-900/50 rounded-[12px] flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BENCHMARK TEST */}
      {activeTab === 'benchmark' && (
        <div className="max-w-3xl mx-auto bg-[#141414] border border-pink rounded-[12px] p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-pink text-[#0d0d0d] flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              OFFICIAL BENCHMARK TEST
            </h2>
            <p className="font-sans-ui text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Standardized 4-drill sequence evaluating Clicking, Tracking, Precision, and Switching to calculate your composite Aim Rating and Letter Grade rank.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-left bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626]">
            <div>
              <span className="text-[10px] text-neutral-500 block">1. CLICKING</span>
              <span className="text-white font-bold">GRIDSHOT</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">2. TRACKING</span>
              <span className="text-white font-bold">STRAFE</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">3. PRECISION</span>
              <span className="text-white font-bold">MICRO FLICKS</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">4. SWITCHING</span>
              <span className="text-white font-bold">MULTI-TARGET</span>
            </div>
          </div>

          <button
            onClick={handleStartBenchmark}
            className="btn-editorial-pink px-8 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5 fill-[#0d0d0d]" /> START BENCHMARK SEQUENCE
          </button>
        </div>
      )}

      {/* Scenario Detail Drawer Modal */}
      {selectedModalScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#0d0d0d] border border-pink rounded-[12px] text-white p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <span className="text-xs font-mono text-pink uppercase tracking-widest">
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
                <span className="text-pink font-bold">{selectedModalScenario.recommendedCm360}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
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
