import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS } from '../utils/scenarios';
import { HeatmapChart } from '../components/ui/HeatmapChart';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { Trophy, RotateCcw, Library, BarChart2, Flame, Target, Zap, Clock, ArrowRight, Play, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const { lastSessionSummary, isNewPB, startSession, setScenario, activeScenario } = useGameStore();
  const { refreshStats } = useStatsStore();
  const { displayName } = useSettingsStore();

  useEffect(() => {
    refreshStats();
    if (isNewPB) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f5b8c9', '#ffffff', '#0d0d0d'],
      });
    }
  }, [isNewPB, refreshStats]);

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
  };

  // Find next scenario in catalog
  const currentIndex = SCENARIOS.findIndex((s) => s.id === summary.scenarioId);
  const nextScenario = SCENARIOS[(currentIndex + 1) % SCENARIOS.length];

  // Mock chart data for session TTK graph
  const ttkTrendData = [
    { shot: 'Shot 1-20', ttk: summary.avgTtkMs + 45 },
    { shot: 'Shot 21-40', ttk: summary.avgTtkMs + 20 },
    { shot: 'Shot 41-60', ttk: summary.avgTtkMs - 10 },
    { shot: 'Shot 61-80', ttk: summary.avgTtkMs - 25 },
    { shot: 'Shot 81+', ttk: summary.avgTtkMs - 15 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 space-y-12 select-none"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
            <User className="w-3.5 h-3.5" />
            PLAYER: {displayName} // SESSION SUMMARY: {summary.scenarioName}
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
            PERFORMANCE REPORT
          </h1>
        </div>

        {isNewPB && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#f5b8c9] text-[#0d0d0d] font-mono font-extrabold text-sm uppercase tracking-wider animate-bounce">
            <Trophy className="w-4 h-4 fill-[#0d0d0d]" />
            NEW PERSONAL BEST RECORD!
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Grade Card & Score Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grade Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400">PERFORMANCE RATING</span>
              <div className="font-display font-extrabold text-7xl text-white">
                {summary.score.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-neutral-400 block">
                {summary.hits} HITS // {summary.misses} MISSES
              </span>
            </div>

            <div className="w-24 h-24 rounded-[12px] bg-[#f5b8c9] text-[#0d0d0d] flex items-center justify-center font-display font-extrabold text-5xl">
              {summary.grade}
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
            <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
              METRIC BREAKDOWN
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#f5b8c9]" /> ACCURACY
                </span>
                <span className="font-bold text-2xl text-white">{summary.accuracy}%</span>
              </div>

              <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f5b8c9]" /> AVG TTK
                </span>
                <span className="font-bold text-2xl text-white">{summary.avgTtkMs} ms</span>
              </div>

              <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#f5b8c9]" /> MAX STREAK
                </span>
                <span className="font-bold text-2xl text-white">{summary.maxCombo}X</span>
              </div>

              <div className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] space-y-1">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#f5b8c9]" /> TOTAL SHOTS
                </span>
                <span className="font-bold text-2xl text-white">{summary.hits + summary.misses}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Prominent Next Drill CTA */}
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
                className="btn-editorial-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white border-[#262626] hover:bg-[#262626] hover:border-[#f5b8c9] flex items-center justify-center gap-2 active:scale-95 transition-all"
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
                className="btn-editorial-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white border-[#262626] hover:bg-[#262626] hover:border-[#f5b8c9] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Library className="w-4 h-4" />
                LIBRARY
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Heatmap & TTK Graph (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spatial Heatmap Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
                TARGET WALL HIT MATRIX
              </h3>
              <span className="text-xs font-mono text-neutral-400">2D SPATIAL ERROR</span>
            </div>

            <div className="flex justify-center">
              <HeatmapChart hitLocations={summary.hitLocations} width={500} height={220} />
            </div>
          </div>

          {/* TTK Trend Graph */}
          <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#f5b8c9]" /> TTK SPEED PACE TREND (MS)
              </h3>
              <span className="text-xs font-mono text-neutral-400">FASTER = LOWER</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ttkTrendData}>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5b8c9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f5b8c9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="shot" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d0d0d',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ttk"
                    stroke="#f5b8c9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pinkGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
