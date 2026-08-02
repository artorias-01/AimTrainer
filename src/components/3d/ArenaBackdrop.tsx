import React, { useEffect, useState } from 'react';
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
        tex.minFilter = THREE.LinearFilter;
        setCustomTexture(tex);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [backdrop]);

  // Set scene.background — renders the texture screen-filling with zero distortion,
  // no geometry needed, behind all 3D objects, visible from any look direction.
  // This is the canonical Three.js way to display a background image.
  useEffect(() => {
    if (backdrop === 'custom-image' && customTexture) {
      scene.background = customTexture;
    } else {
      // Restore opaque dark background when not using custom image
      scene.background = new THREE.Color(0x050505);
    }

    return () => {
      scene.background = new THREE.Color(0x050505);
    };
  }, [backdrop, customTexture, scene]);

  // Nothing to render — scene.background handles it all
  return null;
};
