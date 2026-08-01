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
            : 'max-w-lg text-center space-y-6 bg-[#0d0d0d]/40 backdrop-blur-sm p-6 sm:p-8 rounded-[16px] border border-[#262626]/50 shadow-2xl'
        }`}
      >
        {showDrillMenu ? (
          /* DRILL SELECTOR HORIZONTAL LAYOUT */
          <>
            {/* Left Column: Title & Back Button */}
            <div className="bg-[#0d0d0d]/80 backdrop-blur-md p-6 rounded-[16px] border border-[#262626] shadow-2xl space-y-5 w-full md:w-72 shrink-0 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight leading-none text-white">
                  AIM <span className="text-accent">//</span> TT
                </h1>
                <div className="flex items-center gap-2 w-28 opacity-75">
                  <div className="h-px bg-gradient-to-r from-accent to-transparent flex-1" />
                  <span className="text-accent text-[10px] font-mono">◆</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block">
                  DRILL SELECTOR [ESC]
                </span>
                <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                  Choose from {allScenarios.length} competitive aim scenarios across clicking, precision, tracking, and switching categories.
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-secondary py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 text-white border-[#262626] hover:border-accent transition-all focus:outline-none focus-visible:outline-accent"
              >
                <ChevronLeft className="w-4 h-4 text-accent" /> BACK TO MAIN MENU
              </button>
            </div>

            {/* Right Column: Horizontal Cards Scrollable Track */}
            <motion.div
              key="drill-horizontal-track"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.25 }}
              className="flex-1 w-full max-w-full overflow-hidden bg-[#0d0d0d]/90 backdrop-blur-md border border-[#262626] rounded-[16px] p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase">
                  SELECT TRAINING DRILL
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-400 bg-[#141414] px-3 py-1 rounded-[8px] border border-[#262626]">
                    {allScenarios.length} DRILLS AVAILABLE
                  </span>

                  {/* Manual Horizontal Scroll Arrow Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollTrack('left')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Left"
                      className="p-1.5 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all focus:outline-none focus-visible:outline-accent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack('right')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Right"
                      className="p-1.5 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all focus:outline-none focus-visible:outline-accent"
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
                className="flex flex-row gap-4 overflow-x-auto py-2 pr-2 scroll-smooth thin-pink-scrollbar"
              >
                {allScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-64 h-52 shrink-0 bg-[#0d0d0d] hover:bg-accent/10 border border-[#262626] hover:border-accent rounded-[12px] p-4 flex flex-col justify-between text-left transition-all duration-200 group focus:outline-none focus-visible:outline-accent focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent active:scale-95 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-[6px] border border-accent/20">
                          {sc.category}
                        </span>
                        {sc.isCustom ? (
                          <span className="text-[9px] font-mono font-bold text-[#0d0d0d] bg-accent px-1.5 py-0.5 rounded-[4px]">
                            CUSTOM
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 font-bold">
                            {sc.durationSeconds}S
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-extrabold text-base text-white group-hover:text-accent transition-colors leading-tight">
                        {sc.name}
                      </h3>

                      <p className="font-sans-ui text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                        {sc.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#262626] pt-2.5 mt-2">
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1 font-bold">
                        <Target className="w-3.5 h-3.5 text-accent" /> {sc.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-accent font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
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
            <div className="space-y-3">
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-md">
                AIM <span className="text-accent">//</span> TT
              </h1>
              <div className="flex items-center justify-center gap-3 w-40 mx-auto opacity-75">
                <div className="h-px bg-gradient-to-r from-transparent to-accent flex-1" />
                <span className="text-accent text-xs font-mono">◆</span>
                <div className="h-px bg-gradient-to-l from-transparent to-accent flex-1" />
              </div>
              <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase">
                3D ONLINE AIM ENGINE
              </p>
            </div>

            {/* Daily Streak Indicator Badge */}
            <div className="flex justify-center">
              <div className="px-4 py-1.5 rounded-[12px] bg-[#141414]/90 border border-accent/30 text-xs font-mono font-bold flex items-center justify-center gap-2 text-accent backdrop-blur-sm shadow-md tracking-wider">
                <span>
                  {dailyStreak.streakCount > 0
                    ? `${dailyStreak.streakCount} DAY STREAK ACTIVE`
                    : 'NO ACTIVE STREAK • COMPLETE A DRILL TODAY'}
                </span>
              </div>
            </div>

            {/* Main Menu Buttons */}
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-5 max-w-xs mx-auto py-2"
            >
              {/* Option 1: START DRILL */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-extrabold text-2xl md:text-3xl tracking-widest text-white hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="text-accent font-mono text-base transition-transform group-hover:-translate-x-1">‹</span>
                <span className="relative">
                  START DRILL
                  <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-accent group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="text-accent font-mono text-base transition-transform group-hover:translate-x-1">›</span>
              </button>

              {/* Option 2: DRILL LIBRARY */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">‹</span>
                <span className="relative">
                  DRILL LIBRARY
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">›</span>
              </button>

              {/* Option 3: ANALYTICS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">‹</span>
                <span className="relative">
                  ANALYTICS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">›</span>
              </button>

              {/* Option 4: OPTIONS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">‹</span>
                <span className="relative">
                  OPTIONS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent font-mono text-sm">›</span>
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
