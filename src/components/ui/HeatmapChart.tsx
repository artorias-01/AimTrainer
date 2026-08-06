import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';

interface HeatmapChartProps {
  hitLocations?: { x: number; y: number }[];
  width?: number;
  height?: number;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  hitLocations = [],
  width = 300,
  height = 200,
}) => {
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  return (
    <div
      className="relative bg-[#0d0d0d] border border-[#262626] rounded-[12px] overflow-hidden flex flex-col items-center justify-center p-4"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Target Wall Bounding Box */}
      <div className="absolute inset-4 border border-[#262626] rounded-[8px] flex items-center justify-center">
        {/* Center Cross Hair Reference */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-[1px] bg-white" />
          <div className="h-full w-[1px] bg-white absolute" />
        </div>

        {/* Target Spawn Zone Indicator */}
        <div
          className="w-3/4 h-3/4 border border-dashed rounded-[6px]"
          style={{ borderColor: `${themeAccentColor}50` }}
        />
      </div>

      {/* Render Hit Points with Staggered Entrance */}
      <svg width={width} height={height} className="relative z-10">
        {hitLocations.map((loc, idx) => {
          const px = ((loc.x + 4) / 8) * (width - 32) + 16;
          const py = height - (((loc.y - 1) / 4) * (height - 32) + 16);

          return (
            <motion.circle
              key={idx}
              cx={px}
              cy={py}
              r={3.5}
              fill={themeAccentColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ duration: 0.25, delay: Math.min(0.5, idx * 0.015) }}
              className="transition-all hover:scale-150"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-2 left-3 text-[9px] font-mono text-neutral-400">
        HIT DISTRIBUTION SPATIAL MATRIX ({hitLocations.length} SHOTS)
      </div>
    </div>
  );
};
