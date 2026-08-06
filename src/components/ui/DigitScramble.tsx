import React, { useState, useEffect } from 'react';

interface DigitScrambleProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export const DigitScramble: React.FC<DigitScrambleProps> = ({
  value,
  durationMs = 650,
  className = '',
}) => {
  const [displayStr, setDisplayStr] = useState('0');

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayStr(value.toLocaleString());
      return;
    }

    const targetStr = value.toLocaleString();
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      if (progress >= 1) {
        setDisplayStr(targetStr);
        clearInterval(interval);
        return;
      }

      const revealedLength = Math.floor(progress * targetStr.length);
      let scrambled = '';
      for (let i = 0; i < targetStr.length; i++) {
        if (targetStr[i] === ',' || targetStr[i] === '.') {
          scrambled += targetStr[i];
        } else if (i < revealedLength) {
          scrambled += targetStr[i];
        } else {
          scrambled += Math.floor(Math.random() * 10).toString();
        }
      }
      setDisplayStr(scrambled);
    }, 35);

    return () => clearInterval(interval);
  }, [value, durationMs]);

  return <span className={className}>{displayStr}</span>;
};
