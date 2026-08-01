import React, { useState } from 'react';
import type { CrosshairConfig } from '../../utils/storage';
import { migrateCrosshairConfig } from '../../utils/storage';

interface CrosshairPreviewProps {
  config: CrosshairConfig;
  sizePx?: number; // Canvas display container size (e.g. 160px)
  transparent?: boolean;
  showSwatchPicker?: boolean;
}

export const CrosshairPreview: React.FC<CrosshairPreviewProps> = ({
  config,
  sizePx = 160,
  transparent = false,
  showSwatchPicker = false,
}) => {
  const [bgSwatch, setBgSwatch] = useState<'dark' | 'gray' | 'light'>('dark');

  const c = migrateCrosshairConfig(config);
  const center = sizePx / 2;

  const { innerLines, outerLines, dot, outline } = c;

  const bgClass = transparent
    ? 'bg-transparent border-0'
    : bgSwatch === 'light'
    ? 'bg-[#e5e5e5] text-[#0d0d0d] border border-neutral-300'
    : bgSwatch === 'gray'
    ? 'bg-[#262626] text-white border border-neutral-600'
    : 'bg-[#0d0d0d] text-white border border-[#262626]';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-[12px] transition-colors duration-200 ${bgClass}`}
        style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      >
        {/* Grid background lines (preview box only) */}
        {!transparent && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:12px_12px]" />
        )}

        <svg width={sizePx} height={sizePx} className="relative z-10">
          {/* Outlines Layer */}
          {outline?.show && (
            <g stroke={outline.color} strokeOpacity={outline.opacity} strokeLinecap="square">
              {/* Inner Lines Outline */}
              {innerLines?.show && (
                <g strokeWidth={innerLines.thickness + outline.thickness * 2}>
                  {/* Top */}
                  <line x1={center} y1={center - innerLines.offset - innerLines.length} x2={center} y2={center - innerLines.offset} />
                  {/* Bottom */}
                  <line x1={center} y1={center + innerLines.offset} x2={center} y2={center + innerLines.offset + innerLines.length} />
                  {/* Left */}
                  <line x1={center - innerLines.offset - innerLines.length} y1={center} x2={center - innerLines.offset} y2={center} />
                  {/* Right */}
                  <line x1={center + innerLines.offset} y1={center} x2={center + innerLines.offset + innerLines.length} y2={center} />
                </g>
              )}

              {/* Outer Lines Outline */}
              {outerLines?.show && (
                <g strokeWidth={outerLines.thickness + outline.thickness * 2}>
                  {/* Top */}
                  <line x1={center} y1={center - outerLines.offset - outerLines.length} x2={center} y2={center - outerLines.offset} />
                  {/* Bottom */}
                  <line x1={center} y1={center + outerLines.offset} x2={center} y2={center + outerLines.offset + outerLines.length} />
                  {/* Left */}
                  <line x1={center - outerLines.offset - outerLines.length} y1={center} x2={center - outerLines.offset} y2={center} />
                  {/* Right */}
                  <line x1={center + outerLines.offset} y1={center} x2={center + outerLines.offset + outerLines.length} y2={center} />
                </g>
              )}

              {/* Dot Outline */}
              {dot?.show && (
                <circle cx={center} cy={center} r={dot.size / 2 + outline.thickness} fill={outline.color} fillOpacity={outline.opacity} />
              )}
            </g>
          )}

          {/* Inner Lines Layer */}
          {innerLines?.show && (
            <g stroke={innerLines.color} strokeOpacity={innerLines.opacity} strokeWidth={innerLines.thickness} strokeLinecap="square">
              {/* Top */}
              <line x1={center} y1={center - innerLines.offset - innerLines.length} x2={center} y2={center - innerLines.offset} />
              {/* Bottom */}
              <line x1={center} y1={center + innerLines.offset} x2={center} y2={center + innerLines.offset + innerLines.length} />
              {/* Left */}
              <line x1={center - innerLines.offset - innerLines.length} y1={center} x2={center - innerLines.offset} y2={center} />
              {/* Right */}
              <line x1={center + innerLines.offset} y1={center} x2={center + innerLines.offset + innerLines.length} y2={center} />
            </g>
          )}

          {/* Outer Lines Layer */}
          {outerLines?.show && (
            <g stroke={outerLines.color} strokeOpacity={outerLines.opacity} strokeWidth={outerLines.thickness} strokeLinecap="square">
              {/* Top */}
              <line x1={center} y1={center - outerLines.offset - outerLines.length} x2={center} y2={center - outerLines.offset} />
              {/* Bottom */}
              <line x1={center} y1={center + outerLines.offset} x2={center} y2={center + outerLines.offset + outerLines.length} />
              {/* Left */}
              <line x1={center - outerLines.offset - outerLines.length} y1={center} x2={center - outerLines.offset} y2={center} />
              {/* Right */}
              <line x1={center + outerLines.offset} y1={center} x2={center + outerLines.offset + outerLines.length} y2={center} />
            </g>
          )}

          {/* Dot Layer */}
          {dot?.show && (
            <circle cx={center} cy={center} r={dot.size / 2} fill={dot.color} fillOpacity={dot.opacity} stroke="none" />
          )}
        </svg>
      </div>

      {/* Swatch Background Selector for Studio Preview */}
      {showSwatchPicker && !transparent && (
        <div className="flex items-center gap-1.5 bg-[#0d0d0d] p-1 rounded-[8px] border border-[#262626] text-[10px] font-mono">
          <span className="text-neutral-500 px-1 font-bold">PREVIEW BG:</span>
          {(['dark', 'gray', 'light'] as const).map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setBgSwatch(swatch)}
              className={`px-2 py-0.5 rounded-[6px] font-bold uppercase transition-all ${
                bgSwatch === swatch
                  ? 'bg-pink text-[#0d0d0d]'
                  : 'bg-[#141414] text-neutral-400 hover:text-white'
              }`}
            >
              {swatch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
