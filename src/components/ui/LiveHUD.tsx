import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CrosshairPreview } from './CrosshairPreview';
import { Timer, Zap, Pause } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { countdownPunchVariants } from '../../utils/motion';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const endVal = value;
    if (startVal === endVal) return;

    const duration = 250; // 250ms smooth count-up transition
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.round(startVal + (endVal - startVal) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const LiveHUD: React.FC = () => {
  const {
    activeScenario,
    status,
    countdown,
    timeLeft,
    score,
    hits,
    misses,
    streak,
    timeOnTargetMs,
    totalSessionTimeMs,
    currentTrackingStreakMs,
    pauseSession,
  } = useGameStore();

  const { crosshair, pauseKey, performanceMode } = useSettingsStore();

  const isTrackingMode = activeScenario.category === 'tracking';

  const totalShots = hits + misses;
  const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 100;

  const liveTrackingAcc = totalSessionTimeMs > 0 ? Math.round((timeOnTargetMs / totalSessionTimeMs) * 100) : 0;
  const timeTrackedSec = Math.round((timeOnTargetMs / 1000) * 10) / 10;
  const currentStreakSec = Math.round((currentTrackingStreakMs / 1000) * 10) / 10;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex flex-col justify-between p-6">
      {/* Top Header Section */}
      <div className="flex items-start justify-between">
        {/* Top-Left Stack: Scenario Info + Motion-inspired Floating Stats Card */}
        <div className="flex flex-col gap-2.5 max-w-xs">
          {/* Current Scenario Header */}
          <div className="flex flex-col bg-[#0d0d0d]/90 text-white px-5 py-3 clip-corner-tr border border-[#262626] backdrop-blur-md">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-accent uppercase font-bold">
              <span>CURRENT SCENARIO</span>
              <span className="text-[9px] text-neutral-500 font-bold bg-[#141414] px-2 py-0.5 clip-corner-tr border border-[#262626]">
                {pauseKey} to pause
              </span>
            </div>
            <span className="font-display font-extrabold text-lg text-white">
              {activeScenario.name}
            </span>
          </div>

          {/* Compact Floating Stats Card - Category Driven */}
          <motion.div
            initial={performanceMode ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-[#0d0d0d]/95 backdrop-blur-md border border-[#262626] border-l-2 border-l-accent clip-corner-diagonal p-3.5 flex items-center justify-between gap-3 text-xs font-mono shadow-lg"
          >
            {isTrackingMode ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">TIME ON TARGET</span>
                  <span className="font-extrabold text-white text-sm font-mono">
                    {timeTrackedSec.toFixed(1)}s
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">LOCK STREAK</span>
                  <span className="font-extrabold text-neutral-300 text-sm font-mono">
                    {currentStreakSec.toFixed(1)}s
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-accent font-bold uppercase">TARGET LOCK</span>
                  <span className="font-extrabold text-accent text-sm font-mono">
                    <AnimatedNumber value={liveTrackingAcc} />%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">HITS</span>
                  <span className="font-extrabold text-white text-sm font-mono">
                    <AnimatedNumber value={hits} />
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">MISSES</span>
                  <span className="font-extrabold text-neutral-400 text-sm font-mono">
                    <AnimatedNumber value={misses} />
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-accent font-bold uppercase">ACCURACY</span>
                  <span className="font-extrabold text-accent text-sm font-mono">
                    <AnimatedNumber value={accuracy} />%
                  </span>
                </div>
              </>
            )}
          </motion.div>

        </div>

        {/* Top-Right Prominent Metrics Grid */}
        <div className="flex items-center gap-3">
          {/* Timer - Primary Prominent */}
          <div className="flex items-center gap-2.5 bg-[#0d0d0d]/90 backdrop-blur-md text-white px-4 py-2.5 clip-corner-tr border border-pink/40 shadow-sm">
            <Timer className="w-4 h-4 text-pink" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-neutral-400 font-bold">TIME</span>
              <span className="font-mono font-extrabold text-lg text-white">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Live Score - Primary Prominent */}
          <div className="flex items-center gap-2.5 bg-[#0d0d0d]/90 backdrop-blur-md text-white px-5 py-2.5 clip-corner-tr border border-pink shadow-sm">
            <Zap className="w-4 h-4 text-pink" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-pink font-bold">SCORE</span>
              <span className="font-mono font-extrabold text-xl text-white tracking-wider">
                <AnimatedNumber value={score} />
              </span>
            </div>
          </div>

          {/* Streak Combo */}
          {streak > 2 && (
            <div className="flex items-center justify-center bg-pink text-[#0d0d0d] px-3.5 py-2.5 clip-corner-tr font-mono font-extrabold text-xs tracking-wider animate-bounce">
              <span>{streak}X STREAK</span>
            </div>
          )}

          {/* Pause Button */}
          {status === 'playing' && (
            <button
              onClick={() => {
                soundManager.playClick();
                pauseSession();
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="pointer-events-auto bg-[#0d0d0d]/90 hover:bg-pink hover:text-[#0d0d0d] text-white p-3 clip-corner-tr border border-[#262626] hover:border-pink transition-all duration-150 active:scale-95 backdrop-blur-md"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Persona-Inspired Kinetic Countdown Overlay */}
      <AnimatePresence mode="wait">
        {status === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-30 select-none overflow-hidden"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-3xl font-extrabold text-pink opacity-40 select-none">//</span>
                <motion.span
                  key={countdown}
                  variants={countdownPunchVariants}
                  initial="initial"
                  animate="animate"
                  className="font-display text-8xl md:text-9xl font-black text-pink drop-shadow-[0_0_35px_rgba(var(--accent-color-rgb),0.5)] tracking-tighter"
                >
                  {countdown}
                </motion.span>
                <span className="font-mono text-3xl font-extrabold text-pink opacity-40 select-none">//</span>
              </div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs md:text-sm tracking-[0.25em] text-white uppercase font-extrabold bg-[#0d0d0d]/90 px-4 py-1.5 rounded-[8px] border border-pink/40 shadow-lg"
              >
                GET READY <span className="text-pink">//</span> TARGETS SPAWNING
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Screen Crosshair */}
      {status === 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <CrosshairPreview config={crosshair} sizePx={80} transparent={true} />
        </div>
      )}
    </div>
  );
};
