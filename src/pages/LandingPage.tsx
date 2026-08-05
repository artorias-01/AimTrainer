import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { getAllScenarios } from '../utils/scenarios';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Target, ArrowRight, ChevronLeft, ChevronRight, Flame, Zap } from 'lucide-react';

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

  const menuContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  };

  return (
    <div className="relative w-full h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] bg-[#0d0d0d] text-white overflow-hidden flex flex-col justify-center items-center p-6 select-none">
      {/* Background 3D Real-Time Scene */}
      <div className="absolute inset-0 z-0 opacity-75">
        <HeroScene />
      </div>

      {/* Radial Dark Vignette Overlay with Ambient Accent Glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(13,13,13,0.85)_100%)] pointer-events-none" />

      {/* Dynamic Main Container */}
      <div
        className={`relative z-10 w-full transition-all duration-300 ${
          showDrillMenu
            ? 'max-w-7xl flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8'
            : 'max-w-lg text-center space-y-6 bg-[#0d0d0d]/50 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-[#262626]/80 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {showDrillMenu ? (
          /* DRILL SELECTOR HORIZONTAL LAYOUT */
          <>
            {/* Left Column: Title & Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0d0d0d]/85 backdrop-blur-lg p-6 rounded-[18px] border border-[#262626] shadow-2xl space-y-5 w-full md:w-72 shrink-0 flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight leading-none text-white drop-shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.3)]">
                  AIM <span className="text-accent">//</span> TT
                </h1>
                <div className="flex items-center gap-2 w-28 opacity-80">
                  <div className="h-px bg-gradient-to-r from-accent to-transparent flex-1" />
                  <span className="text-accent text-[10px] font-mono animate-pulse">◆</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block font-bold">
                  DRILL SELECTOR [ESC]
                </span>
                <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                  Choose from {allScenarios.length} competitive aim scenarios across clicking, precision, tracking, and switching categories.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-secondary py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 text-white border-[#262626] hover:border-accent transition-all focus:outline-none focus-visible:outline-accent"
              >
                <ChevronLeft className="w-4 h-4 text-accent" /> BACK TO MAIN MENU
              </motion.button>
            </motion.div>

            {/* Right Column: Horizontal Cards Scrollable Track */}
            <motion.div
              key="drill-horizontal-track"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.3 }}
              className="flex-1 w-full max-w-full overflow-hidden bg-[#0d0d0d]/90 backdrop-blur-lg border border-[#262626] rounded-[18px] p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent animate-pulse" /> SELECT TRAINING DRILL
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-400 bg-[#141414] px-3 py-1 rounded-[8px] border border-[#262626] font-bold">
                    {allScenarios.length} DRILLS AVAILABLE
                  </span>

                  {/* Manual Horizontal Scroll Arrow Buttons */}
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => scrollTrack('left')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Left"
                      className="p-1.5 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all focus:outline-none focus-visible:outline-accent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => scrollTrack('right')}
                      onMouseEnter={() => soundManager.playHover()}
                      title="Scroll Right"
                      className="p-1.5 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all focus:outline-none focus-visible:outline-accent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Horizontally Scrollable Cards Container */}
              <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex flex-row gap-4 overflow-x-auto py-2 pr-2 scroll-smooth thin-pink-scrollbar"
              >
                {allScenarios.map((sc) => (
                  <motion.button
                    key={sc.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectDrill(sc.id)}
                    onMouseEnter={() => soundManager.playHover()}
                    className="w-64 h-52 shrink-0 bg-[#0d0d0d] hover:bg-accent/10 border border-[#262626] hover:border-accent rounded-[14px] p-4 flex flex-col justify-between text-left transition-colors duration-200 group focus:outline-none focus-visible:outline-accent focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent shadow-lg hover:shadow-[0_0_20px_rgba(var(--accent-color-rgb),0.15)]"
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
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* MAIN MENU MODE */
          <>
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-3"
            >
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.35)]">
                AIM <span className="text-accent">//</span> TT
              </h1>
              <div className="flex items-center justify-center gap-3 w-44 mx-auto opacity-80">
                <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1" />
                <span className="text-accent text-xs font-mono animate-pulse">◆</span>
                <div className="h-px bg-gradient-to-l from-transparent via-accent to-transparent flex-1" />
              </div>
              <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase font-bold">
                3D ONLINE AIM ENGINE
              </p>
            </motion.div>

            {/* Daily Streak Indicator Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="px-4 py-1.5 rounded-[12px] bg-[#141414]/90 border border-accent/40 text-xs font-mono font-bold flex items-center justify-center gap-2 text-accent backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.15)] tracking-wider">
                <Flame className="w-4 h-4 text-accent animate-bounce" />
                <span>
                  {dailyStreak.streakCount > 0
                    ? `${dailyStreak.streakCount} DAY STREAK ACTIVE`
                    : 'NO ACTIVE STREAK • COMPLETE A DRILL TODAY'}
                </span>
              </div>
            </motion.div>

            {/* Main Menu Buttons */}
            <motion.div
              key="main-menu"
              variants={menuContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-5 max-w-xs mx-auto py-2"
            >
              {/* Option 1: START DRILL */}
              <motion.button
                variants={menuItemVariants}
                whileHover={{ scale: 1.04, x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-extrabold text-2xl md:text-3xl tracking-widest text-white hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="text-accent font-mono text-base transition-transform group-hover:-translate-x-1.5">‹</span>
                <span className="relative">
                  START DRILL
                  <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
                </span>
                <span className="text-accent font-mono text-base transition-transform group-hover:translate-x-1.5">›</span>
              </motion.button>

              {/* Option 2: DRILL LIBRARY */}
              <motion.button
                variants={menuItemVariants}
                whileHover={{ scale: 1.04, x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
                <span className="relative">
                  DRILL LIBRARY
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
              </motion.button>

              {/* Option 3: ANALYTICS */}
              <motion.button
                variants={menuItemVariants}
                whileHover={{ scale: 1.04, x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('dashboard');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
                <span className="relative">
                  ANALYTICS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
              </motion.button>

              {/* Option 4: OPTIONS */}
              <motion.button
                variants={menuItemVariants}
                whileHover={{ scale: 1.04, x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('settings');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:outline-accent"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
                <span className="relative">
                  OPTIONS
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
