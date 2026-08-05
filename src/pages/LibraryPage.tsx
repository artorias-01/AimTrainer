import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllScenarios, PRESET_ROUTINES } from '../utils/scenarios';
import type { ScenarioDef, WarmupRoutine } from '../utils/scenarios';
import { Card3DTilt } from '../components/3d/Card3DTilt';
import { useStatsStore } from '../store/useStatsStore';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Play, Trophy, Filter, Plus, Layers, Award, Trash2, Crosshair } from 'lucide-react';
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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    startRoutine(routine);
    onNavigate('arena');
  };

  const handleStartBenchmark = () => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    startBenchmark();
    onNavigate('arena');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen bg-[#030303] text-white pt-28 pb-16 px-6 md:px-16 space-y-10 select-none text-left"
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

      {/* Page Header */}
      <div className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-pink uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            DRILL MATRIX // {allScenarios.length} SCENARIOS ACTIVE
          </div>
          <h1 className="font-syne font-extrabold text-4xl md:text-6xl text-white tracking-tight">
            SCENARIO LIBRARY
          </h1>
          <p className="font-outfit text-neutral-400 text-sm max-w-xl leading-relaxed">
            Select training drills, create playlists, or take the official 4-stage Benchmark Test.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              setEditingCustomScenario(null);
              setShowCustomModal(true);
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="btn-editorial-pink px-5 py-3 text-xs font-syne font-extrabold tracking-wider flex items-center gap-2 shadow-lg glow-accent"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> CREATE CUSTOM DRILL
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setShowRoutineModal(true);
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="btn-editorial-secondary px-5 py-3 text-xs font-syne font-bold tracking-wider flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-pink" /> NEW ROUTINE
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-2 font-mono text-xs bg-white/[0.03] border border-white/10 p-1.5 rounded-[16px]">
          {[
            { id: 'drills', label: `DRILLS (${allScenarios.length})` },
            { id: 'routines', label: `PLAYLISTS (${routinesList.length})` },
            { id: 'benchmark', label: 'BENCHMARK TEST' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as any);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className={`relative px-5 py-2 rounded-[12px] font-bold tracking-wider transition-all ${
                  isActive ? 'text-black font-extrabold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="library-tab-pill"
                    className="absolute inset-0 bg-pink rounded-[12px] shadow-md shadow-pink/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
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
                className={`px-5 py-2.5 rounded-[14px] text-xs font-mono font-bold tracking-wider transition-all duration-150 border ${
                  activeCategory === cat.id
                    ? 'bg-pink text-black border-pink shadow-lg shadow-pink/20 font-extrabold'
                    : 'glass-pill text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="glass-card glass-card-hover rounded-[20px] p-7 flex flex-col justify-between space-y-6 group cursor-pointer relative"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold text-pink uppercase tracking-widest bg-pink/15 px-3 py-1 rounded-full border border-pink/30">
                          {sc.category.toUpperCase()}
                        </span>
                        {sc.isCustom && (
                          <span className="text-[10px] font-mono font-bold text-black bg-pink px-2 py-0.5 rounded-full">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-neutral-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 font-bold">
                        {sc.difficulty}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-syne font-extrabold text-2xl text-white group-hover:text-pink transition-colors leading-tight">
                        {sc.name}
                      </h3>
                      <p className="font-outfit text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {sc.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    {pb ? (
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-300 bg-white/[0.03] p-3 rounded-[14px] border border-white/10">
                        <span className="flex items-center gap-1.5 text-pink font-bold">
                          <Trophy className="w-3.5 h-3.5" /> PB: {pb.highScore.toLocaleString()}
                        </span>
                        <span className="text-neutral-400 font-bold">{pb.bestAccuracy}% ACC</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-neutral-500 bg-white/[0.03] p-3 rounded-[14px] border border-white/10">
                        NO SESSIONS COMPLETED YET
                      </div>
                    )}

                    <div className="flex gap-2">
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
                        className="btn-editorial-pink flex-1 py-3 flex items-center justify-center gap-2 text-xs font-syne font-extrabold tracking-wider shadow-md"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        LAUNCH DRILL ({sc.durationSeconds}S)
                      </button>

                      {sc.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustom(e, sc.id)}
                          className="px-3 bg-white/5 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-[14px] flex items-center justify-center transition-colors"
                          title="Delete Custom Drill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card3DTilt>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WARMUP ROUTINES */}
      {activeTab === 'routines' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routinesList.map((r) => (
            <div
              key={r.id}
              className="glass-card glass-card-hover rounded-[20px] p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold text-pink bg-pink/15 px-3 py-1 rounded-full border border-pink/30 uppercase tracking-widest">
                    PLAYLIST ROUTINE
                  </span>
                  <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    {r.drillIds.length} DRILLS
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-syne font-extrabold text-2xl text-white">
                    {r.name}
                  </h3>
                  <p className="font-outfit text-sm text-neutral-400 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 font-mono text-xs">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block tracking-wider">DRILL SEQUENCE</span>
                  {r.drillIds.map((did, idx) => {
                    const sc = allScenarios.find((s) => s.id === did);
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-neutral-300 bg-white/[0.03] p-2.5 rounded-[12px] border border-white/5">
                        <span className="text-pink font-bold">#{idx + 1}</span>
                        <span className="font-bold">{sc?.name || did}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => handleStartRoutine(r)}
                  className="btn-editorial-pink flex-1 py-3 text-xs font-syne font-extrabold tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-black" /> START ROUTINE
                </button>
                {!r.isBuiltIn && (
                  <button
                    onClick={(e) => handleDeleteRoutine(e, r.id)}
                    className="px-3 bg-white/5 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-[14px] flex items-center justify-center transition-colors"
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
        <div className="max-w-3xl mx-auto glass-card rounded-[24px] p-8 md:p-12 space-y-8 text-center border border-pink/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="w-16 h-16 rounded-[20px] bg-pink text-black flex items-center justify-center mx-auto shadow-xl glow-accent">
            <Award className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-pink uppercase tracking-widest px-3 py-1 rounded-full bg-pink/15 border border-pink/30">
              OFFICIAL AIM BENCHMARK
            </span>
            <h2 className="font-syne font-extrabold text-3xl md:text-5xl text-white tracking-tight">
              BENCHMARK SEQUENCE
            </h2>
            <p className="font-outfit text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Standardized 4-stage evaluation sequence testing Clicking, Tracking, Precision, and Switching to calculate your composite Aim Rating and Letter Grade rank.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-left">
            {[
              { num: '1', title: 'CLICKING', drill: 'GRIDSHOT CLASSIC' },
              { num: '2', title: 'TRACKING', drill: 'STRAFE TRACKING' },
              { num: '3', title: 'PRECISION', drill: 'MICRO PRECISION' },
              { num: '4', title: 'SWITCHING', drill: 'MULTI-TARGET' },
            ].map((stg, idx) => (
              <div key={idx} className="bg-white/[0.04] p-4 rounded-[16px] border border-white/10 space-y-1">
                <span className="text-[10px] text-pink font-bold block">STAGE #{stg.num} • {stg.title}</span>
                <span className="text-white font-bold block">{stg.drill}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartBenchmark}
            className="btn-editorial-pink px-10 py-4 text-sm font-syne font-extrabold tracking-wider flex items-center justify-center gap-3 mx-auto shadow-xl glow-accent"
          >
            <Play className="w-5 h-5 fill-black" /> START BENCHMARK SEQUENCE
          </button>
        </div>
      )}

      {/* Scenario Detail Drawer Modal */}
      {selectedModalScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[24px] text-white p-8 max-w-lg w-full space-y-6 border border-pink/40 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-pink uppercase tracking-widest font-bold flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> DRILL SPECIFICATION
              </span>
              <button
                onClick={() => setSelectedModalScenario(null)}
                className="text-neutral-400 hover:text-white font-mono text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10"
              >
                ESC / CLOSE
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-syne font-extrabold text-3xl text-white">
                {selectedModalScenario.name}
              </h2>
              <p className="font-outfit text-sm text-neutral-300 leading-relaxed">
                {selectedModalScenario.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/[0.03] p-4 rounded-[16px] border border-white/10">
              <div>
                <span className="text-neutral-500 block text-[10px]">CATEGORY</span>
                <span className="text-white font-bold">{selectedModalScenario.category.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">TARGET COUNT</span>
                <span className="text-white font-bold">{selectedModalScenario.targetCount} ACTIVE</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">DURATION</span>
                <span className="text-white font-bold">{selectedModalScenario.durationSeconds} SECONDS</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">RECOMMENDED SENS</span>
                <span className="text-pink font-bold">{selectedModalScenario.recommendedCm360}</span>
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
                className="btn-editorial-pink flex-1 py-3.5 text-xs font-syne font-extrabold tracking-wider flex items-center justify-center gap-2 shadow-lg glow-accent"
              >
                <Play className="w-4 h-4 fill-black" />
                START DRILL NOW
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
