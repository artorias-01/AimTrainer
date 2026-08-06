import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-50 -ml-2.5 -mt-2.5 w-5 h-5 flex items-center justify-center"
      style={{ willChange: 'transform' }}
    >
      <div className="w-1.5 h-1.5 bg-pink rounded-full shadow-[0_0_8px_var(--accent-color)]" />
      <div className="absolute w-4 h-[1.5px] bg-pink/80" />
      <div className="absolute h-4 w-[1.5px] bg-pink/80" />
    </div>
  );
};
