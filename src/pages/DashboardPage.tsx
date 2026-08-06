import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS } from '../utils/scenarios';
import {
  getDailyStreak,
  getStoredBenchmarkRuns,
} from '../utils/storage';
import { Trophy, Target, Activity, Calendar, AlertTriangle, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { kineticStaggerContainer, kineticCascadeItem, springPunch } from '../utils/motion';

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

  return (
    <motion.div
      variants={kineticStaggerContainer}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto select-none"
    >
      {/* Top Header Card */}
      <motion.div variants={kineticCascadeItem} className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-pink uppercase font-bold tracking-widest">
              PERFORMANCE DASHBOARD
            </span>
          </div>
          <h2 className="font-display text-3xl font-black text-white">
            PILOT: {displayName.toUpperCase()}
          </h2>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400">FILTER DRILL:</span>
            <select
              value={selectedScenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="bg-[#0d0d0d] text-white font-mono text-xs p-2 rounded-[8px] border border-[#262626] focus:outline-none focus:border-pink"
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
      </motion.div>

      {importStatusMsg && (
        <div className="max-w-7xl mx-auto bg-[#141414] border border-pink text-pink p-3 rounded-[12px] font-mono text-xs font-bold text-center">
          {importStatusMsg}
        </div>
      )}

      {/* Weak-Point Detector Insights Box */}
      {hasEnoughData && (
        <motion.div variants={kineticCascadeItem} className="max-w-7xl mx-auto bg-[#141414] border border-pink rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                WEAK-POINT ANALYTICS INSIGHT (LAST 20 SESSIONS)
              </span>
              <p className="font-sans-ui text-xs text-white leading-relaxed">
                Your <span className="text-pink font-bold uppercase">{weakestCategory}</span> accuracy ({lowestAcc.toFixed(1)}%) is currently your lowest performance area. Recommended drill: <span className="text-white font-bold">{recommendedScenario.name}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('arena', recommendedScenario.id)}
            className="btn-editorial-pink px-4 py-2.5 text-xs font-bold uppercase flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-[#0d0d0d]" /> PRACTICE WEAK POINT
          </button>
        </motion.div>
      )}

      {/* High Level Stats Row */}
      <motion.div variants={kineticCascadeItem} className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} transition={springPunch} className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-pink" /> TOTAL SESSIONS
          </span>
          <div className="font-display font-bold text-4xl text-white">{totalSessions}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={springPunch} className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-pink" /> ALL-TIME HIGH SCORE
          </span>
          <div className="font-display font-bold text-4xl text-pink">
            {highestScore.toLocaleString()}
          </div>
        </motion.div>

        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-pink" /> AVG ACCURACY
          </span>
          <div className="font-display font-bold text-4xl text-white">{avgAccuracy}%</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pink" /> DAILY STREAK
          </span>
          <div className="font-display font-bold text-4xl text-white">
            {dailyStreak.streakCount} DAYS
          </div>
        </div>
      </motion.div>

      {/* 30-Day Activity Heatmap Grid */}
      <div className="max-w-7xl mx-auto bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs text-pink uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink" /> 30-DAY PRACTICE ACTIVITY HEATMAP
          </h3>
          <span className="text-xs font-mono text-neutral-400">{dailyStreak.historyDates.length} ACTIVE DAYS</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {past30Days.map((dateStr) => {
            const isCompleted = dailyStreak.historyDates.includes(dateStr);
            return (
              <div
                key={dateStr}
                title={dateStr}
                className={`w-6 h-6 rounded-[4px] border transition-all ${
                  isCompleted
                    ? 'bg-pink border-pink shadow-sm'
                    : 'bg-[#0d0d0d] border-[#262626]'
                }`}
                style={isCompleted ? { boxShadow: `0 1px 6px ${themeAccentColor}50` } : {}}
              />
            );
          })}
        </div>
      </div>

      {/* Main Analytics Graph Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
          <h3 className="font-mono text-xs text-pink uppercase tracking-widest">
            HISTORICAL SCORE TRAJECTORY
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
                      backgroundColor: '#0d0d0d',
                      borderColor: themeAccentColor,
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={themeAccentColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreAccentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-neutral-500">
              NO SESSIONS RECORDED YET
            </div>
          )}
        </div>

        {/* Benchmark Progression Line Chart */}
        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
          <h3 className="font-mono text-xs text-pink uppercase tracking-widest">
            BENCHMARK RATING PROGRESSION
          </h3>
          {benchmarkChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkChartData}>
                  <XAxis dataKey="index" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={[0, 1000]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d0d0d',
                      borderColor: themeAccentColor,
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke={themeAccentColor} strokeWidth={3} dot={{ fill: themeAccentColor, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-neutral-500">
              NO BENCHMARK TESTS COMPLETED YET
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
