import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfig } from '../config.js';

// Each test gets a unique temp dir so ESM module cache doesn't bleed across tests
function makeTempDir() {
  const dir = join(tmpdir(), `devlens-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('loadConfig', () => {
  it('loads devlens.config.js and returns routes', async () => {
    const dir = makeTempDir();
    try {
      writeFileSync(
        join(dir, 'devlens.config.js'),
        `export default { devServerUrl: 'http://localhost:3000', routes: [{ pattern: '**/pages/Home.tsx', route: '/' }] };\n`,
      );
      const config = await loadConfig(dir);
      expect(config.devServerUrl).toBe('http://localhost:3000');
      expect(config.routes).toHaveLength(1);
      expect(config.routes[0].route).toBe('/');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('falls back to defaults with empty routes when no config file exists', async () => {
    const dir = makeTempDir();
    try {
      const config = await loadConfig(dir);
      expect(config.routes).toEqual([]);
      expect(config.devServerUrl).toBe('http://localhost:5173');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('merges defaults for missing optional fields', async () => {
    const dir = makeTempDir();
    try {
      writeFileSync(
        join(dir, 'devlens.config.js'),
        `export default { devServerUrl: 'http://localhost:4000', routes: [] };\n`,
      );
      const config = await loadConfig(dir);
      expect(config.defaultViewport).toEqual({ width: 1280, height: 900 });
      expect(config.hmrDebounceMs).toBe(150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
