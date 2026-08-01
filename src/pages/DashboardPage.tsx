import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS } from '../utils/scenarios';
import {
  getDailyStreak,
  getStoredBenchmarkRuns,
  exportAllDataJSON,
  importAllDataJSON,
  exportSessionsCSV,
} from '../utils/storage';
import { Trophy, Target, Activity, Calendar, User, Play, AlertTriangle, Download, Upload } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { soundManager } from '../utils/audio';

interface DashboardPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { sessions, selectedScenarioFilter, setScenarioFilter, refreshStats } = useStatsStore();
  const { displayName } = useSettingsStore();

  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);

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
    const cat = sc?.category || 'clicking';
    if (categoryStats[cat]) {
      categoryStats[cat].totalHits += s.hits;
      categoryStats[cat].totalShots += s.hits + s.misses;
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

  const handleExportJSON = () => {
    soundManager.playClick();
    const str = exportAllDataJSON();
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aimtt-backup-${Date.now()}.json`;
    link.click();
  };

  const handleExportCSV = () => {
    soundManager.playClick();
    const str = exportSessionsCSV();
    const blob = new Blob([str], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aimtt-sessions-${Date.now()}.csv`;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllDataJSON(content);
      if (success) {
        soundManager.playClick();
        refreshStats();
        setImportStatusMsg('SUCCESSFULLY RESTORED BACKUP DATA!');
        setTimeout(() => setImportStatusMsg(null), 3000);
      } else {
        setImportStatusMsg('FAILED TO PARSE BACKUP FILE');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#0d0d0d] text-white min-h-screen py-12 px-6 md:px-16 space-y-10 select-none text-left"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
            <User className="w-3.5 h-3.5 text-[#f5b8c9]" />
            WELCOME BACK // {displayName}
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
            AIM ANALYTICS
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-[12px] bg-[#141414] hover:bg-[#262626] text-white border border-[#262626] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#f5b8c9]" /> EXPORT JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-[12px] bg-[#141414] hover:bg-[#262626] text-white border border-[#262626] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#f5b8c9]" /> EXPORT CSV
          </button>

          <label className="px-3.5 py-2 rounded-[12px] bg-[#141414] hover:bg-[#262626] text-white border border-[#262626] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#f5b8c9]" /> IMPORT DATA
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-[12px] border border-[#262626]">
            <select
              value={selectedScenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="bg-[#0d0d0d] text-white font-mono text-xs p-2 rounded-[8px] border border-[#262626] focus:outline-none focus:border-[#f5b8c9]"
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
        <div className="max-w-7xl mx-auto bg-[#141414] border border-[#f5b8c9] text-[#f5b8c9] p-3 rounded-[12px] font-mono text-xs font-bold text-center">
          {importStatusMsg}
        </div>
      )}

      {/* Weak-Point Detector Insights Box */}
      {hasEnoughData && (
        <div className="max-w-7xl mx-auto bg-[#141414] border border-[#f5b8c9] rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                WEAK-POINT ANALYTICS INSIGHT (LAST 20 SESSIONS)
              </span>
              <p className="font-sans-ui text-xs text-white leading-relaxed">
                Your <span className="text-[#f5b8c9] font-bold uppercase">{weakestCategory}</span> accuracy ({lowestAcc.toFixed(1)}%) is currently your lowest performance area. Recommended drill: <span className="text-white font-bold">{recommendedScenario.name}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('arena', recommendedScenario.id)}
            className="btn-editorial-pink px-4 py-2.5 text-xs font-bold uppercase flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-[#0d0d0d]" /> PRACTICE WEAK POINT
          </button>
        </div>
      )}

      {/* High Level Stats Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#f5b8c9]" /> TOTAL SESSIONS
          </span>
          <div className="font-display font-bold text-4xl text-white">{totalSessions}</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#f5b8c9]" /> ALL-TIME HIGH SCORE
          </span>
          <div className="font-display font-bold text-4xl text-[#f5b8c9]">
            {highestScore.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#f5b8c9]" /> AVG ACCURACY
          </span>
          <div className="font-display font-bold text-4xl text-white">{avgAccuracy}%</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-2">
          <span className="text-neutral-400 font-mono text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f5b8c9]" /> DAILY STREAK
          </span>
          <div className="font-display font-bold text-4xl text-white">
            {dailyStreak.streakCount} DAYS
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div className="max-w-7xl mx-auto bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f5b8c9]" /> 30-DAY PRACTICE ACTIVITY HEATMAP
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
                    ? 'bg-[#f5b8c9] border-[#f5b8c9] shadow-sm shadow-[#f5b8c9]/30'
                    : 'bg-[#0d0d0d] border-[#262626]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Analytics Graph Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
          <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
            HISTORICAL SCORE TRAJECTORY
          </h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scorePinkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5b8c9" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f5b8c9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="index" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
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
                    dataKey="score"
                    stroke="#f5b8c9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scorePinkGrad)"
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
          <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
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
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'Space Grotesk',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#f5b8c9" strokeWidth={3} dot={{ fill: '#f5b8c9', r: 4 }} />
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
