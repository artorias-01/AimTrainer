import { getStoredCustomScenarios } from './storage';

export type ScenarioCategory = 'clicking' | 'tracking' | 'switching' | 'precision';

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface ScenarioDef {
  id: string;
  name: string;
  category: ScenarioCategory;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  durationSeconds: number;
  targetCount: number;
  targetRadius: number;
  targetSpeed: number;
  arenaType: '1-wall' | '6-wall' | 'open-arena';
  playerPosition: PlayerPosition;
  hasLifetimeLimit?: boolean;
  lifetimeMs?: number;
  pathType?: 'linear' | 'sinusoidal' | 'erratic';
  directionChangeIntervalMs?: number;
  speedVariance?: number;
  enableJukes?: boolean;
  tags: string[];
  recommendedCm360: string;
  iconName: string;
  isCustom?: boolean;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  description: string;
  drillIds: string[];
  isBuiltIn?: boolean;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'gridshot-classic',
    name: 'GRIDSHOT // CLASSIC',
    category: 'clicking',
    description: '3 static targets on a front wall. Click 1, it instantly respawns in a new location. Pure speed & spatial rhythm.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 3,
    targetRadius: 0.45,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 1.8 },
    tags: ['FLICKING', 'SPEED', 'SPATIAL'],
    recommendedCm360: '25-35 cm',
    iconName: 'Grid',
  },
  {
    id: 'flickshot-pro',
    name: 'FLICKSHOT // PRO',
    category: 'clicking',
    description: 'Targets spawn across wide angular spans and varying depths. Sharp flick resets and crosshair re-centering.',
    difficulty: 'Advanced',
    durationSeconds: 60,
    targetCount: 4,
    targetRadius: 0.4,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.8 },
    tags: ['WIDE FLICK', 'RE-CENTERING', 'ANGULAR'],
    recommendedCm360: '20-30 cm',
    iconName: 'Zap',
  },
  {
    id: 'tracking-sphere',
    name: 'SPHERE // TRACKING',
    category: 'tracking',
    description: 'Continuous target floating along dynamic Lissajous & sinusoidal trajectories. Smooth, approachable baseline tracking.',
    difficulty: 'Beginner',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.55,
    targetSpeed: 2.3,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.5 },
    pathType: 'sinusoidal',
    directionChangeIntervalMs: 1200,
    speedVariance: 0.35,
    tags: ['SMOOTHNESS', 'CONTINUOUS', 'SINUSOIDAL'],
    recommendedCm360: '30-45 cm',
    iconName: 'Move',
  },
  {
    id: 'micro-flicks',
    name: 'MICRO // PRECISION',
    category: 'precision',
    description: 'Compact sphere targets positioned close to center. Requires sub-pixel accuracy and minimal wrist strain.',
    difficulty: 'Pro',
    durationSeconds: 45,
    targetCount: 3,
    targetRadius: 0.25,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 4.8 },
    tags: ['MICRO', 'HEADSHOT', 'SUB-PIXEL'],
    recommendedCm360: '35-50 cm',
    iconName: 'Target',
  },
  {
    id: 'reflex-reactivation',
    name: 'REFLEX // 650MS',
    category: 'switching',
    description: 'Single target with 650ms expiration window. Train immediate reflex activation.',
    difficulty: 'Advanced',
    durationSeconds: 45,
    targetCount: 1,
    targetRadius: 0.4,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.2 },
    hasLifetimeLimit: true,
    lifetimeMs: 650,
    tags: ['REACTION', 'TIMED WINDOW', 'REFLEX'],
    recommendedCm360: '25-35 cm',
    iconName: 'Clock',
  },
  {
    id: 'strafe-tracking',
    name: 'STRAFE // HORIZONTAL',
    category: 'tracking',
    description: 'Target moves along horizontal wall plane, rapidly changing direction, speed variance, and micro-jukes. Essential for FPS duel tracking.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.45,
    targetSpeed: 2.9,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.0 },
    pathType: 'erratic',
    directionChangeIntervalMs: 600,
    speedVariance: 0.5,
    enableJukes: true,
    tags: ['STRAFE', 'READING', 'JUKES', 'UNPREDICTABLE'],
    recommendedCm360: '30-40 cm',
    iconName: 'Sliders',
  },
  {
    id: 'six-wall-broad',
    name: '360° // 6-WALL ARENA',
    category: 'clicking',
    description: 'Full 360-degree room layout. Targets spawn behind, above, and around the player. Tests spatial orientation & 180° turns.',
    difficulty: 'Pro',
    durationSeconds: 60,
    targetCount: 5,
    targetRadius: 0.45,
    targetSpeed: 0,
    arenaType: '6-wall',
    playerPosition: { x: 0, y: 2.2, z: 0.0 },
    tags: ['360 DEGREE', 'SPATIAL', 'ROOM'],
    recommendedCm360: '20-30 cm',
    iconName: 'Maximize',
  },
  {
    id: 'gridshot-small-grid',
    name: 'GRIDSHOT // SMALL GRID',
    category: 'precision',
    description: 'High-density small target grid (0.22 radius). Perfect for fine-motor control and elite clicking accuracy.',
    difficulty: 'Pro',
    durationSeconds: 60,
    targetCount: 4,
    targetRadius: 0.22,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 4.2 },
    tags: ['ULTRA PRECISION', 'SMALL GRID', 'CLUTCH'],
    recommendedCm360: '35-50 cm',
    iconName: 'Grid',
  },
  {
    id: 'burst-timing-click',
    name: 'BURST // TIMING CLICK',
    category: 'switching',
    description: 'Single high-tempo target with 500ms window. Master rhythm and timing under pressure.',
    difficulty: 'Pro',
    durationSeconds: 45,
    targetCount: 1,
    targetRadius: 0.35,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.5 },
    hasLifetimeLimit: true,
    lifetimeMs: 500,
    tags: ['BURST', 'HIGH FREQUENCY', 'FLICK PAIR'],
    recommendedCm360: '20-30 cm',
    iconName: 'Zap',
  },
  {
    id: 'airstrafe-tracking',
    name: 'AIRSTRAFE // 3D TRACKING',
    category: 'tracking',
    description: 'Target executes high-verticality air-strafes and erratic 3D arcs. Simulates movement shooters (Apex, Overwatch, Hyperscape).',
    difficulty: 'Advanced',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.48,
    targetSpeed: 3.6,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.8 },
    pathType: 'erratic',
    directionChangeIntervalMs: 500,
    speedVariance: 0.6,
    enableJukes: true,
    tags: ['AIR STRAFE', 'VERTICALITY', 'PRO TRACKING'],
    recommendedCm360: '25-35 cm',
    iconName: 'Move',
  },
  {
    id: 'multi-target-switching',
    name: 'MULTI-TARGET // SWITCHING',
    category: 'switching',
    description: '6 static targets active simultaneously. Eliminating 1 instantly spawns another. Tests target-switching rhythm and multi-kill speed.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 6,
    targetRadius: 0.42,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.2 },
    tags: ['SWITCHING', 'KOVAAKS STYLE', 'MULTI-TARGET'],
    recommendedCm360: '25-35 cm',
    iconName: 'Zap',
  },
  {
    id: 'long-range-sniper',
    name: 'LONG RANGE // PRECISION',
    category: 'precision',
    description: 'Micro-sized targets (0.18 radius) at extended distance. Train sniper first-bullet accuracy & pixel clicks from far back.',
    difficulty: 'Pro',
    durationSeconds: 60,
    targetCount: 3,
    targetRadius: 0.18,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 7.2 },
    tags: ['LONG RANGE', 'SNIPER', 'PIXEL CLICK'],
    recommendedCm360: '40-60 cm',
    iconName: 'Target',
  },
  {
    id: 'escalating-precision',
    name: 'ESCALATING // PRECISION',
    category: 'precision',
    description: 'Compact micro targets at high distance requiring continuous precision. Tests sub-pixel click placement under pressure.',
    difficulty: 'Advanced',
    durationSeconds: 60,
    targetCount: 4,
    targetRadius: 0.2,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 5.5 },
    tags: ['ESCALATING', 'SHRINKING', 'ACCURACY'],
    recommendedCm360: '35-50 cm',
    iconName: 'Target',
  },
  {
    id: 'accuracy-gauntlet-timed',
    name: 'ACCURACY // GAUNTLET',
    category: 'switching',
    description: 'Ultra-fast 450ms expiration window, one target at a time. Rewards pure reaction speed and clutch flicking.',
    difficulty: 'Pro',
    durationSeconds: 45,
    targetCount: 1,
    targetRadius: 0.38,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.6 },
    hasLifetimeLimit: true,
    lifetimeMs: 450,
    tags: ['GAUNTLET', 'ACCURACY', '450MS'],
    recommendedCm360: '20-30 cm',
    iconName: 'Clock',
  },
];

