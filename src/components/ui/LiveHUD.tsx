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
        <div className="flex flex-col gap-3 max-w-xs">
          {/* Current Scenario Header */}
          <div className="-skew-x-12 bg-[#081424]/95 text-white px-5 py-3 border-2 border-[#00d2ff]/60 shadow-[0_0_20px_rgba(0,210,255,0.3),4px_4px_0_0_#000] backdrop-blur-md">
            <div className="skew-x-12 flex flex-col">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-[#00d2ff] uppercase font-bold">
                <span>CURRENT SCENARIO</span>
                <span className="text-[9px] text-neutral-300 font-bold bg-[#040a12] px-2 py-0.5 border border-[#102a4a]">
                  {pauseKey} to pause
                </span>
              </div>
              <span className="font-display font-black text-lg text-white uppercase tracking-wide">
                {activeScenario.name}
              </span>
            </div>
          </div>

          {/* Compact Floating Stats Card - Persona 3 Reload Style */}
          <motion.div
            initial={performanceMode ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="-skew-x-12 bg-[#081424]/95 backdrop-blur-md border-2 border-[#102a4a] border-l-4 border-l-[#00d2ff] p-3.5 shadow-[0_0_15px_rgba(0,210,255,0.2),4px_4px_0_0_#000]"
          >
            <div className="skew-x-12 flex items-center justify-between gap-3 text-xs font-mono">
              {isTrackingMode ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase">TIME ON TARGET</span>
                    <span className="font-extrabold text-white text-sm">
                      {timeTrackedSec.toFixed(1)}s
                    </span>
                  </div>

                  <div className="h-6 w-px bg-[#102a4a]" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase">LOCK STREAK</span>
                    <span className="font-extrabold text-neutral-300 text-sm">
                      {currentStreakSec.toFixed(1)}s
                    </span>
                  </div>

                  <div className="h-6 w-px bg-[#102a4a]" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#00d2ff] font-bold uppercase">TARGET LOCK</span>
                    <span className="font-extrabold text-[#00d2ff] text-sm">
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

                  <div className="h-6 w-px bg-[#102a4a]" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase">MISSES</span>
                    <span className="font-extrabold text-neutral-400 text-sm">
                      <AnimatedNumber value={misses} />
                    </span>
                  </div>

                  <div className="h-6 w-px bg-[#102a4a]" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#00d2ff] font-bold uppercase">ACCURACY</span>
                    <span className="font-extrabold text-[#00d2ff] text-sm">
                      <AnimatedNumber value={accuracy} />%
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top-Right Prominent Metrics Grid */}
        <div className="flex items-center gap-3">
          {/* Timer - Primary Prominent */}
          <div className="-skew-x-12 flex items-center gap-2.5 bg-[#081424]/95 backdrop-blur-md text-white px-4 py-2.5 border-2 border-[#00d2ff]/50 shadow-[0_0_15px_rgba(0,210,255,0.2),4px_4px_0_0_#000]">
            <div className="skew-x-12 flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-[#00d2ff]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-neutral-400 font-bold">TIME</span>
                <span className="font-mono font-extrabold text-lg text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Live Score - Primary Prominent */}
          <div className="-skew-x-12 flex items-center gap-2.5 bg-[#081424]/95 backdrop-blur-md text-white px-5 py-2.5 border-2 border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.4),4px_4px_0_0_#000]">
            <div className="skew-x-12 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#00d2ff]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-[#00d2ff] font-bold">SCORE</span>
                <span className="font-mono font-extrabold text-xl text-white tracking-wider">
                  <AnimatedNumber value={score} />
                </span>
              </div>
            </div>
          </div>

          {/* Streak Combo - Persona 3 Reload Style */}
          {streak > 2 && (
            <div className="-skew-x-12 flex items-center justify-center bg-[#00d2ff] text-[#040a12] px-4 py-2.5 border-2 border-[#040a12] font-mono font-black text-xs tracking-wider animate-bounce shadow-[0_0_20px_rgba(0,210,255,0.6),4px_4px_0_0_#000]">
              <span className="skew-x-12">{streak}X STREAK!</span>
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
              className="pointer-events-auto -skew-x-12 bg-[#081424]/95 hover:bg-[#00d2ff] hover:text-[#040a12] text-white p-3 border-2 border-[#102a4a] hover:border-[#00d2ff] transition-all duration-150 active:scale-95 shadow-[3px_3px_0_0_#000] backdrop-blur-md"
            >
              <div className="skew-x-12">
                <Pause className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Countdown Overlay */}
      {status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#040a12]/90 backdrop-blur-md z-30 transition-all duration-200 bg-p3r-dots">
          <div className="flex flex-col items-center gap-4 -skew-x-12 bg-[#081424] border-4 border-[#00d2ff] p-8 shadow-[0_0_40px_rgba(0,210,255,0.5),8px_8px_0_0_#000]">
            <span className="skew-x-12 font-display text-8xl md:text-9xl font-black text-[#00d2ff] animate-pulse drop-shadow-[0_0_25px_rgba(0,210,255,0.8)]">
              {countdown}
            </span>
            <span className="skew-x-12 font-mono text-sm tracking-widest text-[#040a12] uppercase font-extrabold bg-[#00d2ff] px-4 py-1">
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
