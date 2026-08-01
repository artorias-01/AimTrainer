import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CrosshairPreview } from './CrosshairPreview';
import { Timer, Zap, Pause } from 'lucide-react';
import { soundManager } from '../../utils/audio';

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
    trackingHp,
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
          <div className="flex flex-col bg-[#0d0d0d]/90 text-white px-5 py-3 rounded-[12px] border border-[#262626] backdrop-blur-md">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-accent uppercase">
              <span>CURRENT SCENARIO</span>
              <span className="text-[9px] text-neutral-500 font-bold bg-[#141414] px-2 py-0.5 rounded-[6px] border border-[#262626]">
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
            className="bg-[#0d0d0d]/95 backdrop-blur-md border border-[#262626] border-l-2 border-l-accent rounded-[12px] p-3.5 flex items-center justify-between gap-3 text-xs font-mono shadow-lg"
          >
            {isTrackingMode ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">TIME ON TARGET</span>
                  <span className="font-extrabold text-white text-sm">
                    {timeTrackedSec.toFixed(1)}s
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">LOCK STREAK</span>
                  <span className="font-extrabold text-neutral-300 text-sm">
                    {currentStreakSec.toFixed(1)}s
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-accent font-bold uppercase">TARGET LOCK</span>
                  <span className="font-extrabold text-accent text-sm">
                    <AnimatedNumber value={liveTrackingAcc} />%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">HITS</span>
                  <span className="font-extrabold text-white text-sm">
                    <AnimatedNumber value={hits} />
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase">MISSES</span>
                  <span className="font-extrabold text-neutral-400 text-sm">
                    <AnimatedNumber value={misses} />
                  </span>
                </div>

                <div className="h-6 w-px bg-[#262626]" />

                <div className="flex flex-col">
                  <span className="text-[9px] text-accent font-bold uppercase">ACCURACY</span>
                  <span className="font-extrabold text-accent text-sm">
                    <AnimatedNumber value={accuracy} />%
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Aim Labs-Style Tracking Health / HP Bar */}
          {isTrackingMode && (
            <motion.div
              initial={performanceMode ? false : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d0d0d]/95 backdrop-blur-md border border-[#262626] rounded-[12px] p-3 space-y-1.5 shadow-lg font-mono text-xs"
            >
              <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase">
                <span className="flex items-center gap-1.5 text-accent">
                  TRACKING HP
                </span>
                <span className="text-white font-extrabold">{Math.round(trackingHp)}%</span>
              </div>
              <div className="w-full bg-[#141414] border border-[#262626] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, trackingHp))}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Top-Right Prominent Metrics Grid */}
        <div className="flex items-center gap-3">
          {/* Timer - Primary Prominent */}
          <div className="flex items-center gap-2.5 bg-[#0d0d0d]/90 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] border border-pink/40 shadow-sm">
            <Timer className="w-4 h-4 text-pink" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-neutral-400">TIME</span>
              <span className="font-mono font-extrabold text-lg text-white">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Live Score - Primary Prominent */}
          <div className="flex items-center gap-2.5 bg-[#0d0d0d]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-[12px] border border-pink shadow-sm">
            <Zap className="w-4 h-4 text-pink" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-pink">SCORE</span>
              <span className="font-mono font-extrabold text-xl text-white tracking-wider">
                <AnimatedNumber value={score} />
              </span>
            </div>
          </div>

          {/* Streak Combo */}
          {streak > 2 && (
            <div className="flex items-center justify-center bg-pink text-[#0d0d0d] px-3.5 py-2.5 rounded-[12px] font-mono font-extrabold text-xs tracking-wider animate-bounce">
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
              className="pointer-events-auto bg-[#0d0d0d]/90 hover:bg-pink hover:text-[#0d0d0d] text-white p-3 rounded-[12px] border border-[#262626] hover:border-pink transition-all duration-150 active:scale-95 backdrop-blur-md"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Countdown Overlay */}
      {status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-30 transition-all duration-200">
          <div className="flex flex-col items-center gap-4">
            <span className="font-display text-8xl md:text-9xl font-extrabold text-pink animate-pulse drop-shadow-lg">
              {countdown}
            </span>
            <span className="font-mono text-sm tracking-widest text-white uppercase">
              GET READY // TARGETS SPAWNING
            </span>
          </div>
        </div>
      )}

      {/* Center Screen Crosshair */}
      {status === 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <CrosshairPreview config={crosshair} sizePx={80} transparent={true} />
        </div>
      )}
    </div>
  );
};
