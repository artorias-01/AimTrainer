import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { SCENARIOS } from '../utils/scenarios';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Target, Play, Sliders, BarChart3, Library, ArrowLeft } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [showDrillMenu, setShowDrillMenu] = useState(false);
  const { setScenario } = useGameStore();

  const handleSelectDrill = (scenarioId: string) => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setScenario(scenarioId);
    onNavigate('arena', scenarioId);
  };

  return (
    <div className="relative w-full h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] bg-[#0d0d0d] text-white overflow-hidden flex flex-col justify-center items-center p-6 select-none">
      {/* Background 3D Real-Time Scene */}
      <div className="absolute inset-0 z-0 opacity-70">
        <HeroScene />
      </div>

      {/* Radial Dark Vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/80 pointer-events-none" />

      {/* Centered Editorial Game Title & Menu Container */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Compact Title Section with Ornamental Divider */}
        <div className="space-y-3">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-md">
            AIM <span className="text-[#f5b8c9]">//</span> TT
          </h1>
          <div className="flex items-center justify-center gap-3 w-40 mx-auto opacity-75">
            <div className="h-px bg-gradient-to-r from-transparent to-[#f5b8c9] flex-1" />
            <span className="text-[#f5b8c9] text-xs font-mono">◆</span>
            <div className="h-px bg-gradient-to-l from-transparent to-[#f5b8c9] flex-1" />
          </div>
          <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase">
            3D ONLINE AIM ENGINE
          </p>
        </div>

        {/* Dynamic Menu (Switches between Main Menu & Drill Selector) */}
        <AnimatePresence mode="wait">
          {!showDrillMenu ? (
            /* MAIN MENU (Text-First, Restrained, Borderless) */
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-5 max-w-xs mx-auto py-2"
            >
              {/* Option 1: START DRILL (Primary Action - Visually emphasized text with pink side ticks) */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-extrabold text-2xl md:text-3xl tracking-widest text-white hover:text-[#f5b8c9] transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="text-[#f5b8c9] font-mono text-base transition-transform group-hover:-translate-x-1">‹</span>
                <span className="relative">
                  START DRILL
                  <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="text-[#f5b8c9] font-mono text-base transition-transform group-hover:translate-x-1">›</span>
              </button>

              {/* Option 2: DRILL LIBRARY */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-[#f5b8c9] transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">‹</span>
                <span className="relative">
                  DRILL LIBRARY
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">›</span>
              </button>

              {/* Option 3: ANALYTICS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-[#f5b8c9] transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">‹</span>
                <span className="relative">
                  ANALYTICS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">›</span>
              </button>

              {/* Option 4: OPTIONS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-[#f5b8c9] transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">‹</span>
                <span className="relative">
                  OPTIONS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-sm">›</span>
              </button>
            </motion.div>
          ) : (
            /* DRILL SELECTOR MENU */
            <motion.div
              key="drill-menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d0d0d]/95 border border-[#262626] rounded-[12px] p-5 space-y-4 max-w-sm mx-auto backdrop-blur-md shadow-xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="font-mono text-xs text-[#f5b8c9] font-bold tracking-widest uppercase">
                  SELECT TRAINING DRILL
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{SCENARIOS.length} DRILLS</span>
              </div>

              {/* Scrollable Scenario Hairline Pick List */}
              <div className="divide-y divide-[#262626] border-b border-[#262626] max-h-[280px] overflow-y-auto pr-1.5 thin-pink-scrollbar">
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-full text-left py-3 px-3 transition-all duration-150 group flex items-center justify-between hover:bg-[#f5b8c9]/10 border-l-2 border-l-transparent hover:border-l-[#f5b8c9] focus:outline-none"
                  >
                    <div>
                      <span className="font-display font-bold text-sm block text-neutral-200 group-hover:text-[#f5b8c9] transition-colors">
                        {sc.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-300 block transition-colors">
                        {sc.category.toUpperCase()} // {sc.durationSeconds}S
                      </span>
                    </div>
                    <Target className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#f5b8c9] transition-colors" />
                  </button>
                ))}
              </div>

              {/* Back to Menu Text-First Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-sm tracking-widest text-neutral-400 hover:text-white transition-colors duration-200 py-1.5 w-full flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-xs">‹</span>
                <span className="relative">
                  BACK TO MENU
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#f5b8c9] group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#f5b8c9] font-mono text-xs">›</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
