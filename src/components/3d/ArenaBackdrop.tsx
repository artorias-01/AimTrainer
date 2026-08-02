import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getCustomBackgroundImage } from '../../utils/db';

export const ArenaBackdrop3D: React.FC = () => {
  const backdrop = useSettingsStore((s) => s.arenaBackdrop);
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

  if (backdrop !== 'custom-image' || !customTexture) {
    return null;
  }

  return (
    <group>
      {/* Front Distant Sky Plane (Positioned at Z = -18, Y = 16, behind Z = -6.5 target wall) */}
      <mesh position={[0, 16, -18]}>
        <planeGeometry args={[60, 32]} />
        <meshBasicMaterial map={customTexture} depthWrite={false} />
      </mesh>

      {/* Rear Distant Sky Plane (Positioned at Z = +18, Y = 16, behind Z = +6.5 rear target wall) */}
      <mesh position={[0, 16, 18]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[60, 32]} />
        <meshBasicMaterial map={customTexture} depthWrite={false} />
      </mesh>
    </group>
  );
};
