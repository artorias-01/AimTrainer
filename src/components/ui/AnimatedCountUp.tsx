import React, { useEffect } from 'react';
import { useSpring, useTransform, motion, useReducedMotion } from 'framer-motion';

interface AnimatedCountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCountUp: React.FC<AnimatedCountUpProps> = ({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const springValue = useSpring(0, {
    duration: shouldReduceMotion ? 0 : duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (latest) => {
    return `${prefix}${latest.toFixed(decimals)}${suffix}`;
  });

  if (shouldReduceMotion) {
    return <span className={className}>{`${prefix}${value.toFixed(decimals)}${suffix}`}</span>;
  }

  return <motion.span className={className}>{displayValue}</motion.span>;
};
