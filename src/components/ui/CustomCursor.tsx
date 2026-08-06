import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
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
    // Hotspot is at (2, 2) top-left tip of the arrow
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 2}px, ${e.clientY - 2}px, 0)`;
      }
    };

    // Direct DOM click pulse animation
    const handleMouseDown = () => {
      if (arrowRef.current && !isReducedMotion) {
        arrowRef.current.style.transform = 'scale(0.86)';
        arrowRef.current.style.filter = `drop-shadow(0 2px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 12px ${themeAccentColor})`;
      }
    };

    const handleMouseUp = () => {
      if (arrowRef.current && !isReducedMotion) {
        arrowRef.current.style.transform = 'scale(1)';
        arrowRef.current.style.filter = `drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 6px ${themeAccentColor})`;
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
        ref={arrowRef}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="transition-transform duration-150 ease-out origin-top-left"
        style={{
          filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 6px ${themeAccentColor})`,
          willChange: 'transform, filter',
        }}
      >
        {/* High-Contrast Black Outline Shadow Path */}
        <path
          d="M 2,2 L 22,8 L 12,12 L 8,22 Z"
          fill="none"
          stroke="#000000"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner White/Accent Tint Stealth Chevron Arrow */}
        <path
          d="M 2,2 L 22,8 L 12,12 L 8,22 Z"
          fill="#f8fafc"
          stroke={themeAccentColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Center Spine Accent Line */}
        <path
          d="M 2,2 L 12,12"
          stroke={themeAccentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
