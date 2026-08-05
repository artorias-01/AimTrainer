import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

const OrbCluster: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const orbRefs = useRef<(THREE.Mesh | null)[]>([]);
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const targetColor = useSettingsStore((s) => s.targetColor) || themeAccentColor;

  const orbPositions: [number, number, number][] = [
    [-2.8, 0.8, -1],
    [3.0, -2.4, 0.5],
    [-2.0, -3.2, -1.5],
    [2.5, 1.2, -0.8],
    [0, 2.4, -2],
  ];

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Smooth lerped parallax rotation based on mouse pointer
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, t * 0.08 + pointer.x * 0.25, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.sin(t * 0.3) * 0.08 - pointer.y * 0.2, 0.05);
    }

    if (targetRef.current) {
      // Central Hero Target: Lissajous floating path + breathing pulse
      targetRef.current.position.x = Math.sin(t * 1.2) * 1.3;
      targetRef.current.position.y = -1.2 + Math.cos(t * 1.6) * 0.45;
      targetRef.current.position.z = Math.sin(t * 0.8) * 0.4;

      const pulse = 1.0 + Math.sin(t * 3.5) * 0.06;
      targetRef.current.scale.setScalar(pulse);

      if (targetShapeConfig?.idleRotation !== false) {
        targetRef.current.rotation.y = t * 1.1;
        targetRef.current.rotation.x = t * 0.6;
      }
    }

    // Orbiting peripheral targets: dynamic bobbing & individual axial rotation
    orbRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const initialPos = orbPositions[idx];
      const speedOffset = 1.0 + idx * 0.25;
      const phase = idx * 1.2;

      mesh.position.x = initialPos[0] + Math.sin(t * 0.8 * speedOffset + phase) * 0.35;
      mesh.position.y = initialPos[1] + Math.cos(t * 1.1 * speedOffset + phase) * 0.3;
      mesh.position.z = initialPos[2] + Math.sin(t * 0.6 * speedOffset + phase) * 0.25;

      mesh.rotation.y = t * (0.6 + idx * 0.2);
      mesh.rotation.x = t * (0.3 + idx * 0.15);
    });
  });

  const { shape, scale, wireframe, emissiveIntensity } = targetShapeConfig;
  const radius = 0.95 * (scale || 1.0);

  return (
    <group ref={groupRef}>
      {/* Central Hero Dynamic Target Geometry */}
      <mesh ref={targetRef} position={[0, -1.2, 0]}>
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
          metalness={0.3}
          emissive={targetColor === '#ffffff' ? themeAccentColor : targetColor}
          emissiveIntensity={emissiveIntensity ?? 0.65}
        />
      </mesh>

      {/* Orbiting Target Objects */}
      {orbPositions.map((pos, idx) => {
        const orbRadius = 0.48;
        return (
          <mesh
            key={idx}
            ref={(el) => (orbRefs.current[idx] = el)}
            position={pos}
          >
            {shape === 'torus' ? (
              <torusGeometry args={[orbRadius * 0.8, orbRadius * 0.3, 16, 32]} />
            ) : shape === 'cube' ? (
              <boxGeometry args={[orbRadius * 1.4, orbRadius * 1.4, orbRadius * 1.4]} />
            ) : shape === 'octahedron' ? (
              <octahedronGeometry args={[orbRadius * 1.2, 0]} />
            ) : shape === 'cylinder' ? (
              <cylinderGeometry args={[orbRadius * 0.8, orbRadius * 0.8, orbRadius * 1.6, 32]} />
            ) : shape === 'cone' ? (
              <coneGeometry args={[orbRadius, orbRadius * 1.8, 32]} />
            ) : shape === 'capsule' ? (
              <capsuleGeometry args={[orbRadius * 0.7, orbRadius * 1.0, 16, 32]} />
            ) : (
              <sphereGeometry args={[orbRadius, 24, 24]} />
            )}
            <meshStandardMaterial
              color={idx % 2 === 0 ? themeAccentColor : '#ffffff'}
              wireframe={wireframe}
              roughness={0.2}
              emissive={idx % 2 === 0 ? themeAccentColor : '#ffffff'}
              emissiveIntensity={0.55}
            />
          </mesh>
        );
      })}

      {/* Editorial Grid Floor */}
      <gridHelper args={[24, 24, themeAccentColor, '#262626']} position={[0, -4, 0]} />
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
        'w-full h-full min-h-[420px] rounded-[12px] overflow-hidden bg-[#0d0d0d] relative pointer-events-none'
      }
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color={themeAccentColor} />
        <OrbCluster />
      </Canvas>
    </div>
  );
};
