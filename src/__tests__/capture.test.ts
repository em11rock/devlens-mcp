import { describe, it, expect, afterAll } from 'vitest';
import { BrowserManager } from '../browser/manager.js';
import { captureRoute, captureElement } from '../browser/capture.js';

const DEV_URL = process.env.DEVLENS_TEST_URL ?? 'https://example.com';

describe('capture', () => {
  afterAll(() => BrowserManager.close());

  it('captureRoute returns a non-empty base64 PNG', async () => {
    const result = await captureRoute(DEV_URL, undefined, { width: 1280, height: 900 });
    expect(result.imageBase64).toBeTruthy();
    expect(result.durationMs).toBeLessThan(15000);
    // Valid PNG header: base64 of \x89PNG
    expect(result.imageBase64.startsWith('iVBOR')).toBe(true);
  });

  it('captureRoute warm is fast (<300ms)', async () => {
    // Second call reuses the warm browser
    const result = await captureRoute(DEV_URL, undefined, { width: 1280, height: 900 });
    expect(result.durationMs).toBeLessThan(300);
  });

  it('captureElement returns a PNG when selector exists', async () => {
    // example.com has an <h1>
    const result = await captureElement(DEV_URL, 'h1', { width: 1280, height: 900 });
    expect(result.imageBase64).toBeTruthy();
    expect(result.found).toBe(true);
  });

  it('captureElement reports not found for missing selector', async () => {
    const result = await captureElement(DEV_URL, '.does-not-exist-xyz', { width: 1280, height: 900 });
    expect(result.found).toBe(false);
    expect(result.imageBase64).toBe('');
  });
});
