import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getCustomBackgroundImage } from '../../utils/db';

export const ArenaBackdrop3D: React.FC = () => {
  const backdrop = useSettingsStore((s) => s.arenaBackdrop);
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

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

  // A flat plane has 1:1 UV mapping — no polar pinching or curved horizon
  // bowing that plagued the sphere and cylinder approaches.
  // Sized at 400 × 200 to overfill the frustum at fov=103 from any
  // position inside the open arena (-11..11 X, 0..7.5 Y, -6.5..6.5 Z).
  // Positioned well behind the target wall at Z = -100, centered vertically
  // at Y = 7 so it sits across the player's natural eye-level view.
  return (
    <mesh position={[0, 7, -100]}>
      <planeGeometry args={[400, 200]} />
      <meshBasicMaterial map={customTexture} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};
