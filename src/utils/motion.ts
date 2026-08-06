import type { Variants, Transition } from 'framer-motion';

// Persona & AAA Game-inspired snappy spring physics
export const springPunch: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 24,
  mass: 0.75,
};

export const springFast: Transition = {
  type: 'spring',
  stiffness: 550,
  damping: 28,
  mass: 0.6,
};

// 1. SELECT MODE: Radial Scope Iris Wipe
export const irisWipeVariants: Variants = {
  initial: {
    clipPath: 'circle(150% at 50% 50%)',
    opacity: 1,
  },
  animate: {
    clipPath: 'circle(150% at 50% 50%)',
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.7, 0, 0.84, 0] },
  },
};

// 2. DRILL LIBRARY: Horizontal Card Shuffle Wipe
export const cardShuffleWipeVariants: Variants = {
  initial: {
    clipPath: 'polygon(-20% -20%, 125% -20%, 125% 120%, -20% 120%)',
    opacity: 1,
  },
  animate: {
    clipPath: 'polygon(-20% -20%, 125% -20%, 125% 120%, -20% 120%)',
    opacity: 1,
    transition: { duration: 0.28 },
  },
  exit: {
    clipPath: 'polygon(125% -20%, 125% -20%, 125% 120%, 125% 120%)',
    opacity: 0,
    transition: { duration: 0.22, ease: [0.76, 0, 0.24, 1] },
  },
};

// 3. ANALYTICS: Vertical Scanline HUD Power-On Wipe
export const scanlineWipeVariants: Variants = {
  initial: {
    clipPath: 'inset(0 0 0 0)',
    opacity: 1,
  },
  animate: {
    clipPath: 'inset(0 0 0 0)',
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

// 4. OPTIONS: Persona Diagonal Slice-Wipe (`//` Slash Motif)
export const diagonalWipeVariants: Variants = {
  hidden: {
    clipPath: 'polygon(-20% -20%, -5% -20%, -15% 120%, -30% 120%)',
    opacity: 0,
  },
  visible: {
    clipPath: 'polygon(-20% -20%, 125% -20%, 125% 120%, -20% 120%)',
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    clipPath: 'polygon(125% -20%, 125% -20%, 125% 120%, 125% 120%)',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

// Staggered Container & Child Items
export const kineticStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const kineticCascadeItem: Variants = {
  hidden: { opacity: 0, x: 25, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: springPunch,
  },
};

// Countdown Scale-Punch Variant
export const countdownPunchVariants: Variants = {
  initial: { opacity: 0, scale: 2.2, rotate: -4 },
  animate: {
    opacity: 1,
    scale: [2.2, 0.92, 1.0],
    rotate: [-4, 1, 0],
    transition: {
      duration: 0.28,
      ease: [0.175, 0.885, 0.32, 1.275],
    },
  },
};

// Results Grade Stamp / Seal Reveal Variant
export const stampSealVariants: Variants = {
  hidden: { opacity: 0, scale: 2.6, rotate: -12 },
  visible: {
    opacity: 1,
    scale: [2.6, 0.9, 1.0],
    rotate: [-12, 2, 0],
    transition: {
      duration: 0.32,
      ease: [0.175, 0.885, 0.32, 1.275],
    },
  },
};
