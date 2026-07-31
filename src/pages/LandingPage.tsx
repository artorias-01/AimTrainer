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
        {/* Compact Title */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-md">
            AIM <span className="text-[#f5b8c9]">//</span> TT
          </h1>
          <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase">
            3D ONLINE AIM ENGINE
          </p>
        </div>

        {/* Dynamic Compact Menu (Switches between Main Menu & Drill Selector) */}
        <AnimatePresence mode="wait">
          {!showDrillMenu ? (
            /* MAIN MENU (Compact Size) */
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 max-w-xs mx-auto"
            >
              {/* Option 1: START DRILL */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group w-full py-3 px-6 rounded-[12px] bg-[#f5b8c9] hover:bg-white text-[#0d0d0d] font-display font-extrabold text-lg md:text-xl tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#f5b8c9]/20"
              >
                <Play className="w-5 h-5 fill-[#0d0d0d] group-hover:scale-110 transition-transform" />
                <span>START DRILL</span>
              </button>

              {/* Option 2: DRILL LIBRARY */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group w-full py-2.5 px-6 rounded-[12px] bg-[#0d0d0d]/90 hover:bg-[#1a1a1a] text-white border border-[#262626] hover:border-[#f5b8c9] font-display font-bold text-base md:text-lg tracking-wider transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              >
                <Library className="w-4 h-4 text-[#f5b8c9]" />
                <span>DRILL LIBRARY</span>
              </button>

              {/* Option 3: ANALYTICS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group w-full py-2.5 px-6 rounded-[12px] bg-[#0d0d0d]/90 hover:bg-[#1a1a1a] text-white border border-[#262626] hover:border-[#f5b8c9] font-display font-bold text-base md:text-lg tracking-wider transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-[#f5b8c9]" />
                <span>ANALYTICS</span>
              </button>

              {/* Option 4: OPTIONS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group w-full py-2.5 px-6 rounded-[12px] bg-[#0d0d0d]/90 hover:bg-[#1a1a1a] text-white border border-[#262626] hover:border-[#f5b8c9] font-display font-bold text-base md:text-lg tracking-wider transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4 text-[#f5b8c9]" />
                <span>OPTIONS</span>
              </button>
            </motion.div>
          ) : (
            /* DRILL SELECTOR MENU */
            <motion.div
              key="drill-menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d0d0d]/95 border border-[#f5b8c9] rounded-[12px] p-5 space-y-4 max-w-sm mx-auto backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <span className="font-mono text-xs text-[#f5b8c9] font-bold tracking-widest uppercase">
                  SELECT TRAINING DRILL
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{SCENARIOS.length} DRILLS</span>
              </div>

              {/* Scrollable Scenario Pick List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-full text-left p-3 rounded-[12px] bg-[#141414] hover:bg-[#f5b8c9] hover:text-[#0d0d0d] border border-[#262626] transition-all duration-150 active:scale-[0.98] group flex items-center justify-between"
                  >
                    <div>
                      <span className="font-display font-bold text-sm block group-hover:text-[#0d0d0d]">
                        {sc.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400 group-hover:text-[#0d0d0d]/80 block">
                        {sc.category.toUpperCase()} // {sc.durationSeconds}S
                      </span>
                    </div>
                    <Target className="w-4 h-4 text-[#f5b8c9] group-hover:text-[#0d0d0d]" />
                  </button>
                ))}
              </div>

              {/* Back to Main Menu Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="w-full py-2.5 rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-neutral-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#262626] active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                BACK TO MENU
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
