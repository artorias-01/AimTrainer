import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { Card3DTilt } from '../components/3d/Card3DTilt';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
  Play,
  Layers,
  BarChart3,
} from 'lucide-react';
import { getAllScenarios } from '../utils/scenarios';
import type { ScenarioCategory } from '../utils/scenarios';
import {
  springPunch,
  irisWipeVariants,
  cardShuffleWipeVariants,
  scanlineWipeVariants,
  diagonalWipeVariants,
  kineticStaggerContainer,
  kineticCascadeItem,
} from '../utils/motion';

interface LandingPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [pageMode, setPageMode] = useState<'main-menu' | 'drill-select'>('main-menu');
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory | 'all'>('all');
  const [activeWipe, setActiveWipe] = useState<'iris' | 'card' | 'scanline' | 'diagonal' | null>(null);

  // Hover states for the 4 bespoke menu choices
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);

  const { setScenario } = useGameStore();
  const dailyStreak = getDailyStreak();

  // Load ALL scenarios (built-in + custom)
  const allScenarios = getAllScenarios();

  const filteredScenarios = allScenarios.filter(
    (sc) => activeCategory === 'all' || sc.category === activeCategory
  );

  const categories: { id: ScenarioCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'ALL DRILLS' },
    { id: 'clicking', label: 'CLICKING' },
    { id: 'tracking', label: 'TRACKING' },
    { id: 'switching', label: 'SWITCHING' },
    { id: 'precision', label: 'PRECISION' },
  ];

  const handleSelectMenuKey = useCallback(
    (key: string) => {
      soundManager.playClick();
      if (key === 'drill-select') {
        setActiveWipe('iris');
        setTimeout(() => {
          setPageMode('drill-select');
          setActiveWipe(null);
        }, 220);
      } else if (key === 'library') {
        setActiveWipe('card');
        setTimeout(() => {
          onNavigate('library');
        }, 220);
      } else if (key === 'dashboard') {
        setActiveWipe('scanline');
        setTimeout(() => {
          onNavigate('dashboard');
        }, 220);
      } else if (key === 'settings') {
        setActiveWipe('diagonal');
        setTimeout(() => {
          onNavigate('settings');
        }, 220);
      }
    },
    [onNavigate]
  );

  const handleSelectScenarioId = useCallback(
    (scenarioId: string) => {
      soundManager.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setScenario(scenarioId);
      onNavigate('arena', scenarioId);
    },
    [onNavigate, setScenario]
  );

  // Determine active transition wipe variants
  const activeWipeVariant =
    activeWipe === 'iris'
      ? irisWipeVariants
      : activeWipe === 'card'
      ? cardShuffleWipeVariants
      : activeWipe === 'scanline'
      ? scanlineWipeVariants
      : activeWipe === 'diagonal'
      ? diagonalWipeVariants
      : undefined;

  return (
    <div className="relative w-full h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] bg-[#0d0d0d] text-white overflow-hidden select-none">
      {/* 3D Atmospheric Background Scene */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroScene />
      </div>

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(13,13,13,0.92)_100%)] pointer-events-none" />

      {/* Screen Transition Wipe Overlay */}
      <AnimatePresence>
        {activeWipe && activeWipeVariant && (
          <motion.div
            key={activeWipe}
            variants={activeWipeVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-accent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Top Right Streak Badge */}
      <div className="absolute top-6 right-6 z-20 pointer-events-auto flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-[12px] bg-[#0d0d0d]/90 border border-accent/40 text-xs font-mono font-bold flex items-center justify-center gap-2 text-accent backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.15)] tracking-wider">
          <Flame className="w-3.5 h-3.5 text-accent animate-bounce" />
          <span>
            {dailyStreak.streakCount > 0 ? `${dailyStreak.streakCount} DAY STREAK` : 'NO STREAK'}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <AnimatePresence mode="wait">
        {pageMode === 'main-menu' ? (
          /* ================= LEVEL 1: MAIN MENU (COMPACT 4 BESPOKE OPTIONS) ================= */
          <motion.div
            key="main-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6"
          >
            {/* Center Main Header Branding */}
            <div className="text-center space-y-1.5 mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={springPunch}
                className="font-display font-black text-4xl md:text-6xl tracking-tighter text-white drop-shadow-[0_0_30px_rgba(var(--accent-color-rgb),0.4)]"
              >
                AIM <span className="text-accent">//</span> TT
              </motion.h1>
              <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-bold">
                TACTICAL 3D EDITORIAL TRAINER
              </p>
            </div>

            {/* 4 BESPOKE MAIN MENU OPTIONS (PROPORTIONATE SCALE) */}
            <motion.div
              variants={kineticStaggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-3.5 w-full max-w-sm"
            >
              {/* CHOICE 1: SELECT MODE (Reticle Corner Snap Hover) */}
              <motion.button
                variants={kineticCascadeItem}
                onClick={() => handleSelectMenuKey('drill-select')}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredChoice('select-mode');
                }}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative w-full py-2.5 px-4 rounded-[12px] bg-[#141414]/90 hover:bg-accent hover:text-[#0d0d0d] border border-[#262626] hover:border-accent font-display font-extrabold text-sm md:text-base tracking-wider uppercase transition-all duration-200 shadow-lg flex items-center justify-between overflow-hidden cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-accent group-hover:text-[#0d0d0d] transition-colors" />
                  <span>SELECT MODE</span>
                </div>

                {/* Reticle Corner Brackets Hover Micro-Interaction */}
                {hoveredChoice === 'select-mode' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -4, y: -4 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#0d0d0d]"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: 4, y: -4 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#0d0d0d]"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: -4, y: 4 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#0d0d0d]"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: 4, y: 4 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#0d0d0d]"
                    />
                  </>
                )}

                <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#0d0d0d] font-bold">
                  START ➔
                </span>
              </motion.button>

              {/* CHOICE 2: DRILL LIBRARY (Card Stack Parallax Tilt Hover) */}
              <motion.button
                variants={kineticCascadeItem}
                onClick={() => handleSelectMenuKey('library')}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredChoice('library');
                }}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative w-full py-2.5 px-4 rounded-[12px] bg-[#141414]/90 hover:bg-white hover:text-[#0d0d0d] border border-[#262626] hover:border-white font-display font-extrabold text-sm md:text-base tracking-wider uppercase transition-all duration-200 shadow-lg flex items-center justify-between overflow-hidden cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-accent group-hover:text-[#0d0d0d] transition-colors" />
                  <span>DRILL LIBRARY</span>
                </div>

                {/* Card Stack Parallax Silhouette Micro-Interaction */}
                {hoveredChoice === 'library' && (
                  <div className="absolute right-12 flex items-center gap-1 opacity-40 pointer-events-none">
                    <motion.div
                      initial={{ rotate: 0, x: 0 }}
                      animate={{ rotate: -12, x: -3 }}
                      className="w-3 h-5 bg-[#0d0d0d] rounded-[2px] border border-white"
                    />
                    <motion.div
                      initial={{ rotate: 0, x: 0 }}
                      animate={{ rotate: 0, y: -2 }}
                      className="w-3 h-5 bg-[#0d0d0d] rounded-[2px] border border-white"
                    />
                    <motion.div
                      initial={{ rotate: 0, x: 0 }}
                      animate={{ rotate: 12, x: 3 }}
                      className="w-3 h-5 bg-[#0d0d0d] rounded-[2px] border border-white"
                    />
                  </div>
                )}

                <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#0d0d0d] font-bold">
                  ALL DRILLS ➔
                </span>
              </motion.button>

              {/* CHOICE 3: ANALYTICS (Live Mini Sparkline Hover) */}
              <motion.button
                variants={kineticCascadeItem}
                onClick={() => handleSelectMenuKey('dashboard')}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredChoice('analytics');
                }}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative w-full py-2.5 px-4 rounded-[12px] bg-[#141414]/90 hover:bg-accent hover:text-[#0d0d0d] border border-[#262626] hover:border-accent font-display font-extrabold text-sm md:text-base tracking-wider uppercase transition-all duration-200 shadow-lg flex items-center justify-between overflow-hidden cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-accent group-hover:text-[#0d0d0d] transition-colors" />
                  <span>ANALYTICS</span>
                </div>

                {/* Animated Mini Sparkline SVG Graph Hover */}
                {hoveredChoice === 'analytics' ? (
                  <motion.svg
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-14 h-5 stroke-[#0d0d0d] fill-none stroke-[2.5]"
                    viewBox="0 0 60 20"
                  >
                    <motion.polyline
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35 }}
                      points="2,16 12,12 24,17 36,6 48,11 58,3"
                    />
                  </motion.svg>
                ) : (
                  <span className="font-mono text-[10px] text-neutral-500 font-bold">STATS ➔</span>
                )}
              </motion.button>

              {/* CHOICE 4: OPTIONS (Rotating Mechanical Gear Hover) */}
              <motion.button
                variants={kineticCascadeItem}
                onClick={() => handleSelectMenuKey('settings')}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredChoice('options');
                }}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative w-full py-2.5 px-4 rounded-[12px] bg-[#141414]/90 hover:bg-white hover:text-[#0d0d0d] border border-[#262626] hover:border-white font-display font-extrabold text-sm md:text-base tracking-wider uppercase transition-all duration-200 shadow-lg flex items-center justify-between overflow-hidden cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={{ rotate: hoveredChoice === 'options' ? 90 : 0 }}
                    transition={springPunch}
                  >
                    <SettingsIcon className="w-4 h-4 text-accent group-hover:text-[#0d0d0d] transition-colors" />
                  </motion.div>
                  <span>OPTIONS</span>
                </div>

                <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#0d0d0d] font-bold">
                  SETTINGS ➔
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          /* ================= LEVEL 2: DRILL SELECTOR (ALL DRILLS + 3D TILT CARDS) ================= */
          <motion.div
            key="drill-selector-overlay"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={springPunch}
            className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto"
          >
            {/* Header Breadcrumb */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setPageMode('main-menu');
                  }}
                  className="px-3 py-1.5 rounded-[10px] bg-[#141414] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#262626] font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-accent" /> MAIN MENU
                </button>
                <span className="font-mono text-xs text-neutral-500">/</span>
                <span className="font-mono text-xs text-accent font-bold uppercase tracking-widest">
                  SELECT DRILL ({filteredScenarios.length} SCENARIOS)
                </span>
              </div>
            </div>

            {/* 3D Tilt Standard 2D Scenario Cards Grid showing ALL Scenarios */}
            <motion.div
              variants={kineticStaggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto overflow-y-auto max-h-[calc(100vh-220px)] p-1 pr-2"
            >
              {filteredScenarios.map((sc) => (
                <motion.div key={sc.id} variants={kineticCascadeItem}>
                  <Card3DTilt
                    onClick={() => handleSelectScenarioId(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="group relative bg-[#141414]/90 hover:bg-[#1a1a1a] border border-[#262626] hover:border-accent rounded-[14px] p-5 cursor-pointer flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-md transition-all duration-200 hover:shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.2)] active:scale-[0.98] h-full"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                          {sc.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                          {sc.difficulty}
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors leading-tight">
                        {sc.name}
                      </h3>

                      <p className="font-mono text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500 font-bold">{sc.durationSeconds}S</span>
                      <span className="text-accent font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        START <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card3DTilt>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-[10px] text-xs font-mono font-bold transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-accent text-[#0d0d0d] border-accent shadow-[0_0_12px_var(--accent-color)] font-extrabold'
                      : 'bg-[#141414] text-neutral-400 hover:text-white border-[#262626]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
