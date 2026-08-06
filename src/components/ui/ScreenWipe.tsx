import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenWipeProps {
  activeWipe: 'iris' | 'card' | 'scanline' | 'diagonal' | null;
  onComplete: () => void;
}

export const ScreenWipe: React.FC<ScreenWipeProps> = ({ activeWipe, onComplete }) => {
  if (!activeWipe) return null;

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {activeWipe && (
        <motion.div
          key={activeWipe}
          initial={{
            clipPath:
              activeWipe === 'iris'
                ? 'circle(0% at 50% 50%)'
                : activeWipe === 'scanline'
                ? 'inset(0 0 100% 0)'
                : 'polygon(-30% -20%, 0% -20%, -15% 120%, -45% 120%)',
            opacity: 1,
          }}
          animate={{
            clipPath:
              activeWipe === 'iris'
                ? 'circle(150% at 50% 50%)'
                : activeWipe === 'scanline'
                ? 'inset(0 0 0 0)'
                : 'polygon(-30% -20%, 130% -20%, 115% 120%, -45% 120%)',
            opacity: 1,
          }}
          exit={{
            clipPath:
              activeWipe === 'iris'
                ? 'circle(0% at 50% 50%)'
                : activeWipe === 'scanline'
                ? 'inset(100% 0 0 0)'
                : 'polygon(130% -20%, 130% -20%, 115% 120%, 115% 120%)',
            opacity: 0,
          }}
          transition={{
            duration: 0.24,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            // Auto cleanup after sweep animation completes
            setTimeout(onComplete, 30);
          }}
          className="fixed inset-0 z-[999] bg-[#0d0d0d] border-r-2 border-accent pointer-events-none shadow-[0_0_40px_rgba(var(--accent-color-rgb),0.5)]"
        />
      )}
    </AnimatePresence>
  );
};
