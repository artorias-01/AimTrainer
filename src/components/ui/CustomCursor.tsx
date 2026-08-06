import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
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

    // Direct 1:1 DOM position update with zero React re-renders or throttling
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 12}px, ${e.clientY - 12}px, 0)`;
      }
    };

    // Direct DOM click pulse animation
    const handleMouseDown = () => {
      if (ringRef.current && !isReducedMotion) {
        ringRef.current.style.transform = 'scale(0.84)';
        ringRef.current.style.filter = `drop-shadow(0 0 12px ${themeAccentColor})`;
      }
    };

    const handleMouseUp = () => {
      if (ringRef.current && !isReducedMotion) {
        ringRef.current.style.transform = 'scale(1)';
        ringRef.current.style.filter = `drop-shadow(0 0 6px ${themeAccentColor})`;
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
        ref={ringRef}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="transition-transform duration-150 ease-out"
        style={{
          filter: `drop-shadow(0 0 6px ${themeAccentColor})`,
          willChange: 'transform, filter',
        }}
      >
        {/* High-Contrast Outer Black Shadow Ring */}
        <circle cx="12" cy="12" r="9" fill="none" stroke="#000000" strokeWidth="2.5" opacity="0.6" />

        {/* Minimalist Target Lock Ring */}
        <circle cx="12" cy="12" r="9" fill="none" stroke={themeAccentColor} strokeWidth="1.25" />

        {/* Tactical Crosshair Tick Marks */}
        <g stroke={themeAccentColor} strokeWidth="1.25" strokeLinecap="round">
          {/* Top Tick */}
          <line x1="12" y1="2" x2="12" y2="4.5" />
          {/* Bottom Tick */}
          <line x1="12" y1="19.5" x2="12" y2="22" />
          {/* Left Tick */}
          <line x1="2" y1="12" x2="4.5" y2="12" />
          {/* Right Tick */}
          <line x1="19.5" y1="12" x2="22" y2="12" />
        </g>

        {/* Crisp Center Aim Dot */}
        <circle cx="12" cy="12" r="1.25" fill={themeAccentColor} stroke="#000000" strokeWidth="0.5" />
      </svg>
    </div>
  );
};
