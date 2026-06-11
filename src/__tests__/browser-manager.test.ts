import { describe, it, expect, afterAll } from 'vitest';
import { BrowserManager } from '../browser/manager.js';

describe('BrowserManager', () => {
  afterAll(async () => {
    await BrowserManager.close();
  });

  it('returns a page', async () => {
    const page = await BrowserManager.getPage();
    expect(page).toBeDefined();
    expect(typeof page.goto).toBe('function');
  });

  it('returns the same page on second call (singleton)', async () => {
    const a = await BrowserManager.getPage();
    const b = await BrowserManager.getPage();
    expect(a === b).toBe(true);
  });

  it('page can navigate to about:blank', async () => {
    const page = await BrowserManager.getPage();
    await page.goto('about:blank');
    expect(page.url()).toBe('about:blank');
  });
});
