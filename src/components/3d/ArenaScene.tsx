import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { convertDeltaToRadians } from '../../utils/sensitivity';
import { TargetSphere } from './TargetSphere';
import { ArenaBackdrop3D } from './ArenaBackdrop';
import { getCustomBackgroundImage } from '../../utils/db';

interface ArenaControllerProps {
  onPointerLockChange: (isLocked: boolean) => void;
  isTouchDevice: boolean;
}

const ArenaController: React.FC<ArenaControllerProps> = ({ onPointerLockChange, isTouchDevice }) => {
  const { camera, raycaster, scene } = useThree();
  const {
    activeScenario,
    status,
    targets,
    registerHit,
    registerMiss,
    recordTrackingTick,
    updateTargetPositions,
    tickSecond,
  } = useGameStore();
  const { settings, arenaBackdrop, arenaColor, themeAccentColor } = useSettingsStore();

  const wallColor = arenaColor || (arenaBackdrop === 'gradient-room' ? '#181216' : '#121212');

  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);
  const lastSecondTickRef = useRef<number>(0);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Set FOV and position camera based on activeScenario.playerPosition
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = settings.fov;
      const spawn = activeScenario.playerPosition || { x: 0, y: 2.2, z: 3.5 };
      camera.position.set(spawn.x, spawn.y, spawn.z);
      camera.updateProjectionMatrix();
    }
  }, [camera, settings.fov, activeScenario]);

  // Reset camera starting position and look angle on scenario change or session restart
  useEffect(() => {
    if (camera && activeScenario.playerPosition) {
      const spawn = activeScenario.playerPosition;
      camera.position.set(spawn.x, spawn.y, spawn.z);
      yawRef.current = 0;
      pitchRef.current = 0;
      camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0, 'YXZ'));
    }
  }, [activeScenario.id, camera, activeScenario.playerPosition, status]);

  // Pointer lock change listener
  useEffect(() => {
    const handleLockChange = () => {
      const locked = document.pointerLockElement !== null;
      isLockedRef.current = locked;
      onPointerLockChange(locked);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [onPointerLockChange]);

  // Mouse movement input handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current || status !== 'playing') return;

      const dx = e.movementX;
      const dy = e.movementY;

      const { yawDelta, pitchDelta } = convertDeltaToRadians(
        dx,
        dy,
        settings.sensitivity,
        settings.dpi,
        settings.engine,
        settings.invertY
      );

      yawRef.current += yawDelta;
      pitchRef.current += pitchDelta;

      // Clamp pitch to prevent camera flips (-85 deg to +85 deg)
      const maxPitch = (85 * Math.PI) / 180;
      pitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchRef.current));

      // Apply Euler rotation (order YXZ)
      const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, settings, status]);

  // Touch drag-to-look camera handler for touch devices
  useEffect(() => {
    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (status !== 'playing' || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!lastTouchRef.current) {
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        return;
      }

      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

      const { yawDelta, pitchDelta } = convertDeltaToRadians(
        dx * 2.2,
        dy * 2.2,
        settings.sensitivity,
        settings.dpi,
        settings.engine,
        settings.invertY
      );

      yawRef.current += yawDelta;
      pitchRef.current += pitchDelta;

      const maxPitch = (85 * Math.PI) / 180;
      pitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchRef.current));

      const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    };

    const handleTouchEnd = () => {
      lastTouchRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, isTouchDevice, settings, status]);

  // Click Raycasting for Shot Hit Detection (Disabled for tracking scenarios)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (status !== 'playing') return;
      if (!isLockedRef.current && !isTouchDevice) return;
      if (e.button !== 0 && !isTouchDevice) return; // Left click only

      if (activeScenario.category === 'tracking') return;

      // Raycast from camera center (0, 0)
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Intersect with mesh targets in scene
      const intersects = raycaster.intersectObjects(scene.children, true);

      let hitTargetId: string | null = null;
      let hitPointX = 0;
      let hitPointY = 0;

      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.userData && obj.userData.targetId) {
            hitTargetId = obj.userData.targetId;
            hitPointX = hit.point.x;
            hitPointY = hit.point.y;
            break;
          }
          obj = obj.parent;
        }
        if (hitTargetId) break;
      }

      if (hitTargetId) {
        registerHit(hitTargetId, hitPointX, hitPointY);
      } else {
        registerMiss(0, 0);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [activeScenario.category, camera, isTouchDevice, raycaster, registerHit, registerMiss, scene, status]);

  // Main Render Frame Loop
  useFrame((_, delta) => {
    if (status !== 'playing') return;

    const now = Date.now();
    // Tick second timer
    if (now - lastSecondTickRef.current >= 1000) {
      lastSecondTickRef.current = now;
      tickSecond();
    }

    // Update target movement for tracking/strafe tasks
    updateTargetPositions(delta);

    // If tracking scenario, calculate precise continuous time-on-target
    if (activeScenario.category === 'tracking') {
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const isTargetHit = intersects.some((hit) => {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.userData && obj.userData.targetId) return true;
          obj = obj.parent;
        }
        return false;
      });

      const frameMs = delta * 1000;
      recordTrackingTick(frameMs, isTargetHit);
    }
  });

  return (
    <group>
      {/* Target Spheres in 3D Space */}
      {targets.map((t) => (
        <group key={t.id} userData={{ targetId: t.id }}>
          <TargetSphere
            id={t.id}
            x={t.x}
            y={t.y}
            z={t.z}
            radius={t.radius}
            vx={t.vx}
            vy={t.vy}
            targetSpeed={activeScenario.targetSpeed}
            pathType={activeScenario.pathType}
            directionChangeIntervalMs={activeScenario.directionChangeIntervalMs}
            speedVariance={activeScenario.speedVariance}
            enableJukes={activeScenario.enableJukes}
            spawnTime={t.spawnTime}
            isTracking={activeScenario.category === 'tracking'}
            currentHp={t.currentHp}
            maxHp={t.maxHp}
            onHit={(targetId, hitX, hitY) => registerHit(targetId, hitX, hitY)}
          />
        </group>
      ))}

      {/* Environment & Backdrop Options */}
      {arenaBackdrop !== 'minimal-void' && (
        <>
          {/* Front Target Wall (Z = -6.5) */}
          <mesh position={[0, 3.2, -6.5]}>
            <planeGeometry args={[22, 10]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>

          {/* Rear Target Wall (Z = +6.5 for 360 6-Wall Mode) */}
          <mesh position={[0, 3.2, 6.5]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[22, 10]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>

          {/* Left Wall (X = -11) */}
          <mesh position={[-11, 3.2, -1.5]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[12, 10]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
          </mesh>

          {/* Right Wall (X = +11) */}
          <mesh position={[11, 3.2, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[12, 10]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
          </mesh>

          {/* Floor with Editorial Grid Lines at Y = 0 */}
          {arenaBackdrop === 'grid-room' && (
            <gridHelper args={[30, 30, themeAccentColor, '#262626']} position={[0, 0, -1.5]} />
          )}

          {/* Ceiling Plane at Y = 7.5 */}
          <mesh position={[0, 7.5, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[22, 12]} />
            <meshStandardMaterial color="#080808" />
          </mesh>
        </>
      )}

      {/* Procedural Cosmic Skyboxes & Custom Image Backdrop */}
      <ArenaBackdrop3D />
    </group>
  );
};

interface ArenaSceneProps {
  onPointerLockChange: (isLocked: boolean) => void;
  onRequestLock: () => void;
  isTouchDevice?: boolean;
}

export const ArenaScene: React.FC<ArenaSceneProps> = ({
  onPointerLockChange,
  onRequestLock,
  isTouchDevice = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeScenario = useGameStore((s) => s.activeScenario);
  const performanceMode = useSettingsStore((s) => s.performanceMode);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const arenaBackdrop = useSettingsStore((s) => s.arenaBackdrop);
  const initialSpawn = activeScenario.playerPosition || { x: 0, y: 2.2, z: 3.5 };

  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (arenaBackdrop !== 'custom-image') {
      setCustomBgUrl(null);
      return;
    }

    let isMounted = true;
    getCustomBackgroundImage().then((url) => {
      if (isMounted && url) {
        setCustomBgUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [arenaBackdrop]);

  const isCustomBg = arenaBackdrop === 'custom-image' && customBgUrl !== null;

  const handleClickCanvas = () => {
    if (containerRef.current && document.pointerLockElement === null && !isTouchDevice) {
      onRequestLock();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClickCanvas}
      className="w-full h-full bg-[#050505] relative cursor-crosshair overflow-hidden"
    >
      {/* CSS Background Layer Behind 3D Canvas */}
      {isCustomBg && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{ backgroundImage: `url(${customBgUrl})` }}
        />
      )}

      {/* Central Contrast Safeguard Vignette Overlay for Target & Crosshair Legibility */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,5,0.65)_100%)]" />

      <Canvas
        camera={{ position: [initialSpawn.x, initialSpawn.y, initialSpawn.z], fov: 103 }}
        dpr={performanceMode ? 1 : [1, 1.5]}
        gl={{ antialias: !performanceMode, powerPreference: 'high-performance', alpha: true }}
        onCreated={({ gl }) => {
          if (isCustomBg) {
            gl.setClearColor(0x000000, 0); // Transparent WebGL context
          } else {
            gl.setClearColor(0x050505, 1); // Opaque background context
          }
        }}
        className="relative z-10 w-full h-full"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[0, 8, 4]} intensity={2.0} color="#ffffff" />
        <pointLight position={[0, 3, -5]} intensity={2.0} color={themeAccentColor} />
        <ArenaController onPointerLockChange={onPointerLockChange} isTouchDevice={isTouchDevice} />
      </Canvas>
    </div>
  );
};
