import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getCustomBackgroundImage } from '../../utils/db';

export const ArenaBackdrop3D: React.FC = () => {
  const backdrop = useSettingsStore((s) => s.arenaBackdrop);
  const themeAccent = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

  // Load custom image texture if custom-image is active
  useEffect(() => {
    if (backdrop !== 'custom-image') return;

    let isMounted = true;
    getCustomBackgroundImage().then((dataUrl) => {
      if (!isMounted || !dataUrl) return;

      const loader = new THREE.TextureLoader();
      loader.load(dataUrl, (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        setCustomTexture(tex);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [backdrop]);

  // Starfield particle positions & colors - Full dome uniform spherical distribution
  const starfieldData = useMemo(() => {
    const count = 2800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color(themeAccent);
    const whiteColor = new THREE.Color('#ffffff');
    const cyanColor = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const radius = 70 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorChoice = Math.random();
      const col = colorChoice > 0.7 ? baseColor : colorChoice > 0.4 ? cyanColor : whiteColor;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    return { positions, colors };
  }, [themeAccent]);

  // Galaxy cluster particles for 'deep-space'
  const galaxyData = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const purple = new THREE.Color('#8b5cf6');
    const cyan = new THREE.Color('#06b6d4');
    const pink = new THREE.Color('#ec4899');

    for (let i = 0; i < count; i++) {
      const arm = i % 3;
      const distance = Math.random() * 22 + 2;
      const angle = distance * 0.25 + (arm * Math.PI * 2) / 3;

      const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 3;
      const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 4;

      // Position galaxy far in background overhead
      positions[i * 3] = x - 25;
      positions[i * 3 + 1] = y + 45;
      positions[i * 3 + 2] = z - 65;

      const mixVal = Math.random();
      const col = mixVal > 0.6 ? purple : mixVal > 0.3 ? cyan : pink;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    return { positions, colors };
  }, []);

  const starGroupRef = useRef<THREE.Points>(null);
  const nebulaGroupRef = useRef<THREE.Group>(null);
  const auroraMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (starGroupRef.current) {
      starGroupRef.current.rotation.y = t * 0.008;
    }

    if (nebulaGroupRef.current) {
      nebulaGroupRef.current.rotation.y = t * 0.012;
      nebulaGroupRef.current.rotation.z = Math.sin(t * 0.05) * 0.05;
    }

    if (auroraMeshRef.current) {
      auroraMeshRef.current.rotation.y = Math.sin(t * 0.04) * 0.15;
    }
  });

  return (
    <group>
      {/* 1. Procedural Starfield Particle Dome (used in Nebula, Starfield, Deep Space) */}
      {(backdrop === 'nebula' || backdrop === 'starfield' || backdrop === 'deep-space' || backdrop === 'aurora') && (
        <points ref={starGroupRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[starfieldData.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[starfieldData.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.65}
            vertexColors
            transparent
            opacity={0.85}
            sizeAttenuation
          />
        </points>
      )}

      {/* 2. Procedural Cosmic Nebula Clouds */}
      {backdrop === 'nebula' && (
        <group ref={nebulaGroupRef}>
          {/* Cyan Cloud */}
          <mesh position={[-30, 35, -70]}>
            <sphereGeometry args={[28, 16, 16]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} wireframe={false} />
          </mesh>

          {/* Violet Cloud */}
          <mesh position={[25, 40, -65]}>
            <sphereGeometry args={[32, 16, 16]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.14} wireframe={false} />
          </mesh>

          {/* Magenta Emissive Cloud */}
          <mesh position={[0, 48, -80]}>
            <sphereGeometry args={[38, 16, 16]} />
            <meshBasicMaterial color="#db2777" transparent opacity={0.12} wireframe={false} />
          </mesh>
        </group>
      )}

      {/* 3. Deep Space Galaxy Spiral */}
      {backdrop === 'deep-space' && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[galaxyData.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[galaxyData.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.8} vertexColors transparent opacity={0.9} sizeAttenuation />
        </points>
      )}

      {/* 4. Aurora Waves */}
      {backdrop === 'aurora' && (
        <mesh ref={auroraMeshRef} position={[0, 35, -55]} rotation={[-Math.PI / 6, 0, 0]}>
          <planeGeometry args={[120, 45, 16, 16]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}

      {/* 5. Custom Image & NASA Photo - Front & Rear Flat Wall Planes */}
      {backdrop === 'custom-image' && customTexture && (
        <group>
          {/* Front Wall Backdrop Plane */}
          <mesh position={[0, 3.2, -6.48]}>
            <planeGeometry args={[22.2, 10.2]} />
            <meshBasicMaterial map={customTexture} depthWrite={false} />
          </mesh>

          {/* Rear Wall Backdrop Plane */}
          <mesh position={[0, 3.2, 6.48]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[22.2, 10.2]} />
            <meshBasicMaterial map={customTexture} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};
