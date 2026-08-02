import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getCustomBackgroundImage } from '../../utils/db';

export const ArenaBackdrop3D: React.FC = () => {
  const backdrop = useSettingsStore((s) => s.arenaBackdrop);
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);
  const { scene } = useThree();

  // Load texture from IndexedDB when backdrop is custom-image
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

  // Always keep scene.background as solid dark — we use in-scene geometry
  // for the custom image so it only fills the forward-facing black space.
  useEffect(() => {
    scene.background = new THREE.Color(0x050505);
    return () => {
      scene.background = new THREE.Color(0x050505);
    };
  }, [scene]);

  if (backdrop !== 'custom-image' || !customTexture) {
    return null;
  }

  // A flat plane placed just behind the front wall (Z = -7.5).
  // Sized at 52 × 30 units — large enough to fill the visible margins
  // (above, left, right of the front wall) at fov=103 from Z=2.5
  // without extending to directions the player can't normally see.
  // Centered at Y=3.5 (slightly above wall mid-point) so it covers
  // the full upper region visible above the wall top.
  // The front wall plane (22×10) occludes the center, so only the
  // surrounding black-space margins show the image.
  return (
    <mesh position={[0, 3.5, -7.5]}>
      <planeGeometry args={[52, 30]} />
      <meshBasicMaterial map={customTexture} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};
