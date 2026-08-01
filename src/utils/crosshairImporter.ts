import type { CrosshairConfig } from './storage';
import { migrateCrosshairConfig } from './storage';

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

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsedJson = JSON.parse(trimmed);
      if (parsedJson && typeof parsedJson === 'object') {
        return migrateCrosshairConfig(parsedJson);
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
