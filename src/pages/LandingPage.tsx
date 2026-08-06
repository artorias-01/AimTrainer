import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene } from '../components/3d/HeroScene';
import { getDailyStreak } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CrosshairPreview } from '../components/ui/CrosshairPreview';
import { soundManager } from '../utils/audio';
import { ChevronLeft, Flame, MousePointer, Key } from 'lucide-react';
import type { ScenarioCategory } from '../utils/scenarios';
import { diagonalWipeVariants, springPunch } from '../utils/motion';

interface LandingPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [pageMode, setPageMode] = useState<'main-menu' | 'drill-select'>('main-menu');
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory | 'all'>('all');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [lockedNodeData, setLockedNodeData] = useState<{
    key: string;
    title: string;
    type: string;
    category?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { setScenario } = useGameStore();
  const crosshairConfig = useSettingsStore((s) => s.crosshair);

  const dailyStreak = getDailyStreak();

  // Listen to Pointer Lock status
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      setIsPointerLocked(isLocked);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  // Keyboard Navigation & ESC Key release / back handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundManager.playClick();
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else if (pageMode === 'drill-select') {
          setPageMode('main-menu');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageMode]);

  const requestPointerLock = useCallback(() => {
    if (containerRef.current && document.pointerLockElement === null) {
      soundManager.playClick();
      containerRef.current.requestPointerLock();
    }
  }, []);

  const handleSelectMenuKey = useCallback(
    (key: string) => {
      soundManager.playClick();
      if (key === 'drill-select') {
        setPageMode('drill-select');
      } else if (key === 'library') {
        if (document.pointerLockElement) document.exitPointerLock();
        onNavigate('library');
      } else if (key === 'dashboard') {
        if (document.pointerLockElement) document.exitPointerLock();
        onNavigate('dashboard');
      } else if (key === 'settings') {
        if (document.pointerLockElement) document.exitPointerLock();
        onNavigate('settings');
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

  const categories: { id: ScenarioCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'ALL DRILLS' },
    { id: 'clicking', label: 'CLICKING' },
    { id: 'tracking', label: 'TRACKING' },
    { id: 'switching', label: 'SWITCHING' },
    { id: 'precision', label: 'PRECISION' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] bg-[#0d0d0d] text-white overflow-hidden select-none"
    >
      {/* 3D Spatial Aim-to-Select Background & Node Scene */}
      <div className="absolute inset-0 z-0">
        <HeroScene
          mode={pageMode}
          activeCategory={activeCategory}
          isPointerLocked={isPointerLocked}
          onLockOnNode={(_, data) => setLockedNodeData(data || null)}
          onSelectMenuKey={handleSelectMenuKey}
          onSelectScenarioId={handleSelectScenarioId}
        />
      </div>

      {/* Radial Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(13,13,13,0.88)_100%)] pointer-events-none" />

      {/* Central Screen Crosshair Reticle Overlay (Only visible when pointer locked) */}
      {isPointerLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center">
          {/* Dynamic Lock-On Brackets around Crosshair */}
          <motion.div
            animate={{ scale: lockedNodeData ? 1.12 : 1.0 }}
            transition={springPunch}
            className="relative flex items-center justify-center"
          >
            {lockedNodeData && (
              <div className="absolute -inset-4 border-2 border-accent rounded-[12px] opacity-85 animate-pulse shadow-[0_0_20px_var(--accent-color)]" />
            )}

            {/* Player Active Crosshair */}
            <CrosshairPreview config={crosshairConfig} sizePx={64} transparent />
          </motion.div>
        </div>
      )}

      {/* 2D HUD Chrome Header Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springPunch}
        className="absolute top-6 right-6 z-20 pointer-events-auto flex items-center gap-3"
      >
        {/* Optional Aim Lock Mode Toggle Button */}
        <button
          onClick={() => {
            if (isPointerLocked) {
              document.exitPointerLock();
            } else {
              requestPointerLock();
            }
          }}
          className={`px-3.5 py-1.5 rounded-[12px] text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
            isPointerLocked
              ? 'bg-accent text-[#0d0d0d] border-accent shadow-[0_0_15px_var(--accent-color)] font-extrabold'
              : 'bg-[#0d0d0d]/80 text-neutral-300 border-[#262626] hover:border-accent hover:text-white'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>{isPointerLocked ? '3D AIM MODE ACTIVE [ESC]' : 'ENABLE 3D AIM MODE'}</span>
        </button>

        {/* Daily Streak Badge */}
        <div className="px-3.5 py-1.5 rounded-[12px] bg-[#0d0d0d]/90 border border-accent/40 text-xs font-mono font-bold flex items-center justify-center gap-2 text-accent backdrop-blur-md shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.15)] tracking-wider pointer-events-none">
          <Flame className="w-3.5 h-3.5 text-accent animate-bounce" />
          <span>
            {dailyStreak.streakCount > 0
              ? `${dailyStreak.streakCount} DAY STREAK`
              : 'NO STREAK'}
          </span>
        </div>

        {/* ESC Key release hint when pointer locked */}
        {isPointerLocked && (
          <div className="px-3 py-1.5 rounded-[12px] bg-[#0d0d0d]/80 border border-[#262626] text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 pointer-events-none">
            <Key className="w-3 h-3 text-accent" />
            <span>[ESC] UNLOCK</span>
          </div>
        )}
      </motion.div>

      {/* Drill Selector 2D Category Filter Bar (Bottom Center in Drill-Select Mode) with Sharp Diagonal Slice Wipe */}
      <AnimatePresence>
        {pageMode === 'drill-select' && (
          <motion.div
            variants={diagonalWipeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 bg-[#0d0d0d]/90 backdrop-blur-md p-2 rounded-[16px] border border-[#262626] shadow-2xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setPageMode('main-menu');
              }}
              className="px-3 py-1.5 rounded-[10px] bg-[#141414] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#262626] font-mono text-xs font-bold flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-accent" /> BACK TO MAIN MENU
            </button>

            <div className="h-4 w-px bg-[#262626] mx-1" />

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-mono font-bold transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-accent text-[#0d0d0d] border-accent shadow-[0_0_12px_var(--accent-color)] font-extrabold'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border-[#262626]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
