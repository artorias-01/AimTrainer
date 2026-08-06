import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

const AmbientParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const [positions, colors] = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const accentHex = new THREE.Color(themeAccentColor);
    const whiteHex = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const mixCol = Math.random() > 0.35 ? accentHex : whiteHex;
      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;
    }
    return [pos, col];
  }, [themeAccentColor]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.025;
      pointsRef.current.rotation.x = Math.sin(t * 0.04) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

const AmbientRotatingGeometry: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const targetColor = useSettingsStore((s) => s.targetColor) || themeAccentColor;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.08;
      groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
  });

  const { shape, wireframe, emissiveIntensity } = targetShapeConfig;

  return (
    <group ref={groupRef}>
      {/* Floating Center Group */}
      <mesh position={[0, 0.2, -4]}>
        {shape === 'torus' ? (
          <torusGeometry args={[1.2, 0.4, 16, 32]} />
        ) : shape === 'cube' ? (
          <boxGeometry args={[1.6, 1.6, 1.6]} />
        ) : shape === 'octahedron' ? (
          <octahedronGeometry args={[1.5, 0]} />
        ) : (
          <sphereGeometry args={[1.2, 32, 32]} />
        )}
        <meshStandardMaterial
          color={targetColor}
          wireframe={wireframe}
          roughness={0.15}
          metalness={0.3}
          emissive={targetColor === '#ffffff' ? themeAccentColor : targetColor}
          emissiveIntensity={emissiveIntensity ?? 0.6}
        />
      </mesh>

      {/* Orbiting Satellite 1 */}
      <mesh position={[-3.5, 1.2, -5.2]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color={themeAccentColor}
          wireframe
          emissive={themeAccentColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Orbiting Satellite 2 */}
      <mesh position={[3.5, 1.2, -5.2]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color={themeAccentColor}
          wireframe
          emissive={themeAccentColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Grid Floor */}
      <gridHelper args={[26, 26, themeAccentColor, '#262626']} position={[0, -4, 0]} />
    </group>
  );
};

interface HeroSceneProps {
  className?: string;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ className }) => {
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  return (
    <div
      className={
        className ||
        'w-full h-full min-h-[420px] rounded-[12px] overflow-hidden bg-[#0d0d0d] relative select-none pointer-events-none'
      }
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 55 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color={themeAccentColor} />
        <AmbientRotatingGeometry />
        <AmbientParticles />
      </Canvas>
    </div>
  );
};
