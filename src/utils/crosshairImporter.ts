import type { CrosshairConfig } from './storage';
import { DEFAULT_CROSSHAIR } from './storage';

/**
 * Validates whether an input string is a valid 3-digit or 6-digit hex color code.
 * Accepts with or without leading '#' (e.g., '#39FF14', '39ff14', '#FFF', 'fff').
 */
export function isValidHexColor(hex: string): boolean {
  if (!hex) return false;
  const clean = hex.trim();
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean);
}

/**
 * Normalizes a hex color string into standard uppercase 6-digit format with leading '#'
 */
export function normalizeHexColor(hex: string): string {
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  return `#${clean.toUpperCase()}`;
}

/**
 * Parses generic JSON crosshair configuration blobs for import
 */
export function parseGenericCrosshairCode(input: string): CrosshairConfig | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('{') || trimmed.endsWith('}')) {
      const parsedJson = JSON.parse(trimmed);
      if (parsedJson && typeof parsedJson === 'object') {
        const mappedConfig: Partial<CrosshairConfig> = {};
        if (parsedJson.type) mappedConfig.type = parsedJson.type;
        if (parsedJson.color && isValidHexColor(parsedJson.color)) {
          mappedConfig.color = normalizeHexColor(parsedJson.color);
        }
        if (parsedJson.size || parsedJson.length) {
          mappedConfig.size = Math.min(20, Math.max(2, parsedJson.size || parsedJson.length));
        }
        if (parsedJson.thickness) mappedConfig.thickness = Math.min(6, Math.max(1, parsedJson.thickness));
        if (parsedJson.gap || parsedJson.offset) mappedConfig.gap = Math.min(12, Math.max(0, parsedJson.gap || parsedJson.offset));
        if (parsedJson.dotSize) mappedConfig.dotSize = parsedJson.dotSize;
        if (parsedJson.opacity !== undefined) mappedConfig.opacity = parsedJson.opacity;
        if (parsedJson.outline !== undefined) mappedConfig.outline = parsedJson.outline;

        return { ...DEFAULT_CROSSHAIR, ...mappedConfig };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function exportCrosshairConfigToJSON(config: CrosshairConfig): string {
  return JSON.stringify(config, null, 2);
}
