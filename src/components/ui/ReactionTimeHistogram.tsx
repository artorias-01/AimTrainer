import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface ReactionTimeHistogramProps {
  reactionTimesMs: number[];
}

export const ReactionTimeHistogram: React.FC<ReactionTimeHistogramProps> = ({ reactionTimesMs }) => {
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  if (!reactionTimesMs || reactionTimesMs.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 text-center text-xs font-mono text-neutral-500">
        NO REACTION TIME DATA AVAILABLE FOR THIS SESSION
      </div>
    );
  }

  const bins = [
    { label: '<200ms', min: 0, max: 200, count: 0 },
    { label: '200-250ms', min: 200, max: 250, count: 0 },
    { label: '250-300ms', min: 250, max: 300, count: 0 },
    { label: '300-350ms', min: 300, max: 350, count: 0 },
    { label: '350-400ms', min: 400, max: 400, count: 0 },
    { label: '400ms+', min: 400, max: 9999, count: 0 },
  ];

  reactionTimesMs.forEach((t) => {
    const bin = bins.find((b) => t >= b.min && t < b.max) || bins[bins.length - 1];
    bin.count += 1;
  });

  const avgTtk = Math.round(reactionTimesMs.reduce((a, b) => a + b, 0) / reactionTimesMs.length);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#262626] pb-3">
        <h3 className="font-mono text-xs text-pink uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink" /> REACTION TIME DISTRIBUTION (HISTOGRAM)
        </h3>
        <span className="text-xs font-mono text-white font-bold bg-[#0d0d0d] px-3 py-1 rounded-[12px] border border-[#262626]">
          AVG TTK: {avgTtk} MS
        </span>
      </div>

      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              stroke="#666"
              fontSize={10}
              tickLine={false}
              fontFamily="Space Grotesk"
            />
            <YAxis
              stroke="#666"
              fontSize={10}
              tickLine={false}
              fontFamily="Space Grotesk"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0d0d0d',
                borderColor: themeAccentColor,
                borderRadius: '8px',
                fontSize: '11px',
                color: '#fff',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(val: any) => [`${val} hits`, 'Frequency']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bins.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 1 || index === 2 ? themeAccentColor : '#333'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
