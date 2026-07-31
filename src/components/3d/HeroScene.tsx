import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const OrbCluster: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004 + pointer.x * 0.008;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.12 - pointer.y * 0.15;
    }
    if (targetRef.current) {
      targetRef.current.position.x = Math.sin(t * 1.5) * 1.8;
      targetRef.current.position.y = Math.cos(t * 2) * 1.0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Hero Pink Target Sphere */}
      <mesh ref={targetRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          color="#f5b8c9"
          roughness={0.15}
          metalness={0.3}
          emissive="#f5b8c9"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Orbiting Editorial Target Orbs */}
      {[
        [-2.8, 1.8, -1],
        [3.0, -1.4, 0.5],
        [-2.0, -2.2, -1.5],
        [2.5, 2.2, -0.8],
        [0, 3.4, -2],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.48, 24, 24]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#f5b8c9' : '#ffffff'}
            roughness={0.2}
            emissive={idx % 2 === 0 ? '#f5b8c9' : '#ffffff'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Editorial Grid Floor */}
      <gridHelper args={[24, 24, '#f5b8c9', '#262626']} position={[0, -4, 0]} />
    </group>
  );
};

interface HeroSceneProps {
  className?: string;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ className }) => {
  return (
    <div
      className={
        className ||
        'w-full h-full min-h-[420px] rounded-[12px] overflow-hidden bg-[#0d0d0d] relative pointer-events-none'
      }
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#f5b8c9" />
        <OrbCluster />
      </Canvas>
    </div>
  );
};
