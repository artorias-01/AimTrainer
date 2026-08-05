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

      {/* Dynamic Main Container - P3R Translucent Glass Frame */}
      <div
        className={`relative z-10 w-full transition-all duration-300 ${
          showDrillMenu
            ? 'max-w-7xl flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8'
            : 'max-w-lg text-center space-y-6 bg-[#081424]/90 backdrop-blur-xl p-8 -skew-x-6 border-2 border-[#00d2ff]/60 shadow-[0_0_35px_rgba(0,210,255,0.25),8px_8px_0_0_#000] bg-p3r-dots'
        }`}
      >
        {showDrillMenu ? (
          /* DRILL SELECTOR HORIZONTAL LAYOUT */
          <>
            {/* Left Column: Title & Back Button */}
            <div className="-skew-x-12 bg-[#081424]/95 backdrop-blur-md p-6 border-2 border-[#00d2ff]/60 shadow-[6px_6px_0_0_#000] space-y-5 w-full md:w-72 shrink-0 flex flex-col justify-between text-left">
              <div className="skew-x-12 space-y-3">
                <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight leading-none text-white drop-shadow-[0_0_12px_rgba(0,210,255,0.5)]">
                  AIM <span className="text-[#00d2ff]">//</span> TT
                </h1>
                <div className="flex items-center gap-2 w-28 opacity-90">
                  <div className="h-0.5 bg-gradient-to-r from-[#00d2ff] to-transparent flex-1" />
                  <span className="text-[#00d2ff] text-[10px] font-mono">◆</span>
                </div>
                <span className="font-mono text-[10px] text-[#00d2ff] tracking-widest uppercase block font-bold">
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
                className="-skew-x-6 py-3 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 text-white bg-[#0a1c33] hover:bg-[#00d2ff] hover:text-[#040a12] border-2 border-[#00d2ff]/40 hover:border-[#00d2ff] transition-all shadow-[4px_4px_0_0_#000]"
              >
                <div className="skew-x-6 flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-[#00d2ff] group-hover:text-[#040a12]" /> BACK TO MAIN MENU
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
              className="flex-1 w-full max-w-full overflow-hidden bg-[#081424]/95 backdrop-blur-md border-2 border-[#00d2ff]/40 p-6 space-y-4 shadow-[8px_8px_0_0_#000] text-left -skew-x-6"
            >
              <div className="skew-x-6 flex items-center justify-between border-b border-[#102a4a] pb-3">
                <span className="font-mono text-xs text-[#00d2ff] font-extrabold tracking-widest uppercase bg-[#040a12] px-3 py-1 border border-[#00d2ff]/40">
                  SELECT TRAINING DRILL
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-300 bg-[#040a12] px-3 py-1 border border-[#102a4a] font-bold">
                    {allScenarios.length} DRILLS AVAILABLE
                  </span>

                  {/* Manual Horizontal Scroll Arrow Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollTrack('left')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Left"
                      className="p-1.5 bg-[#040a12] hover:bg-[#00d2ff] hover:text-[#040a12] border border-[#102a4a] text-neutral-300 transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack('right')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Right"
                      className="p-1.5 bg-[#040a12] hover:bg-[#00d2ff] hover:text-[#040a12] border border-[#102a4a] text-neutral-300 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontally Scrollable Cards Container */}
              <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex flex-row gap-4 overflow-x-auto py-2 pr-2 scroll-smooth thin-pink-scrollbar skew-x-6"
              >
                {allScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-64 h-52 shrink-0 bg-[#040a12] hover:bg-[#00d2ff]/10 border-2 border-[#102a4a] hover:border-[#00d2ff] p-4 flex flex-col justify-between text-left transition-all duration-200 group -skew-x-6 shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:shadow-[0_0_20px_rgba(0,210,255,0.3),6px_6px_0_0_#000]"
                  >
                    <div className="skew-x-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#00d2ff] uppercase tracking-wider bg-[#00d2ff]/10 px-2 py-0.5 border border-[#00d2ff]/30">
                          {sc.category}
                        </span>
                        {sc.isCustom ? (
                          <span className="text-[9px] font-mono font-bold text-[#040a12] bg-[#00d2ff] px-1.5 py-0.5 border border-[#00d2ff]">
                            CUSTOM
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 font-bold">
                            {sc.durationSeconds}S
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-black text-base text-white group-hover:text-[#00d2ff] transition-colors leading-tight uppercase">
                        {sc.name}
                      </h3>

                      <p className="font-sans-ui text-[11px] text-neutral-300 line-clamp-2 leading-snug">
                        {sc.description}
                      </p>
                    </div>

                    <div className="skew-x-6 flex items-center justify-between border-t border-[#102a4a] pt-2.5 mt-2">
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1 font-bold">
                        <Target className="w-3.5 h-3.5 text-[#00d2ff]" /> {sc.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-[#00d2ff] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        START DRILL <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* MAIN MENU MODE - Persona 3 Reload (P3R) Style */
          <>
            {/* Title Section */}
            <div className="skew-x-6 space-y-3">
              <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-[0_0_20px_rgba(0,210,255,0.6)]">
                AIM <span className="text-[#00d2ff]">//</span> TT
              </h1>
              <div className="flex items-center justify-center gap-3 w-44 mx-auto">
                <div className="h-0.5 bg-gradient-to-r from-transparent to-[#00d2ff] flex-1" />
                <span className="text-[#00d2ff] text-xs font-mono">◆</span>
                <div className="h-0.5 bg-gradient-to-l from-transparent to-[#00d2ff] flex-1" />
              </div>
              <p className="font-mono text-[10px] md:text-xs text-[#00d2ff] tracking-widest uppercase font-extrabold">
                PERSONA 3 RELOAD // 3D AIM ENGINE
              </p>
            </div>

            {/* Daily Streak Indicator Badge */}
            <div className="skew-x-6 flex justify-center">
              <div className="-skew-x-12 px-6 py-2 bg-[#081424]/95 border-2 border-[#00d2ff] text-xs font-mono font-black flex items-center justify-center gap-2 text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3),4px_4px_0_0_#000] tracking-wider uppercase">
                <span className="skew-x-12">
                  {dailyStreak.streakCount > 0
                    ? `${dailyStreak.streakCount} DAY STREAK ACTIVE!`
                    : 'NO ACTIVE STREAK • COMPLETE A DRILL TODAY'}
                </span>
              </div>
            </div>

            {/* Main Menu Buttons - Authentic Persona 3 Reload Slanted Action Cards */}
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
                className="-skew-x-12 bg-[#00d2ff] text-[#040a12] border-2 border-[#00d2ff] py-3.5 px-6 font-display font-black text-xl md:text-2xl tracking-widest uppercase flex items-center justify-between shadow-[0_0_25px_rgba(0,210,255,0.5),5px_5px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-white hover:text-[#040a12] hover:border-white hover:shadow-[0_0_35px_rgba(255,255,255,0.7),8px_8px_0_0_#00d2ff] active:translate-x-0 active:translate-y-0 transition-all duration-200 group"
              >
                <span className="skew-x-12 group-hover:scale-105 transition-transform">START DRILL</span>
                <span className="skew-x-12 font-mono text-base group-hover:translate-x-2 transition-transform">▶</span>
              </button>

              {/* Option 2: DRILL LIBRARY */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-12 bg-[#081424] text-white border-2 border-[#00d2ff]/40 py-3.5 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-[#00d2ff] hover:text-[#040a12] hover:border-[#00d2ff] hover:shadow-[0_0_30px_rgba(0,210,255,0.6),7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-200 group"
              >
                <span className="skew-x-12 group-hover:scale-105 transition-transform">DRILL LIBRARY</span>
                <span className="skew-x-12 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">▶</span>
              </button>

              {/* Option 3: ANALYTICS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-12 bg-[#081424] text-white border-2 border-[#00d2ff]/40 py-3.5 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-[#00d2ff] hover:text-[#040a12] hover:border-[#00d2ff] hover:shadow-[0_0_30px_rgba(0,210,255,0.6),7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-200 group"
              >
                <span className="skew-x-12 group-hover:scale-105 transition-transform">ANALYTICS</span>
                <span className="skew-x-12 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">▶</span>
              </button>

              {/* Option 4: OPTIONS */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="-skew-x-12 bg-[#081424] text-white border-2 border-[#00d2ff]/40 py-3.5 px-6 font-display font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-between shadow-[4px_4px_0_0_#000] hover:-translate-y-1.5 hover:-translate-x-1 hover:bg-[#00d2ff] hover:text-[#040a12] hover:border-[#00d2ff] hover:shadow-[0_0_30px_rgba(0,210,255,0.6),7px_7px_0_0_#000] active:translate-x-0 active:translate-y-0 transition-all duration-200 group"
              >
                <span className="skew-x-12 group-hover:scale-105 transition-transform">OPTIONS</span>
                <span className="skew-x-12 font-mono text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">▶</span>
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
