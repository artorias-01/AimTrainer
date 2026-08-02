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

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={customTexture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
};
