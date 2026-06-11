import { minimatch } from 'minimatch';
import type { DevLensConfig } from '../config.js';

export function resolveRoute(filePath: string, config: DevLensConfig): string | null {
  const normalized = filePath.replace(/\\/g, '/');
  for (const mapping of config.routes) {
    if (minimatch(normalized, mapping.pattern, { matchBase: false })) {
      return mapping.route;
    }
  }
  return null;
}