export const PRESET_ROUTINES: WarmupRoutine[] = [
  {
    id: 'routine-5min-general',
    name: '5-MINUTE GENERAL WARMUP',
    description: 'Balanced warmup chaining flicking, precision, and tracking before competitive play.',
    drillIds: ['gridshot-classic', 'flickshot-pro', 'tracking-sphere'],
    isBuiltIn: true,
  },
  {
    id: 'routine-reflex-timing',
    name: 'REFLEX & TIMING INTENSIVE',
    description: 'High-tempo reflex activation drill sequence for clutch timing under pressure.',
    drillIds: ['burst-timing-click', 'reflex-reactivation', 'accuracy-gauntlet-timed'],
    isBuiltIn: true,
  },
  {
    id: 'routine-pure-precision',
    name: 'PURE PRECISION & CONTROL',
    description: 'Micro-flicking and long-range pixel precision for tactical shooter headshots.',
    drillIds: ['micro-flicks', 'gridshot-small-grid', 'long-range-sniper'],
    isBuiltIn: true,
  },
];

export const BENCHMARK_SEQUENCE_IDS = [
  'gridshot-classic',
  'strafe-tracking',
  'micro-flicks',
  'multi-target-switching',
];

export function getAllScenarios(): ScenarioDef[] {
  const custom = getStoredCustomScenarios();
  return [...SCENARIOS, ...custom];
}

export function getScenarioById(id: string): ScenarioDef {
  const all = getAllScenarios();
  return all.find((s) => s.id === id) || SCENARIOS[0];
}

/* Deterministic Daily Challenge Picker */
export function getDailyChallengeScenario(dateStr?: string): ScenarioDef {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash << 5) - hash + targetDate.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SCENARIOS.length;
  return SCENARIOS[index];
}
