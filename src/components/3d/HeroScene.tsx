import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getAllScenarios } from '../../utils/scenarios';
import { soundManager } from '../../utils/audio';
import { ChevronRight } from 'lucide-react';

interface SpatialNodeData {
  key: string;
  type: 'menu' | 'scenario';
  title: string;
  subtitle?: string;
  category?: string;
  difficulty?: string;
  duration?: number;
  position: [number, number, number];
  scenarioId?: string;
  menuKey?: string;
}

interface SpatialMenuControllerProps {
  mode: 'main-menu' | 'drill-select';
  activeCategory: string;
  isPointerLocked: boolean;
  onLockOnNode: (key: string | null, data?: SpatialNodeData | null) => void;
  onSelectMenuKey: (key: string) => void;
  onSelectScenarioId: (id: string) => void;
}

const AmbientParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  const [positions, colors] = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const accentHex = new THREE.Color(themeAccentColor);
    const whiteHex = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const mixCol = Math.random() > 0.35 ? accentHex : whiteHex;
      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;
    }
    return [pos, col];
  }, [themeAccentColor]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.025;
      pointsRef.current.rotation.x = Math.sin(t * 0.04) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

const SpatialMenuController: React.FC<SpatialMenuControllerProps> = ({
  mode,
  activeCategory,
  isPointerLocked,
  onLockOnNode,
  onSelectMenuKey,
  onSelectScenarioId,
}) => {
  const { camera, raycaster, scene } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const activeLockRef = useRef<string | null>(null);

  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';
  const targetShapeConfig = useSettingsStore((s) => s.targetShapeConfig);
  const targetColor = useSettingsStore((s) => s.targetColor) || themeAccentColor;

  const allScenarios = useMemo(() => getAllScenarios(), []);

  // Filtered scenarios for drill-select mode
  const filteredScenarios = useMemo(() => {
    return allScenarios.filter(
      (sc) => activeCategory === 'all' || sc.category === activeCategory
    );
  }, [allScenarios, activeCategory]);

  // Construct 3D Spatial Nodes
  const spatialNodes: SpatialNodeData[] = useMemo(() => {
    if (mode === 'main-menu') {
      return [
        {
          key: 'menu-drill-select',
          type: 'menu',
          title: 'SELECT DRILL',
          subtitle: 'BROWSE DRILLS & QUICK START',
          position: [0, 0.3, -4.2],
          menuKey: 'drill-select',
        },
        {
          key: 'menu-library',
          type: 'menu',
          title: 'DRILL LIBRARY',
          subtitle: 'ALL SCENARIOS & ROUTINES',
          position: [-3.4, 0.7, -4.6],
          menuKey: 'library',
        },
        {
          key: 'menu-dashboard',
          type: 'menu',
          title: 'ANALYTICS',
          subtitle: 'STATS & PERFORMANCE',
          position: [3.4, 0.7, -4.6],
          menuKey: 'dashboard',
        },
        {
          key: 'menu-settings',
          type: 'menu',
          title: 'OPTIONS',
          subtitle: 'SENSITIVITY & CROSSHAIR',
          position: [0, -2.2, -4.5],
          menuKey: 'settings',
        },
      ];
    } else {
      // 3D Grid Arrangement for Drill Select Mode
      const cols = 4;
      return filteredScenarios.slice(0, 16).map((sc, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = (col - 1.5) * 2.2;
        const y = 1.8 - row * 1.4;
        const z = -5.0 + Math.abs(col - 1.5) * 0.18;
        return {
          key: `scenario-${sc.id}`,
          type: 'scenario',
          title: sc.name,
          subtitle: sc.description,
          category: sc.category.toUpperCase(),
          difficulty: sc.difficulty,
          duration: sc.durationSeconds,
          position: [x, y, z] as [number, number, number],
          scenarioId: sc.id,
        };
      });
    }
  }, [mode, filteredScenarios]);

  // Handle Free-Look Mouse Input when Pointer Lock is Active
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked) return;
      const sensitivity = 0.0018;
      targetYawRef.current -= e.movementX * sensitivity;
      targetPitchRef.current -= e.movementY * sensitivity;

      // Constrain yaw & pitch ranges
      targetYawRef.current = Math.max(-0.65, Math.min(0.65, targetYawRef.current));
      targetPitchRef.current = Math.max(-0.4, Math.min(0.4, targetPitchRef.current));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerLocked]);

  // Reset camera target when unlocked
  useEffect(() => {
    if (!isPointerLocked) {
      targetYawRef.current = 0;
      targetPitchRef.current = 0;
    }
  }, [isPointerLocked]);

  // Raycasting & Camera Frame Loop
  useFrame(() => {

    // Damped smooth camera rotation towards targetYaw & targetPitch
    yawRef.current += (targetYawRef.current - yawRef.current) * 0.15;
    pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.15;

    camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ');

    // Perform screen-center raycasting (Vector2(0, 0))
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let lockedKey: string | null = null;
    let lockedData: SpatialNodeData | null = null;

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData && obj.userData.nodeKey) {
          lockedKey = obj.userData.nodeKey;
          lockedData = spatialNodes.find((n) => n.key === lockedKey) || null;
          break;
        }
        obj = obj.parent;
      }
      if (lockedKey) break;
    }

    // Play lock-on audio feedback when lock-on target transitions
    if (lockedKey !== activeLockRef.current) {
      activeLockRef.current = lockedKey;
      if (lockedKey) {
        soundManager.playHover();
      }
      onLockOnNode(lockedKey, lockedData);
    }
  });

  const handleNodeClick = (node: SpatialNodeData) => {
    soundManager.playClick();
    if (node.type === 'menu' && node.menuKey) {
      onSelectMenuKey(node.menuKey);
    } else if (node.type === 'scenario' && node.scenarioId) {
      onSelectScenarioId(node.scenarioId);
    }
  };

  const { shape, wireframe, emissiveIntensity } = targetShapeConfig;

  return (
    <group>
      {spatialNodes.map((node) => {
        const isLockedOn = activeLockRef.current === node.key;
        const isMainMenuHero = node.key === 'menu-drill-select';
        const nodeRadius = isMainMenuHero ? 0.95 : node.type === 'menu' ? 0.65 : 0.42;

        return (
          <group
            key={node.key}
            position={node.position}
            userData={{ nodeKey: node.key }}
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(node);
            }}
          >
            {/* 3D Mesh Target Geometry */}
            <mesh>
              {shape === 'torus' ? (
                <torusGeometry args={[nodeRadius * 0.8, nodeRadius * 0.3, 16, 32]} />
              ) : shape === 'cube' ? (
                <boxGeometry args={[nodeRadius * 1.3, nodeRadius * 1.3, nodeRadius * 1.3]} />
              ) : shape === 'octahedron' ? (
                <octahedronGeometry args={[nodeRadius * 1.2, 0]} />
              ) : shape === 'cylinder' ? (
                <cylinderGeometry args={[nodeRadius * 0.8, nodeRadius * 0.8, nodeRadius * 1.5, 32]} />
              ) : shape === 'cone' ? (
                <coneGeometry args={[nodeRadius, nodeRadius * 1.7, 32]} />
              ) : shape === 'capsule' ? (
                <capsuleGeometry args={[nodeRadius * 0.7, nodeRadius * 1.0, 16, 32]} />
              ) : (
                <sphereGeometry args={[nodeRadius, 32, 32]} />
              )}
              <meshStandardMaterial
                color={isLockedOn ? themeAccentColor : targetColor}
                wireframe={wireframe}
                roughness={0.15}
                metalness={0.3}
                emissive={isLockedOn ? themeAccentColor : targetColor === '#ffffff' ? themeAccentColor : targetColor}
                emissiveIntensity={isLockedOn ? 0.95 : emissiveIntensity ?? 0.6}
              />
            </mesh>

            {/* Tactical 3D HUD Billboard Label */}
            <Html
              center
              position={[0, -nodeRadius - 0.45, 0]}
              distanceFactor={8}
              zIndexRange={[100, 0]}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node);
                }}
                className={`pointer-events-auto select-none transition-all duration-200 cursor-pointer flex flex-col items-center text-center p-2.5 rounded-[12px] backdrop-blur-md border ${
                  isLockedOn
                    ? 'bg-[#0d0d0d]/95 border-accent text-white scale-105 shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.35)] ring-1 ring-accent'
                    : 'bg-[#0d0d0d]/80 border-[#262626] text-neutral-300 hover:border-accent/60'
                }`}
                style={{ width: node.type === 'scenario' ? '180px' : '200px' }}
              >
                {/* Lock-on reticle header bracket */}
                <div className="flex items-center justify-between w-full text-[9px] font-mono font-bold tracking-widest uppercase mb-1">
                  <span className={isLockedOn ? 'text-accent' : 'text-neutral-500'}>
                    {isLockedOn ? '[ TARGET LOCKED ]' : '▪ READY'}
                  </span>
                  {node.category && (
                    <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                      {node.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`font-display font-extrabold text-sm tracking-wide uppercase leading-tight ${
                    isLockedOn ? 'text-accent' : 'text-white'
                  }`}
                >
                  {node.title}
                </h3>

                {/* Subtitle / Details */}
                {node.subtitle && node.type === 'menu' && (
                  <p className="font-mono text-[9px] text-neutral-400 mt-1 uppercase tracking-wider">
                    {node.subtitle}
                  </p>
                )}

                {node.type === 'scenario' && (
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-neutral-400 font-bold">
                    <span>{node.difficulty}</span>
                    <span>•</span>
                    <span>{node.duration}S</span>
                  </div>
                )}

                {/* Action Prompt when locked on */}
                {isLockedOn && (
                  <div className="mt-2 text-[9px] font-mono font-extrabold text-[#0d0d0d] bg-accent px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    CLICK TO SELECT <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Grid Floor */}
      <gridHelper args={[26, 26, themeAccentColor, '#262626']} position={[0, -4, 0]} />
    </group>
  );
};

interface HeroSceneProps {
  className?: string;
  mode?: 'main-menu' | 'drill-select';
  activeCategory?: string;
  isPointerLocked?: boolean;
  onLockOnNode?: (key: string | null, data?: SpatialNodeData | null) => void;
  onSelectMenuKey?: (key: string) => void;
  onSelectScenarioId?: (id: string) => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  className,
  mode = 'main-menu',
  activeCategory = 'all',
  isPointerLocked = false,
  onLockOnNode = () => {},
  onSelectMenuKey = () => {},
  onSelectScenarioId = () => {},
}) => {
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  return (
    <div
      className={
        className ||
        'w-full h-full min-h-[420px] rounded-[12px] overflow-hidden bg-[#0d0d0d] relative select-none'
      }
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 55 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color={themeAccentColor} />
        <SpatialMenuController
          mode={mode}
          activeCategory={activeCategory}
          isPointerLocked={isPointerLocked}
          onLockOnNode={onLockOnNode}
          onSelectMenuKey={onSelectMenuKey}
          onSelectScenarioId={onSelectScenarioId}
        />
        <AmbientParticles />
      </Canvas>
    </div>
  );
};
