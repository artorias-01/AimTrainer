import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { getAllScenarios } from '../utils/scenarios';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../utils/audio';
import { Target, ArrowRight, ChevronLeft, ChevronRight, Zap, Flame, Play, Sparkles, Layers, Sliders, Shield } from 'lucide-react';

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
      const scrollAmount = 340;
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
    <div className="relative w-full min-h-screen bg-[#030303] text-white pt-24 pb-16 px-6 md:px-12 flex flex-col justify-between select-none overflow-x-hidden">
      {/* Background 3D Real-Time Scene & Ambient Lighting */}
      <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
        <HeroScene />
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#030303]/70 via-[#030303]/40 to-[#030303] pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-pink/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto flex flex-col items-center text-center space-y-12">
        {showDrillMenu ? (
          /* QUICK DRILL SELECTOR MODAL VIEW */
          <motion.div
            key="drill-menu-container"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full glass-card rounded-[24px] p-6 md:p-8 space-y-6 shadow-2xl border border-white/10 text-left"
          >
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink/20 text-pink text-[10px] font-mono font-bold tracking-widest uppercase border border-pink/30">
                    QUICK DRILL SELECTOR
                  </span>
                  <span className="text-xs font-mono text-neutral-400">[ESC TO CANCEL]</span>
                </div>
                <h2 className="font-syne font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                  CHOOSE SCENARIO ({allScenarios.length} AVAILABLE)
                </h2>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollTrack('left')}
                    onMouseEnter={() => soundManager.playHover()}
                    className="p-2 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollTrack('right')}
                    onMouseEnter={() => soundManager.playHover()}
                    className="p-2 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowDrillMenu(false);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="px-4 py-2 rounded-[12px] bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-pink" /> BACK
                </button>
              </div>
            </div>

            {/* Horizontal Cards Slider */}
            <div
              ref={scrollContainerRef}
              onWheel={handleWheel}
              className="flex flex-row gap-5 overflow-x-auto py-3 scroll-smooth thin-pink-scrollbar"
            >
              {allScenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleSelectDrill(sc.id)}
                  onMouseEnter={() => soundManager.playHover()}
                  className="w-72 h-60 shrink-0 glass-card glass-card-hover rounded-[18px] p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold text-pink uppercase tracking-widest bg-pink/15 px-2.5 py-1 rounded-full border border-pink/30">
                        {sc.category}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                        {sc.durationSeconds}S
                      </span>
                    </div>

                    <h3 className="font-syne font-extrabold text-lg text-white group-hover:text-pink transition-colors leading-tight">
                      {sc.name}
                    </h3>

                    <p className="font-outfit text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {sc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 relative z-10">
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 font-bold">
                      <Target className="w-3.5 h-3.5 text-pink" /> {sc.difficulty}
                    </span>
                    <span className="text-xs font-mono text-pink font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      LAUNCH <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-pink/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* HERO MAIN VIEW */
          <motion.div
            key="hero-main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10 max-w-4xl"
          >
            {/* Top Pill Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs font-mono font-bold text-neutral-300 shadow-xl border border-white/15">
              <Sparkles className="w-4 h-4 text-pink animate-spin" style={{ animationDuration: '8s' }} />
              <span>NEXT-GEN BROWSER AIM ENGINE</span>
              <span className="text-white/20">|</span>
              <span className="text-pink font-extrabold">V2.4 ONLINE</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-syne font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.95] text-white">
                PRECISION<br />
                <span className="text-gradient-accent">ENGINE // 3D</span>
              </h1>
              <p className="font-outfit text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Hyper-responsive browser aim trainer built for raw spatial flicks, continuous smoothness tracking, custom 50MB backdrops, and competitive analytics.
              </p>
            </div>

            {/* Streak Status Card */}
            {dailyStreak.streakCount > 0 && (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[14px] bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 shadow-lg">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{dailyStreak.streakCount} DAY STREAK ACTIVE — KEEP THE HEAT!</span>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDrillMenu(true);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-pink px-8 py-4 text-sm font-syne font-extrabold tracking-wider flex items-center gap-3 shadow-xl glow-accent"
              >
                <Play className="w-4 h-4 fill-black" /> LAUNCH QUICK DRILL
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-secondary px-8 py-4 text-sm font-syne font-bold tracking-wider flex items-center gap-2"
              >
                EXPLORE DRILL LIBRARY <ArrowRight className="w-4 h-4 text-pink" />
              </button>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { label: 'RAW LATENCY', val: '<1MS INPUT', icon: Zap },
                { label: 'SCENARIO MATRIX', val: '20+ DRILLS', icon: Layers },
                { label: 'CUSTOM BACKDROP', val: '50MB UPLOADS', icon: Sliders },
                { label: 'STORAGE MODEL', val: 'INDEXEDDB', icon: Shield },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="glass-card rounded-[16px] p-4 text-left space-y-1 hover:border-pink/40 transition-colors">
                    <Icon className="w-4 h-4 text-pink mb-2" />
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block">{feat.label}</span>
                    <span className="font-syne font-extrabold text-sm text-white block">{feat.val}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
