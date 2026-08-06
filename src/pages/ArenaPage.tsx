import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ArenaScene } from '../components/3d/ArenaScene';
import { LiveHUD } from '../components/ui/LiveHUD';
import { PauseModal } from '../components/ui/PauseModal';
import { Monitor, Smartphone, AlertTriangle } from 'lucide-react';

interface ArenaPageProps {
  onNavigate: (page: string) => void;
}

export const ArenaPage: React.FC<ArenaPageProps> = ({ onNavigate }) => {
  const { status, startSession, pauseSession, resumeSession } = useGameStore();
  const { pauseKey, restartKey } = useSettingsStore();
  const [, setIsPointerLocked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pointerLockDenied, setPointerLockDenied] = useState(false);

  // Remove custom cursor lock class on mount so pointer lock & cursor work smoothly
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

  // Listen for native pointerlockerror events
  useEffect(() => {
    const handlePointerLockError = () => {
      setPointerLockDenied(true);
    };
    document.addEventListener('pointerlockerror', handlePointerLockError);
    return () => document.removeEventListener('pointerlockerror', handlePointerLockError);
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

  // Clean Pointer Lock Request Helper without forced fullscreen collisions
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

  // Automatically request pointer lock on mount using transient user activation
  useEffect(() => {
    if (isTouchDevice) return;

    const timer = setTimeout(() => {
      if (!document.pointerLockElement) {
        requestPointerLock();
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [isTouchDevice]);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* Touch Device Banner */}
      {isTouchDevice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d0d] border border-pink text-white px-5 py-2.5 rounded-[12px] text-xs font-mono flex items-center gap-3 backdrop-blur-md shadow-none">
          <Smartphone className="w-4 h-4 text-pink" />
          <span>TOUCH MODE ACTIVE :: DRAG SCREEN TO AIM & TAP TO SHOOT</span>
          <Monitor className="w-4 h-4 text-neutral-400" />
        </div>
      )}

      {/* Requirement 2: Pointer Lock Error Warning Banner */}
      {pointerLockDenied && !isTouchDevice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1f0d11] border border-red-500 text-white px-5 py-3 rounded-[12px] text-xs font-mono flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="font-bold block text-red-300 uppercase">POINTER LOCK DENIED BY BROWSER</span>
            <span className="text-[10px] text-neutral-300">Click anywhere inside the 3D canvas or press Escape to reset browser permissions.</span>
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
