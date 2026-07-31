import React from 'react';
import type { CrosshairConfig } from '../../utils/storage';

interface CrosshairPreviewProps {
  config: CrosshairConfig;
  sizePx?: number; // Canvas display container size (e.g. 160px)
  transparent?: boolean;
}

export const CrosshairPreview: React.FC<CrosshairPreviewProps> = ({
  config,
  sizePx = 160,
  transparent = false,
}) => {
  const center = sizePx / 2;
  const {
    type,
    color,
    size,
    thickness,
    gap,
    outline,
    dotSize,
    opacity = 1.0,
    outlineColor = '#000000',
    outlineThickness = 1.5,
    showDot,
    dotColor,
  } = config;

  const actualShowDot = showDot !== undefined ? showDot : (type === 'dot' || type === 'cross-dot');
  const actualDotColor = dotColor || color;
  const strokeOutlineWidth = thickness + (outlineThickness * 2);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        transparent
          ? 'bg-transparent border-0'
          : 'bg-[#0d0d0d] border border-[#262626] rounded-[12px]'
      }`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Grid background lines (preview box only) */}
      {!transparent && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
      )}

      <svg width={sizePx} height={sizePx} className="relative z-10" style={{ opacity }}>
        {/* Outline Filter / Render */}
        {outline && (
          <g stroke={outlineColor} strokeWidth={strokeOutlineWidth} strokeLinecap="square">
            {(type === 'cross' || type === 'cross-dot' || type === 'dot') && type !== 'dot' && (
              <>
                {/* Top */}
                <line x1={center} y1={center - gap - size} x2={center} y2={center - gap} />
                {/* Bottom */}
                <line x1={center} y1={center + gap} x2={center} y2={center + gap + size} />
                {/* Left */}
                <line x1={center - gap - size} y1={center} x2={center - gap} y2={center} />
                {/* Right */}
                <line x1={center + gap} y1={center} x2={center + gap + size} y2={center} />
              </>
            )}
            {type === 't-shape' && (
              <>
                {/* Bottom */}
                <line x1={center} y1={center + gap} x2={center} y2={center + gap + size} />
                {/* Left */}
                <line x1={center - gap - size} y1={center} x2={center - gap} y2={center} />
                {/* Right */}
                <line x1={center + gap} y1={center} x2={center + gap + size} y2={center} />
              </>
            )}
            {type === 'x-shape' && (
              <>
                {/* Diagonal lines */}
                <line x1={center - gap - size * 0.7} y1={center - gap - size * 0.7} x2={center - gap * 0.7} y2={center - gap * 0.7} />
                <line x1={center + gap * 0.7} y1={center + gap * 0.7} x2={center + gap + size * 0.7} y2={center + gap + size * 0.7} />
                <line x1={center + gap * 0.7} y1={center - gap * 0.7} x2={center + gap + size * 0.7} y2={center - gap - size * 0.7} />
                <line x1={center - gap - size * 0.7} y1={center + gap * 0.7} x2={center - gap * 0.7} y2={center + gap + size * 0.7} />
              </>
            )}
            {type === 'circle' && (
              <circle cx={center} cy={center} r={gap + size / 2} fill="none" strokeWidth={strokeOutlineWidth} />
            )}
            {actualShowDot && (
              <circle cx={center} cy={center} r={dotSize / 2 + outlineThickness} fill={outlineColor} />
            )}
          </g>
        )}

        {/* Main Inner Crosshair */}
        <g stroke={color} strokeWidth={thickness} strokeLinecap="square">
          {type !== 'dot' && (type === 'cross' || type === 'cross-dot') && (
            <>
              {/* Top */}
              <line x1={center} y1={center - gap - size} x2={center} y2={center - gap} />
              {/* Bottom */}
              <line x1={center} y1={center + gap} x2={center} y2={center + gap + size} />
              {/* Left */}
              <line x1={center - gap - size} y1={center} x2={center - gap} y2={center} />
              {/* Right */}
              <line x1={center + gap} y1={center} x2={center + gap + size} y2={center} />
            </>
          )}
          {type === 't-shape' && (
            <>
              {/* Bottom */}
              <line x1={center} y1={center + gap} x2={center} y2={center + gap + size} />
              {/* Left */}
              <line x1={center - gap - size} y1={center} x2={center - gap} y2={center} />
              {/* Right */}
              <line x1={center + gap} y1={center} x2={center + gap + size} y2={center} />
            </>
          )}
          {type === 'x-shape' && (
            <>
              {/* Diagonal lines */}
              <line x1={center - gap - size * 0.7} y1={center - gap - size * 0.7} x2={center - gap * 0.7} y2={center - gap * 0.7} />
              <line x1={center + gap * 0.7} y1={center + gap * 0.7} x2={center + gap + size * 0.7} y2={center + gap + size * 0.7} />
              <line x1={center + gap * 0.7} y1={center - gap * 0.7} x2={center + gap + size * 0.7} y2={center - gap - size * 0.7} />
              <line x1={center - gap - size * 0.7} y1={center + gap * 0.7} x2={center - gap * 0.7} y2={center + gap + size * 0.7} />
            </>
          )}
          {type === 'circle' && (
            <circle cx={center} cy={center} r={gap + size / 2} fill="none" strokeWidth={thickness} />
          )}
          {actualShowDot && (
            <circle cx={center} cy={center} r={dotSize / 2} fill={actualDotColor} stroke="none" />
          )}
        </g>
      </svg>
    </div>
  );
};
