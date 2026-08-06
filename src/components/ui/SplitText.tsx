import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlightText?: string;
  highlightClassName?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.035,
  highlightText,
  highlightClassName = 'text-accent',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const letters = Array.from(text);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12, filter: shouldReduceMotion ? 'none' : 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.25, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block select-none ${className}`}
    >
      {letters.map((char, idx) => {
        const isHighlight = highlightText && text.slice(idx, idx + highlightText.length) === highlightText;
        return (
          <motion.span
            key={idx}
            variants={letterVariants}
            className={`inline-block whitespace-pre ${
              isHighlight ? highlightClassName : ''
            }`}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.span>
  );
};
