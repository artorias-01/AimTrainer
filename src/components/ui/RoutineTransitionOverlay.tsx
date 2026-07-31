import React from 'react';
import { motion } from 'framer-motion';
import { Play, Layers } from 'lucide-react';

interface RoutineTransitionOverlayProps {
  currentStep: number;
  totalSteps: number;
  nextDrillName: string;
  onContinue: () => void;
}

export const RoutineTransitionOverlay: React.FC<RoutineTransitionOverlayProps> = ({
  currentStep,
  totalSteps,
  nextDrillName,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#141414] border border-[#f5b8c9] rounded-[12px] p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
      >
        <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#f5b8c9] uppercase tracking-widest">
          <Layers className="w-4 h-4 text-[#f5b8c9]" />
          PLAYLIST SEQUENCE // STEP {currentStep} OF {totalSteps}
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[10px] text-neutral-400 block uppercase">UP NEXT</span>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-wider">
            {nextDrillName}
          </h2>
        </div>

        <button
          onClick={onContinue}
          className="btn-editorial-pink w-full py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-[#0d0d0d]" />
          START NEXT DRILL
        </button>
      </motion.div>
    </div>
  );
};
