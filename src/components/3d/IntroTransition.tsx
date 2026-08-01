import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { soundManager } from '../../utils/audio';
import { useSettingsStore } from '../../store/useSettingsStore';

function sampleShapePoints(shape: string, count: number): Float32Array {
  const targetPositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;

    if (shape === 'cube') {
      const face = Math.floor(Math.random() * 6);
      const u = (Math.random() - 0.5) * 2.2;
      const v = (Math.random() - 0.5) * 2.2;
      if (face === 0) { x = 1.1; y = u; z = v; }
      else if (face === 1) { x = -1.1; y = u; z = v; }
      else if (face === 2) { x = u; y = 1.1; z = v; }
      else if (face === 3) { x = u; y = -1.1; z = v; }
      else if (face === 4) { x = u; y = v; z = 1.1; }
      else { x = u; y = v; z = -1.1; }
    } else if (shape === 'torus') {
      const R = 1.2;
      const r = 0.4;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      x = (R + r * Math.cos(v)) * Math.cos(u);
      y = (R + r * Math.cos(v)) * Math.sin(u);
      z = r * Math.sin(v);
    } else if (shape === 'octahedron') {
      const r = 1.5;
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      const absX = Math.cos(v) * Math.cos(u);
      const absY = Math.cos(v) * Math.sin(u);
      const absZ = Math.sin(v);
      const norm = Math.abs(absX) + Math.abs(absY) + Math.abs(absZ);
      x = (absX / norm) * r;
      y = (absY / norm) * r;
      z = (absZ / norm) * r;
    } else if (shape === 'cylinder') {
      const radius = 1.0;
      const halfH = 0.9;
      const angle = Math.random() * Math.PI * 2;
      if (Math.random() < 0.7) {
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = (Math.random() - 0.5) * halfH * 2;
      } else {
        const rCap = Math.sqrt(Math.random()) * radius;
        x = Math.cos(angle) * rCap;
        z = Math.sin(angle) * rCap;
        y = Math.random() < 0.5 ? halfH : -halfH;
      }
    } else if (shape === 'cone') {
      const radius = 1.2;
      const height = 2.0;
      const h = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const rAtH = (1 - h) * radius;
      x = Math.cos(angle) * rAtH;
      z = Math.sin(angle) * rAtH;
      y = h * height - height / 2;
    } else if (shape === 'capsule') {
      const r = 0.8;
      const halfH = 0.6;
      const angle = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * halfH * 2;
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      y = h;
    } else {
      // Sphere (default)
      const r = 1.4;
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(v) * Math.cos(u);
      y = r * Math.sin(v) * Math.sin(u);
      z = r * Math.cos(v);
    }

    targetPositions[i * 3] = x;
    targetPositions[i * 3 + 1] = y;
    targetPositions[i * 3 + 2] = z;
  }

  return targetPositions;
}

