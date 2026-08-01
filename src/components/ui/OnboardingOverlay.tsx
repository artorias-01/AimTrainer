import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Sliders, MousePointer, ShieldAlert, Check, ArrowRight } from 'lucide-react';
import { setOnboardingCompleted } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onDismiss }) => {
  const [step, setStep] = useState<number>(1);

  const handleNext = () => {
    soundManager.playClick();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    soundManager.playClick();
    setOnboardingCompleted(true);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#141414] border border-pink rounded-[12px] p-8 max-w-lg w-full space-y-6 shadow-2xl text-left"
      >
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-pink" />
            <span className="font-mono text-xs text-pink font-bold tracking-widest uppercase">
              WELCOME TO AIM // TT — STEP {step} OF 3
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            SKIP ONBOARDING
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-[12px] bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-pink">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                SENSITIVITY & CM/360 CALIBRATION
              </h2>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                AIM // TT supports exact sensitivity engine scaling across Valorant, CS2, Overwatch 2, and Apex Legends. Calibrate your DPI and game multiplier in <span className="text-pink font-bold">Options</span> for 1:1 muscle memory transfer.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-[12px] bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-pink">
                <MousePointer className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                AUTOMATIC POINTER LOCK
              </h2>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Drills automatically request 3D mouse pointer lock when entering the Arena. The 3-2-1 countdown begins immediately for seamless practice—no extra clicks required.
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-[12px] bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-pink">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                CONTROLS & REBINDING
              </h2>
              <p className="font-sans-ui text-xs text-neutral-400 leading-relaxed">
                Left click to shoot targets. Press <span className="text-pink font-bold">[Escape]</span> at any point to pause and unlock your mouse cursor. Rebind controls anytime under <span className="text-pink font-bold">Options / Controls</span>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step === i ? 'w-6 bg-pink' : 'w-2 bg-[#262626]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn-editorial-pink px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2"
          >
            {step < 3 ? (
              <>
                NEXT STEP <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                START TRAINING <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
