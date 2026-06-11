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
  const configPath = resolve(cwd, 'devlens.config.ts');
  try {
    const jsPath = configPath.replace(/\.ts$/, '.js');
    const mod = await import(pathToFileURL(jsPath).href);
    return { ...defaults, ...mod.default } as DevLensConfig;
  } catch {
    return {
      ...defaults,
      devServerUrl: 'http://localhost:5173',
      routes: [],
    } as DevLensConfig;
  }
}
