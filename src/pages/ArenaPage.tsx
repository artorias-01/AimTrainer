import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ArenaScene } from '../components/3d/ArenaScene';
import { LiveHUD } from '../components/ui/LiveHUD';
import { PauseModal } from '../components/ui/PauseModal';
import { Monitor, Smartphone, Crosshair } from 'lucide-react';

interface ArenaPageProps {
  onNavigate: (page: string) => void;
}

export const ArenaPage: React.FC<ArenaPageProps> = ({ onNavigate }) => {
  const { status, startSession, pauseSession, resumeSession } = useGameStore();
  const { pauseKey, restartKey } = useSettingsStore();
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(
    () => typeof document !== 'undefined' && !!document.pointerLockElement
  );
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [pointerLockDenied, setPointerLockDenied] = useState<boolean>(false);

  // Remove custom cursor lock class on mount so native pointer lock works cleanly
  useEffect(() => {
    document.documentElement.classList.remove('custom-cursor-active');
  }, []);

  // Check touch / coarse pointer device support
  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  // Track global pointer lock state change
  useEffect(() => {
    const handleLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsPointerLocked(locked);
      if (locked) {
        setPointerLockDenied(false);
      }
    };
    const handleLockError = () => {
      setPointerLockDenied(true);
      setIsPointerLocked(false);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('pointerlockerror', handleLockError);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('pointerlockerror', handleLockError);
    };
  }, []);

  // Initialize session on mount if idle
  useEffect(() => {
    if (status === 'idle') {
      startSession();
    }
  }, [status, startSession]);

  // Navigate to results page when session finishes
  useEffect(() => {
    if (status === 'finished') {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      onNavigate('results');
    }
  }, [status, onNavigate]);

  // Custom keybind listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code || e.key;

      if (code === pauseKey || e.key === 'Escape') {
        if (status === 'playing') {
          pauseSession();
        } else if (status === 'paused') {
          resumeSession();
        }
      } else if (code === restartKey) {
        startSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, pauseSession, resumeSession, startSession, pauseKey, restartKey]);

  // Clean Pointer Lock Request Helper triggered directly by user gesture
  const requestPointerLock = () => {
    setPointerLockDenied(false);
    const canvasEl = document.querySelector('canvas');

    if (canvasEl) {
      try {
        const promise = canvasEl.requestPointerLock() as any;
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => setPointerLockDenied(true));
        }
      } catch {
        setPointerLockDenied(true);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden select-none">
      {/* Touch Device Banner */}
      {isTouchDevice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d0d] border border-pink text-white px-5 py-2.5 rounded-[12px] text-xs font-mono flex items-center gap-3 backdrop-blur-md shadow-none">
          <Smartphone className="w-4 h-4 text-pink" />
          <span>TOUCH MODE ACTIVE :: DRAG SCREEN TO AIM & TAP TO SHOOT</span>
          <Monitor className="w-4 h-4 text-neutral-400" />
        </div>
      )}

      {/* Click to Lock Aim Overlay when pointer is not locked during active gameplay */}
      {!isPointerLocked && !isTouchDevice && status === 'playing' && (
        <div
          onClick={requestPointerLock}
          className="absolute inset-0 z-40 bg-[#050505]/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
        >
          <div className="bg-[#0d0d0d] border border-pink/60 group-hover:border-pink text-white px-8 py-6 rounded-[20px] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center gap-3 text-center transition-all transform group-hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-pink text-[#0d0d0d] flex items-center justify-center font-bold">
              <Crosshair className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-wider block text-white">
                CLICK TO LOCK AIM & PLAY
              </span>
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">
                {pointerLockDenied
                  ? 'POINTER LOCK RESET :: CLICK TO SYNC MOUSE'
                  : 'PRESS ESCAPE AT ANY TIME TO PAUSE DRILL'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas Scene */}
      <ArenaScene
        onPointerLockChange={(locked) => setIsPointerLocked(locked)}
        onRequestLock={requestPointerLock}
        isTouchDevice={isTouchDevice}
      />

      {/* Live In-Game HUD */}
      <LiveHUD />

      {/* Pause Drawer Modal */}
      {status === 'paused' && (
        <PauseModal
          onNavigate={onNavigate}
          onResume={() => {
            resumeSession();
            requestPointerLock();
          }}
        />
      )}
    </div>
  );
};
