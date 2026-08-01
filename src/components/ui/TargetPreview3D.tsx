import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

function TargetMeshPreview() {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const targetColor = useSettingsStore((s) => s.targetColor) || '#f5b8c9';

  useFrame(({ clock }) => {
    if (meshRef.current && targetShapeConfig.idleRotation !== false) {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.x = t * 0.4;
    }
  });

  const { shape, scale, wireframe, emissiveIntensity } = targetShapeConfig;
  const radius = 0.8 * (scale || 1.0);

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <mesh ref={meshRef}>
        {shape === 'torus' ? (
          <torusGeometry args={[radius * 0.8, radius * 0.3, 16, 32]} />
        ) : shape === 'cube' ? (
          <boxGeometry args={[radius * 1.4, radius * 1.4, radius * 1.4]} />
        ) : shape === 'octahedron' ? (
          <octahedronGeometry args={[radius * 1.2, 0]} />
        ) : shape === 'cylinder' ? (
          <cylinderGeometry args={[radius * 0.8, radius * 0.8, radius * 1.6, 32]} />
        ) : shape === 'cone' ? (
          <coneGeometry args={[radius, radius * 1.8, 32]} />
        ) : shape === 'capsule' ? (
          <capsuleGeometry args={[radius * 0.7, radius * 1.0, 16, 32]} />
        ) : (
          <sphereGeometry args={[radius, 32, 32]} />
        )}
        <meshStandardMaterial
          color={targetColor}
          wireframe={wireframe}
          roughness={0.15}
          metalness={0.1}
          emissive={targetColor === '#ffffff' ? '#f5b8c9' : targetColor}
          emissiveIntensity={emissiveIntensity ?? 0.65}
        />
      </mesh>
    </group>
  );
}

export const TargetPreview3D: React.FC = () => {
  return (
    <div className="w-full h-44 bg-[#0d0d0d] border border-[#262626] rounded-[12px] overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#f5b8c9_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative z-10 w-full h-full">
        <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
          <TargetMeshPreview />
        </Canvas>
      </div>
      <span className="absolute bottom-2 left-3 text-[9px] font-mono text-neutral-500 uppercase tracking-widest z-20">
        3D LIVE TARGET PREVIEW
      </span>
    </div>
  );
};
