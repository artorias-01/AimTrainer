import React from 'react';
import { motion } from 'framer-motion';

interface SpringToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}

export const SpringToggle: React.FC<SpringToggleProps> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none border ${
        checked ? 'bg-pink border-pink' : 'bg-[#1a1a1a] border-[#333333]'
      }`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-[#0d0d0d] shadow-md"
        animate={{ x: checked ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      />
    </button>
  );
};
