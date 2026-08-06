import type { Variants, Transition } from 'framer-motion';

// Persona-inspired snappy spring physics with overshoot-and-settle
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

export const snapZoomTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.7,
};

// Kinetic Text Slam Entrance
export const kineticTextVariants: Variants = {
  hidden: { opacity: 0, scale: 1.16, x: -18, rotate: -1.5 },
  visible: {
    opacity: 1,
    scale: 1.0,
    x: 0,
    rotate: 0,
    transition: springPunch,
  },
};

// Diagonal Clip-Path Polygon Wipes (`//` Slash Motif)
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
