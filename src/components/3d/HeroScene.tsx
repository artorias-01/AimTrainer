import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

interface CameraControllerProps {
  scrollProgress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollProgress }) => {
  useFrame(({ camera, pointer }) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 7.0;

    if (scrollProgress <= 0.33) {
      const p = scrollProgress / 0.33;
      targetX = THREE.MathUtils.lerp(0, 1.4, p);
      targetY = THREE.MathUtils.lerp(0, -0.7, p);
      targetZ = THREE.MathUtils.lerp(7.0, 4.0, p);
    } else if (scrollProgress <= 0.66) {
      const p = (scrollProgress - 0.33) / 0.33;
      targetX = THREE.MathUtils.lerp(1.4, -2.4, p);
      targetY = THREE.MathUtils.lerp(-0.7, 0.5, p);
      targetZ = THREE.MathUtils.lerp(4.0, 5.6, p);
    } else {
      const p = (scrollProgress - 0.66) / 0.34;
      targetX = THREE.MathUtils.lerp(-2.4, 0, p);
      targetY = THREE.MathUtils.lerp(0.5, -0.2, p);
      targetZ = THREE.MathUtils.lerp(5.6, 6.2, p);
    }

    const px = pointer.x * 0.4;
    const py = pointer.y * 0.4;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + px, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + py, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(0, -0.5, 0);
  });

  return null;
};

const AmbientParticles: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const [positions, colors] = useMemo(() => {
    const count = 110;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const accentHex = new THREE.Color(themeAccentColor);
    const whiteHex = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const mixCol = Math.random() > 0.4 ? accentHex : whiteHex;
      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;
    }
    return [pos, col];
  }, [themeAccentColor]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      const speedMult = 0.03 + scrollProgress * 0.06;
      pointsRef.current.rotation.y = t * speedMult;
      pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.03;
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

const OrbCluster: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const targetColor = useSettingsStore((s) => s.targetColor) || themeAccentColor;

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    const rotSpeed = 0.004 + scrollProgress * 0.01;
    if (groupRef.current) {
      groupRef.current.rotation.y += rotSpeed + pointer.x * 0.008;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1 - pointer.y * 0.1;
    }
    if (targetRef.current) {
      targetRef.current.position.x = Math.sin(t * 1.0 + scrollProgress * Math.PI) * (1.1 + scrollProgress * 0.5);
      targetRef.current.position.y = -1.2 + Math.cos(t * 1.5) * 0.35;
      if (targetShapeConfig?.idleRotation !== false) {
        targetRef.current.rotation.y = t * (0.8 + scrollProgress * 1.0);
        targetRef.current.rotation.x = t * 0.4;
      }
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(t * 2.5 + scrollProgress * 4) * 0.8;
    }
  });

  const { shape, scale, wireframe, emissiveIntensity } = targetShapeConfig;
  const radius = 0.95 * (scale || 1.0);

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} position={[0, -1, 3]} intensity={2.0} color={themeAccentColor} />

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
          emissiveIntensity={emissiveIntensity ?? 0.6}
        />
      </mesh>

      {/* Orbiting Target Objects */}
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
      <AmbientParticles scrollProgress={scrollProgress} />

      {/* Editorial Grid Floor */}
      <gridHelper args={[26, 26, themeAccentColor, '#262626']} position={[0, -4, 0]} />
    </group>
  );
};

interface HeroSceneProps {
  className?: string;
  scrollProgress?: number;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ className, scrollProgress = 0 }) => {
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  return (
    <div
      className={
        className ||
        'w-full h-full rounded-[12px] overflow-hidden bg-[#0d0d0d] relative pointer-events-none'
      }
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color={themeAccentColor} />
        <CameraController scrollProgress={scrollProgress} />
        <OrbCluster scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};
