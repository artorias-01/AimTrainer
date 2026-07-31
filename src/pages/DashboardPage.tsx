import React from 'react';
import { motion } from 'framer-motion';
import { useStatsStore } from '../store/useStatsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SCENARIOS } from '../utils/scenarios';
import { Trophy, Target, Clock, Activity, Calendar, User, Play, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string, scenarioId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { sessions, personalBests, selectedScenarioFilter, setScenarioFilter } = useStatsStore();
  const { displayName } = useSettingsStore();

  const filteredSessions = sessions.filter(
    (s) => selectedScenarioFilter === 'all' || s.scenarioId === selectedScenarioFilter
  );

  // Overall Stats
  const totalSessions = sessions.length;
  const highestScore = Math.max(0, ...sessions.map((s) => s.score));
  const avgAccuracy =
    sessions.length > 0
      ? Math.round((sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) * 10) / 10
      : 0;

  // Chart data for score progression
  const chartData = [...filteredSessions]
    .reverse()
    .map((s, idx) => ({
      index: `#${idx + 1}`,
      score: s.score,
      accuracy: s.accuracy,
      name: s.scenarioName,
    }));

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
            <User className="w-3.5 h-3.5 text-[#f5b8c9]" />
            WELCOME BACK // {displayName}
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white">
            AIM ANALYTICS
          </h1>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3 bg-[#141414] p-2 rounded-[12px] border border-[#262626]">
          <span className="text-xs font-mono text-neutral-400 pl-2">FILTER DRILL:</span>
          <select
            value={selectedScenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            className="bg-[#0d0d0d] text-white font-mono text-xs p-2 rounded-[8px] border border-[#262626] focus:outline-none focus:border-[#f5b8c9] focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
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

      {/* Requirement 12: Designed Empty State for fresh players */}
      {sessions.length === 0 ? (
        <div className="max-w-7xl mx-auto bg-[#141414] border border-[#262626] rounded-[12px] p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-[12px] bg-[#f5b8c9]/10 text-[#f5b8c9] border border-[#f5b8c9]/30 flex items-center justify-center mx-auto">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-extrabold text-2xl text-white">NO TRAINING SESSIONS RECORDED</h3>
            <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
              Complete your first 3D training drill in the arena to unlock score progression graphs, accuracy statistics, and personal best records.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('library')}
              className="btn-editorial-pink px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-[#0d0d0d]" />
              START FIRST DRILL
            </button>
          </div>
        </div>
      ) : (
        <>
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
                <Clock className="w-3.5 h-3.5 text-[#f5b8c9]" /> UNLOCKED RECORDS
              </span>
              <div className="font-display font-bold text-4xl text-white">
                {Object.keys(personalBests).length} / {SCENARIOS.length}
              </div>
            </div>
          </div>

          {/* Main Analytics Graph Section */}
          <div className="max-w-7xl mx-auto bg-[#141414] border border-[#262626] rounded-[12px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
                  SCORE PROGRESSION OVER TIME
                </h3>
                <span className="text-sm font-display text-neutral-300">
                  Historical Score Trajectory
                </span>
              </div>
            </div>

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
                NO SESSIONS RECORDED FOR THIS FILTER YET
              </div>
            )}
          </div>

          {/* Personal Bests & Session History Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Bests Table */}
            <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
              <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
                PERSONAL BEST RECORDS PER DRILL
              </h3>

              <div className="space-y-3">
                {SCENARIOS.map((sc) => {
                  const pb = personalBests[sc.id];
                  return (
                    <div
                      key={sc.id}
                      onClick={() => onNavigate('arena', sc.id)}
                      className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] flex items-center justify-between hover:border-[#f5b8c9] transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#f5b8c9]"
                      tabIndex={0}
                    >
                      <div className="space-y-1">
                        <span className="font-display font-bold text-white group-hover:text-[#f5b8c9] transition-colors text-sm">
                          {sc.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          {sc.category.toUpperCase()} // {sc.difficulty}
                        </span>
                      </div>

                      {pb ? (
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-base text-[#f5b8c9]">
                            {pb.highScore.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            {pb.bestAccuracy}% ACC // {pb.bestTtkMs}ms
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-neutral-500">UNRANKED</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sessions Log */}
            <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4">
              <h3 className="font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
                RECENT DRILL LOGS
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((s) => (
                    <div
                      key={s.id}
                      className="bg-[#0d0d0d] p-4 rounded-[12px] border border-[#262626] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-[#f5b8c9] text-[#0d0d0d] font-display font-bold flex items-center justify-center text-lg">
                          {s.grade}
                        </div>
                        <div>
                          <span className="font-display font-bold text-sm text-white block">
                            {s.scenarioName}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#f5b8c9]" />
                            {new Date(s.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-sm text-white block">
                          {s.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {s.accuracy}% ACC // {s.avgTtkMs}ms
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-4 text-center space-y-4 bg-[#0d0d0d] rounded-[12px] border border-[#262626]">
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      NO DRILL SESSIONS RECORDED FOR THIS FILTER YET.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
