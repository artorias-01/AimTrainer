import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const triRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    setIsVisible(true);
    document.documentElement.classList.add('custom-cursor-active');

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Direct 1:1 DOM position update with zero React re-renders or latency
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 12}px, ${e.clientY - 12}px, 0)`;
      }
    };

    // Direct DOM click pulse animation
    const handleMouseDown = () => {
      if (triRef.current && !isReducedMotion) {
        triRef.current.style.transform = 'scale(0.82)';
        triRef.current.style.filter = `drop-shadow(0 0 14px ${themeAccentColor})`;
      }
    };

    const handleMouseUp = () => {
      if (triRef.current && !isReducedMotion) {
        triRef.current.style.transform = 'scale(1)';
        triRef.current.style.filter = `drop-shadow(0 0 6px ${themeAccentColor})`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [themeAccentColor]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] w-6 h-6 flex items-center justify-center select-none"
      style={{ willChange: 'transform' }}
    >
      <svg
        ref={triRef}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="transition-transform duration-150 ease-out"
        style={{
          filter: `drop-shadow(0 0 6px ${themeAccentColor})`,
          willChange: 'transform, filter',
        }}
      >
        {/* High-Contrast Outer Black Shadow Triangle */}
        <polygon
          points="12,3 21,19 3,19"
          fill="none"
          stroke="#000000"
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Dynamic Theme Accent Triangular Reticle Chevron */}
        <polygon
          points="12,3 21,19 3,19"
          fill="rgba(var(--accent-color-rgb), 0.08)"
          stroke={themeAccentColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Tactical Vertex Corner Accents */}
        <g stroke={themeAccentColor} strokeWidth="1.5" strokeLinecap="round">
          {/* Top Vertex Pointer Extension */}
          <line x1="12" y1="1" x2="12" y2="4" />
          {/* Bottom Left Corner Accent */}
          <line x1="1.5" y1="20" x2="4" y2="18.5" />
          {/* Bottom Right Corner Accent */}
          <line x1="22.5" y1="20" x2="20" y2="18.5" />
        </g>

        {/* Center Target Aim Dot */}
        <circle
          cx="12"
          cy="13"
          r="1.25"
          fill={themeAccentColor}
          stroke="#000000"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};
