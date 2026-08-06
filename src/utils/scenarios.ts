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
  pathType?: 'linear' | 'sinusoidal' | 'erratic' | 'figure8';
  directionChangeIntervalMs?: number;
  speedVariance?: number;
  enableJukes?: boolean;
  maxHp?: number;
  damagePerHit?: number;
  fireMode?: 'semi' | 'auto';
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
    description: 'Continuous target floating along dynamic Lissajous & sinusoidal trajectories. Multi-hit target requiring 3 damage points.',
    difficulty: 'Beginner',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.55,
    targetSpeed: 2.3,
    maxHp: 3,
    damagePerHit: 1,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.5 },
    pathType: 'sinusoidal',
    directionChangeIntervalMs: 1200,
    speedVariance: 0.35,
    tags: ['SMOOTHNESS', 'CONTINUOUS', 'SINUSOIDAL', 'MULTI-HIT'],
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
    description: 'Single high-tempo target with accessible 750ms window. Master rhythm and timing under pressure.',
    difficulty: 'Intermediate',
    durationSeconds: 45,
    targetCount: 1,
    targetRadius: 0.40,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.5 },
    hasLifetimeLimit: true,
    lifetimeMs: 750,
    tags: ['BURST', 'TIMING', 'FLICK PAIR'],
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
    description: 'Targets progressively shrink as your streak increases (from 0.35 down to 0.12). Rewards sustained accuracy under pressure.',
    difficulty: 'Advanced',
    durationSeconds: 60,
    targetCount: 3,
    targetRadius: 0.35,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 5.5 },
    tags: ['ESCALATING', 'DYNAMIC SHRINKING', 'ACCURACY'],
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
  {
    id: 'gridshot-wide-grid',
    name: 'GRIDSHOT // WIDE SPAN',
    category: 'clicking',
    description: '4 static targets distributed across wide horizontal & vertical angles. Trains wide-angle flicks and large crosshair resets.',
    difficulty: 'Advanced',
    durationSeconds: 60,
    targetCount: 4,
    targetRadius: 0.42,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.0 },
    tags: ['WIDE SPAN', 'LARGE FLICK', 'SPEED'],
    recommendedCm360: '20-30 cm',
    iconName: 'Grid',
  },
  {
    id: 'chaos-switch',
    name: 'CHAOS // HIGH-TEMPO SWITCH',
    category: 'switching',
    description: '4 active targets spawning & expiring on a 650ms window. High-density target switching for clutch multi-kills.',
    difficulty: 'Advanced',
    durationSeconds: 45,
    targetCount: 4,
    targetRadius: 0.40,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 2.4 },
    hasLifetimeLimit: true,
    lifetimeMs: 650,
    tags: ['CHAOS', 'HIGH TEMPO', 'SWITCHING'],
    recommendedCm360: '20-30 cm',
    iconName: 'Zap',
  },
  {
    id: 'figure8-tracking',
    name: 'FIGURE-8 // SMOOTH TRACKING',
    category: 'tracking',
    description: 'Continuous target tracing complex Lissajous figure-8 3D loops. Builds smooth rotational tracking and velocity matching.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.5,
    targetSpeed: 2.7,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.2 },
    pathType: 'figure8',
    directionChangeIntervalMs: 800,
    speedVariance: 0.4,
    tags: ['FIGURE-8', 'SMOOTHNESS', 'LISSAJOUS'],
    recommendedCm360: '30-45 cm',
    iconName: 'Move',
  },
  {
    id: 'reflex-chain-endurance',
    name: 'REFLEX // ENDURANCE CHAIN',
    category: 'switching',
    description: 'Extended 90-second endurance chain with 600ms lifetime target windows. Train sustained reaction consistency under fatigue.',
    difficulty: 'Advanced',
    durationSeconds: 90,
    targetCount: 1,
    targetRadius: 0.42,
    targetSpeed: 0,
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.0 },
    hasLifetimeLimit: true,
    lifetimeMs: 600,
    tags: ['ENDURANCE', 'SUSTAINED', 'REFLEX'],
    recommendedCm360: '25-35 cm',
    iconName: 'Clock',
  },
  {
    id: 'smoothswitch-heavy',
    name: 'SMOOTHSWITCH // SUSTAINED AUTO',
    category: 'switching',
    description: 'Moving 3-HP targets requiring continuous auto-fire. Track, bleed HP, and transfer seamlessly from target to target.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 3,
    targetRadius: 0.42,
    targetSpeed: 2.2,
    maxHp: 3,
    damagePerHit: 1,
    fireMode: 'auto',
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.5 },
    pathType: 'linear',
    tags: ['SMOOTHSWITCH', 'SUSTAINED AUTO', 'MULTI-HIT'],
    recommendedCm360: '25-40 cm',
    iconName: 'Layers',
  },
  {
    id: 'tracking-hpbleed',
    name: 'HP BLEED // TRACKING',
    category: 'tracking',
    description: 'Heavy 5-HP tracking target with erratic movement. Sustain auto-fire on target while the HP bar depletes. Punishes tracking breaks.',
    difficulty: 'Intermediate',
    durationSeconds: 60,
    targetCount: 1,
    targetRadius: 0.50,
    targetSpeed: 2.8,
    maxHp: 5,
    damagePerHit: 1,
    fireMode: 'auto',
    arenaType: '1-wall',
    playerPosition: { x: 0, y: 2.2, z: 3.5 },
    pathType: 'erratic',
    directionChangeIntervalMs: 700,
    speedVariance: 0.5,
    enableJukes: true,
    tags: ['TRACKING', 'HP BLEED', 'MULTI-HIT', 'AUTO-FIRE'],
    recommendedCm360: '30-45 cm',
    iconName: 'Move',
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
  'airstrafe-tracking',
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
