import React from 'react';

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
        <div className="w-3/4 h-3/4 border border-dashed border-[#f5b8c9]/30 rounded-[6px]" />
      </div>

      {/* Render Hit Points */}
      <svg width={width} height={height} className="relative z-10">
        {hitLocations.map((loc, idx) => {
          // Normalize coordinates (-4 to 4 X -> 0 to width, 1.2 to 4.8 Y -> 0 to height)
          const px = ((loc.x + 4) / 8) * (width - 32) + 16;
          const py = height - (((loc.y - 1) / 4) * (height - 32) + 16);

          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={3.5}
              fill="#f5b8c9"
              opacity={0.7}
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
