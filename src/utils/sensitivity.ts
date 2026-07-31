export type GameEngine = 'valorant' | 'cs2' | 'overwatch' | 'apex';

export interface SensitivityProfile {
  sensitivity: number;
  dpi: number;
  engine: GameEngine;
  fov: number; // horizontal FOV degrees
  invertY: boolean;
  rawInput: boolean;
}

// Engine multipliers: base yaw per count in degrees
const ENGINE_YAW_DEGREES: Record<GameEngine, number> = {
  cs2: 0.022,
  valorant: 0.07,
  overwatch: 0.0066,
  apex: 0.022,
};

/**
 * Calculates distance in centimeters to execute a full 360-degree rotation.
 * Formula: (360 / (sensitivity * engine_yaw)) * (2.54 / DPI)
 */
export function calculateCm360(sens: number, dpi: number, engine: GameEngine = 'valorant'): number {
  if (!sens || !dpi) return 0;
  const yaw = ENGINE_YAW_DEGREES[engine];
  const degreesPerCount = sens * yaw;
  const countsPer360 = 360 / degreesPerCount;
  const inchesPer360 = countsPer360 / dpi;
  const cmPer360 = inchesPer360 * 2.54;
  return Math.round(cmPer360 * 10) / 10;
}

/**
 * Converts a given cm/360 back to game sensitivity
 */
export function calculateSensFromCm360(cm360: number, dpi: number, engine: GameEngine = 'valorant'): number {
  if (!cm360 || !dpi) return 1;
  const inchesPer360 = cm360 / 2.54;
  const countsPer360 = inchesPer360 * dpi;
  const degreesPerCount = 360 / countsPer360;
  const sens = degreesPerCount / ENGINE_YAW_DEGREES[engine];
  return Math.round(sens * 1000) / 1000;
}

/**
 * Converts mouse movement delta (dx, dy) to radians of yaw & pitch in the 3D camera space
 */
export function convertDeltaToRadians(
  dx: number,
  dy: number,
  sens: number,
  _dpi: number,
  engine: GameEngine = 'valorant',
  invertY = false
): { yawDelta: number; pitchDelta: number } {
  const yawDeg = ENGINE_YAW_DEGREES[engine] * sens;
  // Convert degrees to radians per mouse count delta
  const radPerCount = (yawDeg * Math.PI) / 180;

  const yawDelta = -dx * radPerCount;
  const pitchDelta = (invertY ? dy : -dy) * radPerCount;

  return { yawDelta, pitchDelta };
}
