import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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
  currentHp?: number;
  maxHp?: number;
  onHit: (id: string, hitX: number, hitY: number) => void;
}

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
  currentHp,
  maxHp,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetSpeedMultiplier = useSettingsStore((s) => s.targetSpeedMultiplier) || 1.0;
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const TARGET_COLORS = [
    themeAccentColor,
    '#ffffff',
    themeAccentColor,
    '#e2e2e2',
  ];

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

  const colorIndex =
    Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    TARGET_COLORS.length;

  const baseColor = TARGET_COLORS[colorIndex];

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const now = Date.now();

    // 1. Mesh rotation & hover scale pulse
    if (meshRef.current) {
      const liveConfig = useSettingsStore.getState().targetShapeConfig;
      if (liveConfig?.idleRotation !== false) {
        meshRef.current.rotation.y = t * 0.8;
        meshRef.current.rotation.x = t * 0.4;
      }
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

  const shapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const customTargetColor = useSettingsStore((s) => s.targetColor);
  const activeColor = customTargetColor || baseColor;

  const shape = shapeConfig?.shape || 'sphere';
  const scaleMult = shapeConfig?.scale ?? 1.0;
  const isWireframe = shapeConfig?.wireframe ?? false;
  const glowIntensity = hovered ? 0.95 : (shapeConfig?.emissiveIntensity ?? 0.65);
  const effRadius = radius * scaleMult;

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {shape === 'torus' ? (
          <torusGeometry args={[effRadius * 0.8, effRadius * 0.3, 16, 32]} />
        ) : shape === 'cube' ? (
          <boxGeometry args={[effRadius * 1.5, effRadius * 1.5, effRadius * 1.5]} />
        ) : shape === 'octahedron' ? (
          <octahedronGeometry args={[effRadius * 1.2, 0]} />
        ) : shape === 'cylinder' ? (
          <cylinderGeometry args={[effRadius * 0.8, effRadius * 0.8, effRadius * 1.6, 32]} />
        ) : shape === 'cone' ? (
          <coneGeometry args={[effRadius, effRadius * 1.8, 32]} />
        ) : shape === 'capsule' ? (
          <capsuleGeometry args={[effRadius * 0.7, effRadius * 1.0, 16, 32]} />
        ) : (
          <sphereGeometry args={[effRadius, 32, 32]} />
        )}
        <meshStandardMaterial
          color={hovered ? '#ffffff' : activeColor}
          wireframe={isWireframe}
          roughness={0.15}
          metalness={0.1}
          emissive={activeColor === '#ffffff' ? themeAccentColor : activeColor}
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* 3D Billboard Health Bar for Multi-Hit Targets */}
      {maxHp !== undefined && maxHp > 1 && (
        <Html center position={[0, effRadius + 0.32, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className="w-14 h-2 bg-[#0d0d0d]/90 border border-[#262626] rounded-full p-0.5 shadow-md flex items-center overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${Math.max(0, Math.min(100, (((currentHp ?? maxHp) / maxHp) * 100)))}%`,
                  backgroundColor:
                    ((currentHp ?? maxHp) / maxHp) > 0.5
                      ? '#22c55e'
                      : ((currentHp ?? maxHp) / maxHp) > 0.25
                      ? '#eab308'
                      : '#ef4444',
                }}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
});