function ParticleTargetLockScene({ onFlashSound }: { onFlashSound: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const soundFiredRef = useRef(false);

  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const performanceMode = useSettingsStore((s) => s.performanceMode);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const shapeType = targetShapeConfig?.shape || 'sphere';
  const particleCount = performanceMode ? 100 : 250;

  // Initial scattered positions & color arrays
  const { startPositions, targetPositions, colors, currentPositions } = useMemo(() => {
    const startPos = new Float32Array(particleCount * 3);
    const currPos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const targetPos = sampleShapePoints(shapeType, particleCount);

    const accentRGB = new THREE.Color(themeAccentColor);
    const whiteRGB = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      // Scatter in spherical boundary radius 3.5 to 7.0
      const radius = 3.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const sx = radius * Math.sin(phi) * Math.cos(theta);
      const sy = radius * Math.sin(phi) * Math.sin(theta);
      const sz = radius * Math.cos(phi);

      startPos[i * 3] = sx;
      startPos[i * 3 + 1] = sy;
      startPos[i * 3 + 2] = sz;

      currPos[i * 3] = sx;
      currPos[i * 3 + 1] = sy;
      currPos[i * 3 + 2] = sz;

      const c = Math.random() < 0.65 ? accentRGB : whiteRGB;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return {
      startPositions: startPos,
      targetPositions: targetPos,
      colors: col,
      currentPositions: currPos,
    };
  }, [shapeType, particleCount, themeAccentColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Scatter Drift Phase (0.0s - 0.6s)
    // 2. Acceleration / Convergence Phase (0.6s - 1.6s)
    let convFactor = 0;
    if (t > 0.6) {
      const rawProgress = Math.min((t - 0.6) / 1.0, 1.0);
      convFactor = Math.pow(rawProgress, 2.5);
    }

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const sx = startPositions[idx];
        const sy = startPositions[idx + 1];
        const sz = startPositions[idx + 2];

        const tx = targetPositions[idx];
        const ty = targetPositions[idx + 1];
        const tz = targetPositions[idx + 2];

        const driftX = Math.sin(t * 1.5 + i) * 0.08 * (1 - convFactor);
        const driftY = Math.cos(t * 1.2 + i) * 0.08 * (1 - convFactor);

        arr[idx] = sx + (tx - sx) * convFactor + driftX;
        arr[idx + 1] = sy + (ty - sy) * convFactor + driftY;
        arr[idx + 2] = sz + (tz - sz) * convFactor;
      }

      posAttr.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.3;
    }

    // 3. Lock-On Flash & Shockwave Pulse (1.6s - 1.9s)
    if (t >= 1.6 && !soundFiredRef.current) {
      soundFiredRef.current = true;
      onFlashSound();
    }

    if (coreMeshRef.current) {
      const coreOpacity = t >= 1.5 ? Math.min((t - 1.5) / 0.3, 1.0) : 0;
      coreMeshRef.current.scale.setScalar(coreOpacity);
      coreMeshRef.current.rotation.y = t * 0.5;

      const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (t >= 1.6 && t <= 1.9) {
          const flashProgress = (t - 1.6) / 0.3;
          mat.emissiveIntensity = 0.8 + Math.sin(flashProgress * Math.PI) * 2.2;
        } else {
          mat.emissiveIntensity = 0.8;
        }
      }
    }

    // Shockwave Ring Animation
    if (shockwaveRef.current && t >= 1.6) {
      const swProgress = Math.min((t - 1.6) / 0.5, 1.0);
      shockwaveRef.current.scale.setScalar(0.5 + swProgress * 3.5);
      const swMat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      if (swMat) {
        swMat.opacity = (1 - swProgress) * 0.8;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={2.5} color={themeAccentColor} />

      {/* Converging Point Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[currentPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Solid Core Shape Revealed on Convergence */}
      <mesh ref={coreMeshRef} scale={0}>
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
          <sphereGeometry args={[1.4, 32, 32]} />
        )}
        <meshStandardMaterial
          color={themeAccentColor}
          wireframe
          emissive={themeAccentColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Expanding Lock-On Shockwave Ring */}
      <mesh ref={shockwaveRef} scale={0} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 64]} />
        <meshBasicMaterial
          color={themeAccentColor}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <gridHelper args={[24, 24, themeAccentColor, '#262626']} position={[0, -2.5, 0]} />
    </group>
  );
}

interface IntroTransitionProps {
  onComplete: () => void;
}

export const IntroTransition: React.FC<IntroTransitionProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);

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
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1600);

    const timer = setTimeout(() => {
      handleFinish();
    }, 2600);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        soundManager.playClick();
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(logoTimer);
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
            <Canvas camera={{ position: [0, 0, 7.0], fov: 60 }}>
              <ParticleTargetLockScene onFlashSound={() => soundManager.playClick()} />
            </Canvas>
          </div>

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/80 pointer-events-none" />

          {/* Overlay Text & Logo Formation */}
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative z-20 text-center space-y-3 max-w-sm pointer-events-none"
              >
                <h1 className="font-display font-black text-4xl md:text-5xl tracking-widest text-white drop-shadow-xl">
                  AIM <span className="text-pink">//</span> TT
                </h1>
                <div className="h-0.5 w-16 bg-pink mx-auto rounded-full animate-pulse" />
                <p className="font-mono text-[10px] text-pink font-bold tracking-[0.3em] uppercase">
                  TARGET ACQUIRED
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip Notice Pill */}
          <div className="absolute bottom-8 z-20">
            <span className="px-3.5 py-1.5 rounded-full bg-[#141414]/90 border border-pink/30 text-[10px] font-mono font-bold text-pink tracking-wider uppercase backdrop-blur-sm shadow-md">
              [ ESC / CLICK ANYWHERE TO SKIP ]
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
