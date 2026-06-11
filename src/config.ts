import { pathToFileURL } from 'url';
import { resolve } from 'path';

export interface RouteMapping {
  pattern: string;
  route: string | null;
}

export interface DevLensConfig {
  devServerUrl: string;
  routes: RouteMapping[];
  defaultViewport?: { width: number; height: number };
  hmrDebounceMs?: number;
}

const defaults: Partial<DevLensConfig> = {
  defaultViewport: { width: 1280, height: 900 },
  hmrDebounceMs: 150,
};

export async function loadConfig(cwd = process.cwd()): Promise<DevLensConfig> {
  const candidates = [
    resolve(cwd, 'devlens.config.js'),
    resolve(cwd, 'devlens.config.ts'),
  ];

  for (const configPath of candidates) {
    try {
      const mod = await import(pathToFileURL(configPath).href);
      return { ...defaults, ...mod.default } as DevLensConfig;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND') continue;
      // Config exists but failed to parse/execute — surface the error
      console.error(`[devlens] Failed to load ${configPath}:`, err);
    }
  }

  console.warn('[devlens] No devlens.config.js found — using defaults (routes: []). Run "npx devlens-mcp init" to create one.');
  return {
    ...defaults,
    devServerUrl: 'http://localhost:5173',
    routes: [],
  } as DevLensConfig;
}
