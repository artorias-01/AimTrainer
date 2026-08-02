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
      {/* Front Distant Sky Plane (Positioned at Z = -18, Y = 7.5, aligned with target wall top & forward FOV) */}
      <mesh position={[0, 7.5, -18]}>
        <planeGeometry args={[70, 20]} />
        <meshBasicMaterial map={customTexture} depthWrite={false} />
      </mesh>

      {/* Rear Distant Sky Plane (Positioned at Z = +18, Y = 7.5, aligned with rear wall top & forward FOV) */}
      <mesh position={[0, 7.5, 18]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[70, 20]} />
        <meshBasicMaterial map={customTexture} depthWrite={false} />
      </mesh>
    </group>
  );
};
