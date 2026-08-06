import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
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

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Offset by -16px horizontally and -16px vertically so (16, 16) SVG center aligns with exact cursor tip
        cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] w-8 h-8 flex items-center justify-center select-none"
      style={{ willChange: 'transform' }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-md">
        {/* High-Contrast Outer Black Outlines */}
        <g stroke="#000000" strokeWidth="3" strokeLinecap="square">
          {/* Top Line */}
          <line x1="16" y1="4" x2="16" y2="11" />
          {/* Bottom Line */}
          <line x1="16" y1="21" x2="16" y2="28" />
          {/* Left Line */}
          <line x1="4" y1="16" x2="11" y2="16" />
          {/* Right Line */}
          <line x1="21" y1="16" x2="28" y2="16" />
        </g>

        {/* Dynamic Accent Color Inner Crosshair Lines */}
        <g stroke={themeAccentColor} strokeWidth="1.5" strokeLinecap="square">
          {/* Top Line */}
          <line x1="16" y1="4.5" x2="16" y2="10.5" />
          {/* Bottom Line */}
          <line x1="16" y1="21.5" x2="16" y2="27.5" />
          {/* Left Line */}
          <line x1="4.5" y1="16" x2="10.5" y2="16" />
          {/* Right Line */}
          <line x1="21.5" y1="16" x2="27.5" y2="16" />
        </g>

        {/* Center Dot */}
        <circle cx="16" cy="16" r="1.5" fill={themeAccentColor} stroke="#000000" strokeWidth="0.75" />
      </svg>
    </div>
  );
};
