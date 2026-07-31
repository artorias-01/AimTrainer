import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

interface TargetSphereProps {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  vx?: number;
  vy?: number;
  targetSpeed?: number;
  pathType?: 'linear' | 'sinusoidal' | 'erratic';
  directionChangeIntervalMs?: number;
  speedVariance?: number;
  enableJukes?: boolean;
  spawnTime?: number;
  isTracking?: boolean;
  onHit: (id: string, hitX: number, hitY: number) => void;
}

// High-Contrast Editorial Target Colors (Light Pink, Pure White, Bright Blush, Light Silver)
// Black/Graphite targets removed for maximum visibility against dark arena background
const TARGET_COLORS = [
  '#f5b8c9', // Signature Light Pink
  '#ffffff', // Pure White
  '#ffc9d6', // Bright Soft Pink
  '#e2e2e2', // High-Contrast Light Silver Gray
];

export const TargetSphere: React.FC<TargetSphereProps> = React.memo(({
  id,
  x,
  y,
  z,
  radius,
  vx = 0,
  vy = 0,
  targetSpeed = 0,
  pathType = 'linear',
  directionChangeIntervalMs = 1000,
  speedVariance = 0,
  enableJukes = false,
  spawnTime = Date.now(),
  isTracking = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetSpeedMultiplier = useSettingsStore((s) => s.targetSpeedMultiplier) || 1.0;

  // Local movement refs for imperative Three.js position animation without React re-renders
  const posRef = useRef({ x, y, z });
  const velRef = useRef({ vx: vx * targetSpeedMultiplier, vy: vy * targetSpeedMultiplier });
  const lastChangeRef = useRef(Date.now());
  const phaseOffsetRef = useRef(Math.random() * Math.PI * 2);

  // Sync refs when initial position props or targetSpeedMultiplier change
  useEffect(() => {
    const currentMult = useSettingsStore.getState().targetSpeedMultiplier || 1.0;
    posRef.current = { x, y, z };
    velRef.current = { vx: vx * currentMult, vy: vy * currentMult };
    lastChangeRef.current = Date.now();
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
  }, [x, y, z, vx, vy, targetSpeed, targetSpeedMultiplier]);

  // Pick deterministic palette color from high-contrast target colors
  const colorIndex =
    Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    TARGET_COLORS.length;

  const baseColor = TARGET_COLORS[colorIndex];

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const now = Date.now();

    // 1. Mesh rotation & hover scale pulse
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.x = t * 0.4;
      if (isTracking && hovered) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(t * 10) * 0.06);
      }
    }

    // 2. Dynamic live speed evaluation (scales baseSpeed, heading velocity, & sinusoidal waves)
    const liveMult = useSettingsStore.getState().targetSpeedMultiplier || 1.0;
    const liveBaseSpeed = targetSpeed * liveMult;

    if (groupRef.current && liveBaseSpeed > 0) {
      let curX = posRef.current.x;
      let curY = posRef.current.y;
      let curVx = velRef.current.vx;
      let curVy = velRef.current.vy;

      // Periodic heading & speed drift
      if (now - lastChangeRef.current > directionChangeIntervalMs) {
        lastChangeRef.current = now;
        const speedMult = 1 + (Math.random() - 0.5) * (speedVariance * 2);
        const curSpeed = liveBaseSpeed * speedMult;

        if (enableJukes && Math.random() < 0.35) {
          curVx = -curVx;
          curVy = (Math.random() - 0.5) * curSpeed;
        } else {
          const angle = Math.random() * Math.PI * 2;
          curVx = Math.cos(angle) * curSpeed;
          curVy = Math.sin(angle) * curSpeed;
        }
      }

      curX += curVx * delta;
      curY += curVy * delta;

      if (pathType === 'sinusoidal') {
        curY += Math.sin((now - spawnTime) * 0.004 * liveMult + phaseOffsetRef.current) * 0.6 * liveMult * delta;
      }

      // Exact Geometric Wall & Floor Clearance Clamping (Accounts for Target Radius)
      const minX = -10.0 + radius + 0.1;
      const maxX = 10.0 - radius - 0.1;
      const minY = 0.0 + radius + 0.1;
      const maxY = 7.0 - radius - 0.1;

      if (curX < minX) {
        curX = minX;
        curVx = Math.abs(curVx);
      } else if (curX > maxX) {
        curX = maxX;
        curVx = -Math.abs(curVx);
      }

      if (curY < minY) {
        curY = minY;
        curVy = Math.abs(curVy);
      } else if (curY > maxY) {
        curY = maxY;
        curVy = -Math.abs(curVy);
      }

      posRef.current.x = curX;
      posRef.current.y = curY;
      velRef.current.vx = curVx;
      velRef.current.vy = curVy;

      groupRef.current.position.set(curX, curY, z);
    }
  });

  const targetShape = useSettingsStore((s) => s.targetShape) || 'sphere';

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {targetShape === 'torus' ? (
          <torusGeometry args={[radius * 0.8, radius * 0.3, 16, 32]} />
        ) : targetShape === 'cube' ? (
          <boxGeometry args={[radius * 1.5, radius * 1.5, radius * 1.5]} />
        ) : (
          <sphereGeometry args={[radius, 32, 32]} />
        )}
        <meshStandardMaterial
          color={hovered ? '#ffffff' : baseColor}
          roughness={0.15}
          metalness={0.1}
          emissive={baseColor === '#ffffff' ? '#f5b8c9' : baseColor}
          emissiveIntensity={hovered ? 0.95 : 0.65}
        />
      </mesh>
    </group>
  );
});
