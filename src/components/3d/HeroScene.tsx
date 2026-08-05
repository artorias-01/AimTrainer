import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

const AmbientParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const [positions, colors] = useMemo(() => {
    const count = 140;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const accentHex = new THREE.Color(themeAccentColor);
    const whiteHex = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const mixCol = Math.random() > 0.35 ? accentHex : whiteHex;
      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;
    }
    return [pos, col];
  }, [themeAccentColor]);

  useFrame(({ clock, pointer }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.02 + pointer.x * 0.05;
      pointsRef.current.rotation.x = Math.sin(t * 0.04) * 0.02 - pointer.y * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
};

const ArmillaryRings: React.FC = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.15;
      ring1Ref.current.rotation.y = t * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.12;
      ring2Ref.current.rotation.z = -t * 0.1;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -t * 0.14;
      ring3Ref.current.rotation.x = t * 0.09;
    }
  });

  return (
    <group position={[0, -1.2, -0.5]}>
      {/* Outer Ethereal Celestial Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.6, 0.012, 16, 120]} />
        <meshStandardMaterial
          color={themeAccentColor}
          emissive={themeAccentColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Mid Armillary Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.1, 0.01, 16, 120]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={themeAccentColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.35}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Delicate Ring */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[1.6, 0.008, 16, 120]} />
        <meshStandardMaterial
          color={themeAccentColor}
          emissive={themeAccentColor}
          emissiveIntensity={0.7}
          transparent
          opacity={0.45}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

const OrbCluster: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const targetColor = useSettingsStore((s) => s.targetColor) || themeAccentColor;

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // AAA smooth lerp camera tilt responding to pointer
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.25, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.2, 0.05);
    }
    if (targetRef.current) {
      // Smooth floating motion baseline y = -1.2
      targetRef.current.position.x = Math.sin(t * 1.0) * 1.1;
      targetRef.current.position.y = -1.2 + Math.cos(t * 1.5) * 0.35;
      if (targetShapeConfig?.idleRotation !== false) {
        targetRef.current.rotation.y = t * 0.8;
        targetRef.current.rotation.x = t * 0.4;
      }
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(t * 2.5) * 0.7;
    }
  });

  const { shape, scale, wireframe, emissiveIntensity } = targetShapeConfig;
  const radius = 0.95 * (scale || 1.0);

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} position={[0, -1, 3]} intensity={2.2} color={themeAccentColor} />

      {/* Armillary Orbital Rings */}
      <ArmillaryRings />

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
          metalness={0.35}
          emissive={targetColor === '#ffffff' ? themeAccentColor : targetColor}
          emissiveIntensity={emissiveIntensity ?? 0.65}
        />
      </mesh>

      {/* Orbiting Editorial Target Objects */}
      {[
        [-2.8, 0.8, -1],
        [3.0, -2.4, 0.5],
        [-2.0, -3.2, -1.5],
        [2.5, 1.2, -0.8],
        [0, 2.4, -2],
      ].map((pos, idx) => {
        const orbRadius = 0.48;
        return (
          <mesh key={idx} position={pos as [number, number, number]}>
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
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}

      {/* Ambient Floating Particle Dust */}
      <AmbientParticles />

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
