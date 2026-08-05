import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { getAllScenarios } from '../utils/scenarios';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import {
  Target,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Sliders,
  Layers,
  Crosshair,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [showDrillMenu, setShowDrillMenu] = useState(false);
  const { setScenario } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Framer Motion Scroll Progress tracking for 3D Camera & Parallax Layers
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [rawProgress, setRawProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = smoothScrollProgress.on('change', (val) => {
      setRawProgress(val);
    });
    return () => unsubscribe();
  }, [smoothScrollProgress]);

  // Section 1 Parallax Transforms
  const heroOpacity = useTransform(smoothScrollProgress, [0, 0.22], [1, 0]);
  const heroScale = useTransform(smoothScrollProgress, [0, 0.22], [1, 0.92]);
  const heroY = useTransform(smoothScrollProgress, [0, 0.22], [0, -50]);

  // Section 2 Parallax Transforms
  const sec2Opacity = useTransform(smoothScrollProgress, [0.18, 0.28, 0.48, 0.55], [0, 1, 1, 0]);
  const sec2Y = useTransform(smoothScrollProgress, [0.18, 0.28, 0.48, 0.55], [60, 0, 0, -60]);

  // Section 3 Parallax Transforms
  const sec3Opacity = useTransform(smoothScrollProgress, [0.48, 0.58, 0.78, 0.84], [0, 1, 1, 0]);
  const sec3Y = useTransform(smoothScrollProgress, [0.48, 0.58, 0.78, 0.84], [60, 0, 0, -60]);

  // Section 4 Parallax Transforms
  const sec4Opacity = useTransform(smoothScrollProgress, [0.78, 0.88], [0, 1]);
  const sec4Y = useTransform(smoothScrollProgress, [0.78, 0.88], [60, 0]);

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

  const handleWheelTrack = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollTrackRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollTrackRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollTrack = (direction: 'left' | 'right') => {
    if (scrollTrackRef.current) {
      const scrollAmount = 340;
      scrollTrackRef.current.scrollBy({
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
    <div ref={containerRef} className="relative w-full bg-[#0d0d0d] text-white select-none">
      {/* Fixed 3D R3F Canvas Layer (Stays pinned in background while page scrolls) */}
      <div className="fixed top-[73px] left-0 w-full h-[calc(100vh-73px)] z-0 opacity-80 pointer-events-none">
        <HeroScene scrollProgress={rawProgress} />
      </div>

      {/* Fixed Radial Vignette Gradient & Ambient Light Polish */}
      <div className="fixed top-[73px] left-0 w-full h-[calc(100vh-73px)] z-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(13,13,13,0.85)_100%)] pointer-events-none" />

      {/* Top Floating Scroll Progress Bar */}
      <div className="fixed top-[73px] left-0 w-full h-1 bg-[#1a1a1a] z-40 pointer-events-none">
        <motion.div
          className="h-full bg-accent shadow-[0_0_10px_var(--accent-color)]"
          style={{ scaleX: smoothScrollProgress, transformOrigin: '0%' }}
        />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO & MAIN NAVIGATION MENU (0 - 100vh)                      */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full h-[calc(100vh-73px)] flex flex-col justify-center items-center p-6">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="w-full max-w-lg text-center space-y-6 bg-[#0d0d0d]/55 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-[#262626]/80 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Title Branding */}
          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none text-white drop-shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.35)]">
              AIM <span className="text-accent">//</span> TT
            </h1>
            <div className="flex items-center justify-center gap-3 w-44 mx-auto opacity-80">
              <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1" />
              <span className="text-accent text-xs font-mono animate-pulse">◆</span>
              <div className="h-px bg-gradient-to-l from-transparent via-accent to-transparent flex-1" />
            </div>
            <p className="font-mono text-[10px] md:text-xs text-neutral-400 tracking-widest uppercase font-bold">
              3D SCROLL INTERACTIVE AIM ENGINE
            </p>
          </div>

          {/* Daily Streak Badge */}
          <div className="flex justify-center">
            <div className="px-4 py-1.5 rounded-[12px] bg-[#141414]/90 border border-accent/40 text-xs font-mono font-bold flex items-center justify-center gap-2 text-accent backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.15)] tracking-wider">
              <Flame className="w-4 h-4 text-accent animate-bounce" />
              <span>
                {dailyStreak.streakCount > 0
                  ? `${dailyStreak.streakCount} DAY STREAK ACTIVE`
                  : 'NO ACTIVE STREAK • COMPLETE A DRILL TODAY'}
              </span>
            </div>
          </div>

          {/* Main Menu Action Buttons */}
          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto py-2">
            <motion.button
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                setShowDrillMenu(true);
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="group relative font-display font-extrabold text-2xl md:text-3xl tracking-widest text-white hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
            >
              <span className="text-accent font-mono text-base transition-transform group-hover:-translate-x-1.5">‹</span>
              <span className="relative">
                START DRILL
                <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
              </span>
              <span className="text-accent font-mono text-base transition-transform group-hover:translate-x-1.5">›</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('library');
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
              <span className="relative">
                DRILL LIBRARY
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('dashboard');
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
              <span className="relative">
                ANALYTICS
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('settings');
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="group relative font-display font-bold text-lg md:text-2xl tracking-widest text-neutral-300 hover:text-accent transition-colors duration-200 py-1 flex items-center justify-center gap-2 focus:outline-none"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm -translate-x-1 group-hover:translate-x-0">‹</span>
              <span className="relative">
                OPTIONS
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-250 ease-out shadow-[0_0_8px_var(--accent-color)]" />
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-accent font-mono text-sm translate-x-1 group-hover:translate-x-0">›</span>
            </motion.button>
          </div>

          {/* Scroll Down Prompt Indicator */}
          <div className="pt-2 flex flex-col items-center opacity-70">
            <span className="font-mono text-[9px] text-accent font-bold tracking-widest uppercase animate-pulse">
              SCROLL DOWN TO EXPLORE 3D ENGINE
            </span>
            <ChevronDown className="w-4 h-4 text-accent animate-bounce mt-1" />
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: 3D PRECISION ENGINE CAPABILITIES (100 - 200vh)                */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full h-[100vh] flex flex-col justify-center items-center p-6">
        <motion.div
          style={{ opacity: sec2Opacity, y: sec2Y }}
          className="w-full max-w-5xl space-y-8"
        >
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-[8px] border border-accent/20">
              FEATURE STORY 01 // PRECISION PHYSICS
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
              SPATIAL ACCURACY & CONTINUOUS TRACKING
            </h2>
            <p className="font-sans-ui text-sm text-neutral-400 max-w-xl mx-auto">
              Built on WebGL and high-precision raycasting to mirror raw mouse sensory input without smoothing or latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                SUB-PIXEL RAYCASTING
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Direct camera center ray intersection logic with zero mouse smoothing or interpolation delay.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Sliders className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                DYNAMIC LISSAJOUS LOOPS
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Smooth sinusoidal, erratic juke, and air-strafe trajectories simulating competitive movement shooters.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                MULTI-HIT AUTO-FIRE
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Sustained target hit-point depletion and full-auto spray mechanics for smooth-switch and tracking drills.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CUSTOMIZATION MATRIX & STUDIO (200 - 300vh)                   */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full h-[100vh] flex flex-col justify-center items-center p-6">
        <motion.div
          style={{ opacity: sec3Opacity, y: sec3Y }}
          className="w-full max-w-5xl space-y-8"
        >
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-[8px] border border-accent/20">
              FEATURE STORY 02 // TAILORED SUITE
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
              STUDIO CUSTOMIZATION & BACKDROP ENGINE
            </h2>
            <p className="font-sans-ui text-sm text-neutral-400 max-w-xl mx-auto">
              Personalize every aspect of your training environment — from crosshair sub-pixel vectors to 50MB background images.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('library');
              }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl cursor-pointer transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                CUSTOM SCENARIO CREATOR
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Design custom drills specifying target radius, speed, path patterns, target HP, and auto/semi fire modes.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('settings');
              }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl cursor-pointer transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Crosshair className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                CROSSHAIR STUDIO
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Configure inner/outer dot gaps, thickness, opacity, and assign per-scenario crosshair presets.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                soundManager.playClick();
                onNavigate('settings');
              }}
              className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] hover:border-accent p-6 rounded-[18px] space-y-3 shadow-xl cursor-pointer transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors">
                50MB BACKDROP ENGINE
              </h3>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Upload custom background images stored in IndexedDB with WebGL alpha transparency and contrast panels.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: DIRECT LAUNCHER & DRILL HUB (300 - 400vh)                     */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full h-[100vh] flex flex-col justify-center items-center p-6">
        <motion.div
          style={{ opacity: sec4Opacity, y: sec4Y }}
          className="w-full max-w-6xl space-y-6 text-left"
        >
          {/* Header */}
          <div className="bg-[#0d0d0d]/85 backdrop-blur-md border border-[#262626] p-6 rounded-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase block">
                LAUNCH HUB // QUICK DRILL SELECTOR
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                READY TO TRAIN YOUR AIM?
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-pink px-5 py-2.5 text-xs font-bold uppercase flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> FULL LIBRARY
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollTrack('left')}
                  onMouseEnter={() => soundManager.playHover()}
                  className="p-2 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack('right')}
                  onMouseEnter={() => soundManager.playHover()}
                  className="p-2 rounded-[8px] bg-[#141414] hover:bg-accent/20 border border-[#262626] hover:border-accent text-neutral-300 hover:text-accent transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Track */}
          <div
            ref={scrollTrackRef}
            onWheel={handleWheelTrack}
            className="flex flex-row gap-4 overflow-x-auto py-3 pr-2 scroll-smooth thin-pink-scrollbar"
          >
            {allScenarios.map((sc) => (
              <motion.button
                key={sc.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectDrill(sc.id)}
                onMouseEnter={() => soundManager.playHover()}
                className="w-72 h-56 shrink-0 bg-[#0d0d0d]/90 backdrop-blur-md hover:bg-accent/10 border border-[#262626] hover:border-accent rounded-[16px] p-5 flex flex-col justify-between text-left transition-colors duration-200 group focus:outline-none shadow-xl hover:shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.2)]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-[6px] border border-accent/20">
                      {sc.category}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold">
                      {sc.durationSeconds}S
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-white group-hover:text-accent transition-colors leading-tight">
                    {sc.name}
                  </h3>

                  <p className="font-sans-ui text-xs text-neutral-400 line-clamp-2 leading-snug">
                    {sc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#262626] pt-3 mt-2">
                  <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1 font-bold">
                    <Target className="w-3.5 h-3.5 text-accent" /> {sc.difficulty}
                  </span>
                  <span className="text-[11px] font-mono text-accent font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    START DRILL <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Floating ESC / Menu Modal Overlay when user clicks START DRILL inside menu */}
      {showDrillMenu && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0d0d0d]/95 border border-accent/50 rounded-[20px] p-6 max-w-5xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <span className="font-mono text-xs text-accent font-bold tracking-widest uppercase flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" /> SELECT DRILL TO LAUNCH [ESC]
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(false);
                }}
                className="px-3 py-1 rounded-[8px] bg-[#141414] hover:bg-[#262626] text-neutral-400 hover:text-white text-xs font-mono font-bold border border-[#262626]"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-1 thin-pink-scrollbar">
              {allScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setShowDrillMenu(false);
                    handleSelectDrill(sc.id);
                  }}
                  className="bg-[#141414] hover:bg-accent/10 border border-[#262626] hover:border-accent rounded-[12px] p-4 text-left space-y-2 transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-accent font-bold uppercase">{sc.category}</span>
                    <span className="text-neutral-400">{sc.durationSeconds}S</span>
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-white group-hover:text-accent transition-colors">
                    {sc.name}
                  </h4>
                  <p className="font-sans-ui text-xs text-neutral-400 line-clamp-2">{sc.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
