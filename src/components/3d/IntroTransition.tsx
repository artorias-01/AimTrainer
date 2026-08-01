import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { soundManager } from '../../utils/audio';
import { useSettingsStore } from '../../store/useSettingsStore';

function AnimatedIntroScene() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();

    // 1. Slow, elegant camera dolly-in over duration (Z: 7.5 -> 4.8)
    const dollyProgress = Math.min(t / 2.2, 1.0);
    camera.position.z = 7.5 - dollyProgress * 2.7;

    // 2. Core geometry: smooth scale reveal + single deliberate Y-axis rotation
    if (meshRef.current) {
      const scaleProgress = Math.min(t / 0.6, 1.0);
      meshRef.current.scale.setScalar(scaleProgress);
      meshRef.current.rotation.y = t * 0.45;
    }

    // 3. Outer orbital ring: slow reverse rotation
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 0.25;
    }
  });

  const shapeType = targetShapeConfig?.shape || 'sphere';

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={2.0} color="#f5b8c9" />

      {/* Core Geometry (Scaled from 0, slow single-axis spin, pink emissive) */}
      <mesh ref={meshRef}>
        {shapeType === 'torus' ? (
          <torusGeometry args={[1.2, 0.4, 16, 32]} />
        ) : shapeType === 'cube' ? (
          <boxGeometry args={[1.6, 1.6, 1.6]} />
        ) : shapeType === 'octahedron' ? (
          <octahedronGeometry args={[1.5, 0]} />
        ) : shapeType === 'cylinder' ? (
          <cylinderGeometry args={[1.0, 1.0, 1.8, 32]} />
        ) : shapeType === 'cone' ? (
          <coneGeometry args={[1.2, 2.0, 32]} />
        ) : shapeType === 'capsule' ? (
          <capsuleGeometry args={[0.8, 1.2, 16, 32]} />
        ) : (
          <icosahedronGeometry args={[1.4, 1]} />
        )}
        <meshStandardMaterial
          color="#f5b8c9"
          wireframe
          emissive="#f5b8c9"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Outer Orbital Ring (Translucent silver, visually distinct) */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Floor Grid */}
      <gridHelper args={[20, 20, '#f5b8c9', '#262626']} position={[0, -2, 0]} />
    </group>
  );
}

interface IntroTransitionProps {
  onComplete: () => void;
}

export const IntroTransition: React.FC<IntroTransitionProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('aimtt_intro_played_v1', 'true');
    } catch {
      // Ignore fallback
    }
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 2200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        soundManager.playClick();
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            soundManager.playClick();
            handleFinish();
          }}
          className="fixed inset-0 z-[100] bg-[#0d0d0d] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
        >
          {/* 3D Canvas Background */}
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 7.5], fov: 60 }}>
              <AnimatedIntroScene />
            </Canvas>
          </div>

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/80 pointer-events-none" />

          {/* Overlay Text & Logo Formation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 text-center space-y-4 max-w-sm pointer-events-none"
          >
            <h1 className="font-display font-black text-4xl md:text-5xl tracking-widest text-white drop-shadow-lg">
              AIM <span className="text-[#f5b8c9]">//</span> TT
            </h1>
            <div className="h-0.5 w-16 bg-[#f5b8c9] mx-auto rounded-full animate-pulse" />
            <p className="font-mono text-[10px] text-neutral-400 tracking-[0.3em] uppercase">
              INITIALIZING 3D ENGINE
            </p>
          </motion.div>

          {/* Skip Notice Pill */}
          <div className="absolute bottom-8 z-20">
            <span className="px-3.5 py-1.5 rounded-full bg-[#141414]/90 border border-[#f5b8c9]/30 text-[10px] font-mono font-bold text-[#f5b8c9] tracking-wider uppercase backdrop-blur-sm shadow-md">
              [ ESC / CLICK ANYWHERE TO SKIP ]
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
