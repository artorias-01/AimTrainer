import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS, getScenarioById } from '../utils/scenarios';
import { HeatmapChart } from '../components/ui/HeatmapChart';
import { ReactionTimeHistogram } from '../components/ui/ReactionTimeHistogram';
import { AnimatedCountUp } from '../components/ui/AnimatedCountUp';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import {
  Trophy,
  RotateCcw,
  Library,
  Target,
  Zap,
  Clock,
  ArrowRight,
  Play,
  User,
  Download,
  Award,
  Layers,
  Flame,
  Timer,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface ResultsPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const {
    lastSessionSummary,
    isNewPB,
    startSession,
    setScenario,
    activeScenario,
    activeRoutine,
    routineResults,
    isBenchmarkMode,
    lastBenchmarkSummary,
    advancePlaylistStep,
  } = useGameStore();

  const { refreshStats } = useStatsStore();
  const displayName = useSettingsStore((s) => s.displayName);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  useEffect(() => {
    refreshStats();
    if (isNewPB) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [themeAccentColor, '#ffffff', '#0d0d0d'],
      });
    }
  }, [isNewPB, refreshStats, themeAccentColor]);

  const summary = lastSessionSummary || {
    id: 'demo',
    scenarioId: activeScenario.id,
    scenarioName: activeScenario.name,
    timestamp: Date.now(),
    score: 72400,
    accuracy: 92.5,
    hits: 148,
    misses: 12,
    avgTtkMs: 345,
    maxCombo: 38,
    grade: 'S' as const,
    hitLocations: [],
    reactionTimesMs: [240, 260, 310, 190, 280, 220, 250],
  };

  const scenarioDef = getScenarioById(summary.scenarioId) || activeScenario;
  const isTrackingMode = summary.isTracking || scenarioDef.category === 'tracking';

  const currentIndex = SCENARIOS.findIndex((s) => s.id === summary.scenarioId);
  const nextScenario = SCENARIOS[(currentIndex + 1) % SCENARIOS.length];

  // Prepare tracking timeline data for Recharts line chart
  const trackingTimelineData = summary.trackingTimeline && summary.trackingTimeline.length > 0
    ? summary.trackingTimeline
    : Array.from({ length: 15 }, (_, i) => ({
        timeSec: (i + 1) * 4,
        onTargetPct: Math.min(100, Math.max(20, Math.round(summary.accuracy + (Math.sin(i) * 12)))),
      }));

  const handleDownloadShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = themeAccentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 590);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px Georgia';
    ctx.fillText('AIM // TT PERFORMANCE REPORT', 60, 100);

    ctx.fillStyle = themeAccentColor;
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`DRILL: ${summary.scenarioName.toUpperCase()}`, 60, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 96px Georgia';
    ctx.fillText(summary.score.toLocaleString(), 60, 280);
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('SCORE', 60, 320);

    ctx.fillStyle = themeAccentColor;
    ctx.fillRect(900, 80, 220, 220);
    ctx.fillStyle = '#0d0d0d';
    ctx.font = '900 120px Georgia';
    ctx.fillText(summary.grade, 950, 230);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';

    if (isTrackingMode) {
      const timeTrackedSec = summary.timeOnTargetMs ? (summary.timeOnTargetMs / 1000).toFixed(1) : (summary.hits || 0).toFixed(1);
      const durationSec = summary.totalSessionTimeMs ? (summary.totalSessionTimeMs / 1000).toFixed(1) : (scenarioDef.durationSeconds || 60).toFixed(1);
      const streakSec = summary.longestStreakMs ? (summary.longestStreakMs / 1000).toFixed(2) : (summary.maxCombo || 0).toFixed(2);

      ctx.fillText(`TIME ON TARGET: ${summary.accuracy}%`, 60, 420);
      ctx.fillText(`TRACKED TIME: ${timeTrackedSec}s / ${durationSec}s`, 60, 480);
      ctx.fillText(`LONGEST STREAK: ${streakSec}s`, 600, 420);
      ctx.fillText(`CATEGORY: CONTINUOUS TRACKING`, 600, 480);
    } else {
      ctx.fillText(`ACCURACY: ${summary.accuracy}%`, 60, 420);
      ctx.fillText(`HITS: ${summary.hits} / ${summary.hits + summary.misses}`, 60, 480);
      ctx.fillText(`AVG TTK: ${summary.avgTtkMs}ms`, 600, 420);
      ctx.fillText(`MAX STREAK: ${summary.maxCombo}X`, 600, 480);
    }

    ctx.fillStyle = '#666666';
    ctx.font = '18px monospace';
    ctx.fillText(`PLAYER: ${displayName} • ${new Date(summary.timestamp).toLocaleDateString()}`, 60, 560);

    const link = document.createElement('a');
    link.download = `aimtt-result-${summary.scenarioId}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    soundManager.playClick();
  };

  const handleNextInPlaylist = () => {
    soundManager.playClick();
    const hasNext = advancePlaylistStep();
    if (hasNext) {
      onNavigate('arena');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto select-none text-left"
    >
      {/* Benchmark Summary Overlay Banner */}
      {isBenchmarkMode && lastBenchmarkSummary && (
        <div className="max-w-7xl mx-auto bg-[#141414] border border-pink rounded-[16px] p-8 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-pink" />
              <div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  BENCHMARK RANK COMPLETED
                </h3>
                <span className="font-mono text-xs text-neutral-400">
                  COMPOSITE EVALUATION ACROSS ALL CATEGORIES
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-neutral-400 block">TIER RATING</span>
              <span className="font-display font-black text-3xl text-pink">
                {lastBenchmarkSummary.grade}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
              <span className="text-neutral-400 block">COMPOSITE SCORE</span>
              <span className="font-bold text-xl text-white">
                <AnimatedCountUp value={lastBenchmarkSummary.compositeScore} />
              </span>
            </div>
            <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
              <span className="text-neutral-400 block">GRADE</span>
              <span className="font-bold text-xl text-pink">{lastBenchmarkSummary.grade}</span>
            </div>
            <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
              <span className="text-neutral-400 block">TIMESTAMP</span>
              <span className="font-bold text-white">
                {new Date(lastBenchmarkSummary.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
              <span className="text-neutral-400 block">STATUS</span>
              <span className="font-bold text-emerald-400">OFFICIAL RANK</span>
            </div>
          </div>
        </div>
      )}

      {/* Routine Summary Card */}
      {activeRoutine && routineResults.length > 0 && (
        <div className="max-w-7xl mx-auto bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <span className="font-mono text-xs text-pink uppercase tracking-widest flex items-center gap-2 font-bold">
              <Layers className="w-4 h-4 text-pink" /> ROUTINE: {activeRoutine.name}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              {routineResults.length} / {activeRoutine.drillIds.length} DRILLS COMPLETED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {routineResults.map((r, idx) => (
              <div key={idx} className="bg-[#0d0d0d] p-3.5 rounded-[12px] border border-[#262626] space-y-1">
                <span className="text-neutral-500 text-[10px] block">#{idx + 1} {r.scenarioName}</span>
                <span className="font-bold text-white text-base block">{r.score.toLocaleString()}</span>
                <span className="text-pink text-xs font-bold block">{r.accuracy}% ACC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-pink uppercase tracking-widest">
            <User className="w-3.5 h-3.5" />
            PLAYER: {displayName} // SESSION SUMMARY: {summary.scenarioName} ({scenarioDef.category.toUpperCase()})
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
            PERFORMANCE REPORT
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {isNewPB && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-pink text-[#0d0d0d] font-mono font-extrabold text-sm uppercase tracking-wider animate-bounce">
              <Trophy className="w-4 h-4 fill-[#0d0d0d]" />
              NEW PB RECORD!
            </div>
          )}

          <button
            onClick={handleDownloadShareCard}
            className="px-4 py-2.5 rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#262626] hover:border-pink text-xs font-mono font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-pink" />
            DOWNLOAD RESULT CARD (PNG)
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Grade Card & Score Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grade Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400">PERFORMANCE RATING</span>
              <div className="font-display font-extrabold text-6xl md:text-7xl text-white">
                <AnimatedCountUp value={summary.score} />
              </div>
              <span className="text-xs font-mono text-neutral-400 block">
                {isTrackingMode
                  ? `TIME ON TARGET: ${summary.accuracy}%`
                  : `${summary.hits} HITS // ${summary.misses} MISSES`}
              </span>
            </div>

            <div className="w-24 h-24 rounded-[12px] bg-pink text-[#0d0d0d] flex items-center justify-center font-display font-extrabold text-5xl shrink-0">
              {summary.grade}
            </div>
          </div>

          {/* Detailed Metrics Table - Category Aware */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
            <h3 className="font-mono text-xs text-pink uppercase tracking-widest">
              {isTrackingMode ? 'TRACKING METRICS BREAKDOWN' : 'CLICKING METRICS BREAKDOWN'}
            </h3>

            {isTrackingMode ? (
              /* TRACKING CATEGORY METRICS */
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-pink" /> TIME ON TARGET
                  </span>
                  <span className="font-bold text-2xl text-white">{summary.accuracy}%</span>
                </div>

                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-pink" /> TIME TRACKED
                  </span>
                  <span className="font-bold text-2xl text-white">
                    {summary.timeOnTargetMs
                      ? (summary.timeOnTargetMs / 1000).toFixed(1)
                      : (summary.hits || 0).toFixed(1)}s
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    / {summary.totalSessionTimeMs
                      ? (summary.totalSessionTimeMs / 1000).toFixed(1)
                      : (scenarioDef.durationSeconds || 60).toFixed(1)}s TOTAL
                  </span>
                </div>

                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1 col-span-2">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-pink" /> LONGEST ON-TARGET STREAK
                  </span>
                  <span className="font-bold text-2xl text-white">
                    {summary.longestStreakMs
                      ? (summary.longestStreakMs / 1000).toFixed(2)
                      : (summary.maxCombo || 0).toFixed(2)}s
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Continuous crosshair target lock duration
                  </span>
                </div>
              </div>
            ) : (
              /* CLICKING / PRECISION / SWITCHING CATEGORY METRICS */
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-pink" /> ACCURACY
                  </span>
                  <span className="font-bold text-2xl text-white">{summary.accuracy}%</span>
                </div>

                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink" /> AVG TTK
                  </span>
                  <span className="font-bold text-2xl text-white">{summary.avgTtkMs} ms</span>
                </div>

                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-pink" /> MAX STREAK
                  </span>
                  <span className="font-bold text-2xl text-white">{summary.maxCombo}X</span>
                </div>

                <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-pink" /> TOTAL SHOTS
                  </span>
                  <span className="font-bold text-2xl text-white">{summary.hits + summary.misses}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {(activeRoutine || isBenchmarkMode) ? (
              <button
                onClick={handleNextInPlaylist}
                className="btn-editorial-pink w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-[#0d0d0d]" />
                CONTINUE NEXT DRILL IN SEQUENCE <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                  setScenario(nextScenario.id);
                  startSession();
                  onNavigate('arena');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-pink w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-[#0d0d0d]" />
                NEXT DRILL: {nextScenario.name} <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                  startSession();
                  onNavigate('arena');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white border-[#262626] hover:bg-[#262626] hover:border-pink flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                RETRY DRILL
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('library');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="btn-editorial-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white border-[#262626] hover:bg-[#262626] hover:border-pink flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Library className="w-4 h-4" />
                LIBRARY
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts (7 Cols) - Category Driven */}
        <div className="lg:col-span-7 space-y-6">
          {isTrackingMode ? (
            /* TRACKING CATEGORY: SESSION TIMELINE ACCURACY CHART */
            <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div>
                  <h3 className="font-mono text-xs text-pink uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink" /> ON-TARGET TRACKING ACCURACY OVER TIME
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    Timeline graph showing continuous crosshair lock % across session duration
                  </p>
                </div>
                <span className="text-xs font-mono text-neutral-400 bg-[#0d0d0d] px-2.5 py-1 rounded-[8px] border border-[#262626]">
                  SESSION TIMELINE
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trackingTimelineData}>
                    <XAxis
                      dataKey="timeSec"
                      stroke="#666666"
                      fontSize={10}
                      tickLine={false}
                      unit="s"
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#666666"
                      fontSize={10}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d0d0d',
                        borderColor: themeAccentColor,
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#ffffff',
                      }}
                      formatter={(val: any) => [`${val}%`, 'On Target']}
                      labelFormatter={(label: any) => `Time: ${label}s`}
                    />
                    <Line
                      type="monotone"
                      dataKey="onTargetPct"
                      stroke={themeAccentColor}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: themeAccentColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* CLICKING CATEGORY: SPATIAL HEATMAP & REACTION TIME HISTOGRAM */
            <>
              {/* Spatial Heatmap Card */}
              <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs text-pink uppercase tracking-widest">
                    TARGET WALL HIT MATRIX
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">2D SPATIAL ERROR</span>
                </div>

                <div className="flex justify-center">
                  <HeatmapChart hitLocations={summary.hitLocations} width={500} height={220} />
                </div>
              </div>

              {/* Reaction Time Distribution Histogram */}
              <ReactionTimeHistogram reactionTimesMs={summary.reactionTimesMs || []} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
