import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS } from '../utils/scenarios';
import { getDailyStreak, getStoredBenchmarkRuns } from '../utils/storage';
import { Trophy, Target, Activity, Calendar, AlertTriangle, Play, Award, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { sessions, selectedScenarioFilter, setScenarioFilter } = useStatsStore();
  const displayName = useSettingsStore((s) => s.displayName);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const [importStatusMsg] = useState<string | null>(null);

  const filteredSessions = sessions.filter(
    (s) => selectedScenarioFilter === 'all' || s.scenarioId === selectedScenarioFilter
  );

  const dailyStreak = getDailyStreak();
  const benchmarkRuns = getStoredBenchmarkRuns();

  const totalSessions = sessions.length;
  const highestScore = Math.max(0, ...sessions.map((s) => s.score));
  const avgAccuracy =
    sessions.length > 0
      ? Math.round((sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) * 10) / 10
      : 0;

  /* Weak-Point Detector over last 20 sessions */
  const recent20 = sessions.slice(0, 20);
  const categoryStats: Record<string, { totalHits: number; totalShots: number }> = {
    clicking: { totalHits: 0, totalShots: 0 },
    tracking: { totalHits: 0, totalShots: 0 },
    switching: { totalHits: 0, totalShots: 0 },
    precision: { totalHits: 0, totalShots: 0 },
  };

  recent20.forEach((s) => {
    const sc = SCENARIOS.find((item) => item.id === s.scenarioId);
    const cat = sc?.category || (s.isTracking ? 'tracking' : 'clicking');
    if (categoryStats[cat]) {
      if (s.isTracking || cat === 'tracking') {
        categoryStats[cat].totalHits += s.accuracy;
        categoryStats[cat].totalShots += 100;
      } else {
        categoryStats[cat].totalHits += s.hits;
        categoryStats[cat].totalShots += s.hits + s.misses;
      }
    }
  });

  let weakestCategory = 'tracking';
  let lowestAcc = 100;
  let hasEnoughData = false;

  Object.entries(categoryStats).forEach(([cat, data]) => {
    if (data.totalShots > 0) {
      hasEnoughData = true;
      const acc = (data.totalHits / data.totalShots) * 100;
      if (acc < lowestAcc) {
        lowestAcc = acc;
        weakestCategory = cat;
      }
    }
  });

  const recommendedScenario = SCENARIOS.find((s) => s.category === weakestCategory) || SCENARIOS[0];

  /* 30-Day Contribution Heatmap Dates */
  const past30Days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past30Days.push(d.toISOString().split('T')[0]);
  }

  const chartData = [...filteredSessions]
    .reverse()
    .map((s, idx) => ({
      index: `#${idx + 1}`,
      score: s.score,
      accuracy: s.accuracy,
      name: s.scenarioName,
    }));

  const benchmarkChartData = [...benchmarkRuns].reverse().map((b, idx) => ({
    index: `Run #${idx + 1}`,
    score: b.compositeScore,
    grade: b.grade,
  }));

  const latestGrade = benchmarkRuns.length > 0 ? benchmarkRuns[0].grade : 'UNRANKED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen bg-[#030303] text-white pt-28 pb-16 px-6 md:px-16 space-y-10 select-none text-left"
    >
      {/* Top Header Glass Card */}
      <div className="max-w-7xl mx-auto glass-card rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold text-pink uppercase tracking-widest bg-pink/15 px-3 py-1 rounded-full border border-pink/30">
              PERFORMANCE DASHBOARD
            </span>
            <span className="text-xs font-mono text-neutral-400 font-bold">PILOT ID: #{displayName.toUpperCase()}</span>
          </div>
          <h1 className="font-syne font-extrabold text-3xl md:text-5xl text-white tracking-tight">
            PERFORMANCE ANALYTICS
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-wrap relative z-10">
          {/* Rank Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-[14px] bg-white/[0.04] border border-white/10">
            <Award className="w-5 h-5 text-pink" />
            <div>
              <span className="text-[9px] font-mono text-neutral-500 font-bold block">RANK RATING</span>
              <span className="font-syne font-extrabold text-sm text-white block">{latestGrade}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400 font-bold">FILTER:</span>
            <select
              value={selectedScenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="bg-black/60 text-white font-mono text-xs p-2.5 rounded-[14px] border border-white/15 focus:outline-none focus:border-pink font-bold"
            >
              <option value="all">ALL SCENARIOS</option>
              {SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {importStatusMsg && (
        <div className="max-w-7xl mx-auto glass-card border border-pink text-pink p-4 rounded-[16px] font-mono text-xs font-bold text-center">
          {importStatusMsg}
        </div>
      )}

      {/* Weak-Point Detector Insights Box */}
      {hasEnoughData && (
        <div className="max-w-7xl mx-auto glass-card border border-amber-500/40 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">
                WEAK-POINT ANALYTICS INSIGHT (LAST 20 SESSIONS)
              </span>
              <p className="font-outfit text-sm text-white leading-relaxed">
                Your <span className="text-pink font-bold uppercase">{weakestCategory}</span> accuracy ({lowestAcc.toFixed(1)}%) is your primary area for improvement. Recommended drill: <span className="text-white font-bold">{recommendedScenario.name}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('arena', recommendedScenario.id)}
            className="btn-editorial-pink px-6 py-3 text-xs font-syne font-extrabold tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-lg glow-accent"
          >
            <Play className="w-4 h-4 fill-black" /> PRACTICE WEAK POINT
          </button>
        </div>
      )}

      {/* High Level Stats Tiles Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card glass-card-hover rounded-[20px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-2 font-bold">
            <Activity className="w-4 h-4 text-pink" /> TOTAL SESSIONS
          </span>
          <div className="font-syne font-extrabold text-4xl text-white">{totalSessions}</div>
        </div>

        <div className="glass-card glass-card-hover rounded-[20px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-2 font-bold">
            <Trophy className="w-4 h-4 text-pink" /> HIGH SCORE
          </span>
          <div className="font-syne font-extrabold text-4xl text-pink">
            {highestScore.toLocaleString()}
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-[20px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-2 font-bold">
            <Target className="w-4 h-4 text-pink" /> AVG ACCURACY
          </span>
          <div className="font-syne font-extrabold text-4xl text-white">{avgAccuracy}%</div>
        </div>

        <div className="glass-card glass-card-hover rounded-[20px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-2 font-bold">
            <Calendar className="w-4 h-4 text-pink" /> DAILY STREAK
          </span>
          <div className="font-syne font-extrabold text-4xl text-white">
            {dailyStreak.streakCount} DAYS
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div className="max-w-7xl mx-auto glass-card rounded-[20px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-xs text-pink uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink" /> 30-DAY PRACTICE ACTIVITY HEATMAP
          </h3>
          <span className="text-xs font-mono text-neutral-400 font-bold">{dailyStreak.historyDates.length} ACTIVE DAYS</span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {past30Days.map((dateStr) => {
            const isCompleted = dailyStreak.historyDates.includes(dateStr);
            return (
              <div
                key={dateStr}
                title={dateStr}
                className={`w-7 h-7 rounded-[8px] border transition-all ${
                  isCompleted
                    ? 'bg-pink border-pink shadow-md'
                    : 'bg-white/[0.03] border-white/10'
                }`}
                style={isCompleted ? { boxShadow: `0 0 12px ${themeAccentColor}60` } : {}}
              />
            );
          })}
        </div>
      </div>

      {/* Main Analytics Graph Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trajectory */}
        <div className="glass-card rounded-[24px] p-8 space-y-6">
          <h3 className="font-syne font-extrabold text-sm text-pink uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink" /> HISTORICAL SCORE TRAJECTORY
          </h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreAccentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeAccentColor} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={themeAccentColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="index" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0d',
                      borderColor: themeAccentColor,
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Outfit',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={themeAccentColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreAccentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-neutral-500">
              NO SESSIONS RECORDED YET
            </div>
          )}
        </div>

        {/* Benchmark Rating Line Chart */}
        <div className="glass-card rounded-[24px] p-8 space-y-6">
          <h3 className="font-syne font-extrabold text-sm text-pink uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-pink" /> BENCHMARK RATING PROGRESSION
          </h3>
          {benchmarkChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkChartData}>
                  <XAxis dataKey="index" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={[0, 1000]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0d',
                      borderColor: themeAccentColor,
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Outfit',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke={themeAccentColor} strokeWidth={3} dot={{ fill: themeAccentColor, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-neutral-500">
              NO BENCHMARK TESTS COMPLETED YET
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
