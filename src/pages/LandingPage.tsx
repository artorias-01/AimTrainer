import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { getAllScenarios } from '../utils/scenarios';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Target, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [showDrillMenu, setShowDrillMenu] = useState(false);
  const { setScenario } = useGameStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const dailyStreak = getDailyStreak();
  const allScenarios = getAllScenarios();

  useEffect(() => {
    if (!showDrillMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundManager.playClick();
        setShowDrillMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDrillMenu]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollTrack = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

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

      {/* Dynamic Main Container */}
      <div
        className={`relative z-10 w-full transition-all duration-300 ${
          showDrillMenu
            ? 'max-w-7xl flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8'
            : 'max-w-lg text-center space-y-6 bg-[#0d0d0d]/90 backdrop-blur-md p-6 sm:p-8 border-2 border-pink/60 -skew-x-3 shadow-[8px_8px_0_0_#000] bg-persona-dots'
        }`}
      >
        {showDrillMenu ? (
          /* DRILL SELECTOR HORIZONTAL LAYOUT */
          <>
            {/* Left Column: Title & Back Button */}
            <div className="-skew-x-6 bg-[#0d0d0d]/95 backdrop-blur-md p-6 border-2 border-pink/60 shadow-[6px_6px_0_0_#000] space-y-5 w-full md:w-72 shrink-0 flex flex-col justify-between text-left">
              <div className="skew-x-6 space-y-3">
                <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight leading-none text-white drop-shadow-[3px_3px_0_#000]">
                  AIM <span className="text-pink">//</span> TT
                </h1>
                <div className="flex items-center gap-2 w-28 opacity-75">
                  <div className="h-px bg-gradient-to-r from-accent to-transparent flex-1" />
                  <span className="text-accent text-[10px] font-mono">◆</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block font-bold">
                  DRILL SELECTOR [ESC]
                </span>
                <p className="font-sans-ui text-xs text-neutral-300 leading-relaxed">
                  Choose from {allScenarios.length} competitive aim scenarios across clicking, precision, tracking, and switching categories.
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-3 py-3 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 text-white bg-[#1a1a1a] hover:bg-pink hover:text-[#0d0d0d] border-2 border-[#333] hover:border-pink transition-all shadow-[4px_4px_0_0_#000] active:translate-x-0"
              >
                <div className="skew-x-3 flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-pink group-hover:text-[#0d0d0d]" /> BACK TO MAIN MENU
                </div>
              </button>
            </div>

            {/* Right Column: Horizontal Cards Scrollable Track */}
            <motion.div
              key="drill-horizontal-track"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.25 }}
              className="flex-1 w-full max-w-full overflow-hidden bg-[#0d0d0d]/95 backdrop-blur-md border-2 border-[#262626] p-6 space-y-4 shadow-[8px_8px_0_0_#000] text-left -skew-x-3"
            >
              <div className="skew-x-3 flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="font-mono text-xs text-pink font-bold tracking-widest uppercase bg-[#141414] px-3 py-1 border border-pink/30">
                  SELECT TRAINING DRILL
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-400 bg-[#141414] px-3 py-1 border border-[#262626] font-bold">
                    {allScenarios.length} DRILLS AVAILABLE
                  </span>

                  {/* Manual Horizontal Scroll Arrow Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollTrack('left')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Left"
                      className="p-1.5 bg-[#141414] hover:bg-pink hover:text-[#0d0d0d] border border-[#262626] text-neutral-300 transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack('right')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Right"
                      className="p-1.5 bg-[#141414] hover:bg-pink hover:text-[#0d0d0d] border border-[#262626] text-neutral-300 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontally Scrollable Cards Container (Mouse Wheel & Trackpad Supported) */}
              <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex flex-row gap-4 overflow-x-auto py-2 pr-2 scroll-smooth thin-pink-scrollbar skew-x-3"
              >
                {allScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-64 h-52 shrink-0 bg-[#0d0d0d] hover:bg-pink/10 border-2 border-[#262626] hover:border-pink p-4 flex flex-col justify-between text-left transition-all duration-200 group -skew-x-3 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0"
                  >
                    <div className="skew-x-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-pink uppercase tracking-wider bg-pink/10 px-2 py-0.5 border border-pink/30">
                          {sc.category}
                        </span>
                        {sc.isCustom ? (
                          <span className="text-[9px] font-mono font-bold text-[#0d0d0d] bg-pink px-1.5 py-0.5 border border-pink">
                            CUSTOM
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 font-bold">
                            {sc.durationSeconds}S
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-black text-base text-white group-hover:text-pink transition-colors leading-tight uppercase">
                        {sc.name}
                      </h3>

                      <p className="font-sans-ui text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                        {sc.description}
                      </p>
                    </div>

                    <div className="skew-x-3 flex items-center justify-between border-t border-[#262626] pt-2.5 mt-2">
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1 font-bold">
                        <Target className="w-3.5 h-3.5 text-pink" /> {sc.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-pink font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        START DRILL <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* MAIN MENU MODE */
          <>
            {/* Title Section */}
            <div className="skew-x-3 space-y-3">
              <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-[4px_4px_0_#000]">
                AIM <span className="text-pink">//</span> TT
              </h1>
              <div className="flex items-center justify-center gap-3 w-40 mx-auto opacity-75">
                <div className="h-px bg-gradient-to-r from-transparent to-accent flex-1" />
                <span className="text-accent text-xs font-mono">◆</span>
                <div className="h-px bg-gradient-to-l from-transparent to-accent flex-1" />
              </div>
              <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase font-bold">
                3D ONLINE AIM ENGINE
              </p>
            </div>

            {/* Daily Streak Indicator Badge */}
            <div className="skew-x-3 flex justify-center">
              <div className="-skew-x-6 px-5 py-2 bg-[#141414]/95 border-2 border-pink/50 text-xs font-mono font-black flex items-center justify-center gap-2 text-pink shadow-[4px_4px_0_0_#000] tracking-wider uppercase">
                <span className="skew-x-6">
                  {dailyStreak.streakCount > 0
                    ? `${dailyStreak.streakCount} DAY STREAK ACTIVE!`
                    : 'NO ACTIVE STREAK • COMPLETE A DRILL TODAY'}
                </span>
              </div>
            </div>

            {/* Main Menu Buttons - Persona Style Slanted Action Banners */}
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-stretch gap-4 max-w-sm mx-auto py-2 w-full"
            >
              {/* Option 1: START DRILL */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-8 bg-pink text-[#0d0d0d] border-2 border-[#0d0d0d] py-3.5 px-6 font-display font-black text-xl md:text-2xl tracking-widest uppercase flex items-center justify-between shadow-[5px_5px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-white hover:text-[#0d0d0d] hover:shadow-[8px_8px_0_0_var(--accent-color)] active:translate-x-0 active:translate-y-0 transition-all duration-150 group"
              >
                <span className="skew-x-8 group-hover:scale-105 transition-transform">START DRILL</span>
                <span className="skew-x-8 font-mono text-sm group-hover:translate-x-1.5 transition-transform">▶</span>
              </button>

              {/* Option 2: DRILL LIBRARY */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-8 bg-[#141414] text-white border-2 border-[#262626] py-3 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-pink hover:text-[#0d0d0d] hover:border-pink hover:shadow-[7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-150 group"
              >
                <span className="skew-x-8 group-hover:scale-105 transition-transform">DRILL LIBRARY</span>
                <span className="skew-x-8 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">▶</span>
              </button>

              {/* Option 3: ANALYTICS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-8 bg-[#141414] text-white border-2 border-[#262626] py-3 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-pink hover:text-[#0d0d0d] hover:border-pink hover:shadow-[7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-150 group"
              >
                <span className="skew-x-8 group-hover:scale-105 transition-transform">ANALYTICS</span>
                <span className="skew-x-8 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">▶</span>
              </button>

              {/* Option 4: OPTIONS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-8 bg-[#141414] text-white border-2 border-[#262626] py-3 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-pink hover:text-[#0d0d0d] hover:border-pink hover:shadow-[7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-150 group"
              >
                <span className="skew-x-8 group-hover:scale-105 transition-transform">OPTIONS</span>
                <span className="skew-x-8 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">▶</span>
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
