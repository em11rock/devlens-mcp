import { describe, it, expect } from 'vitest';
import { DiffStore } from '../utils/diff.js';

// Valid 2x2 solid-red PNG encoded as base64 (generated via pngjs)
const RED_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAE0lEQVR4AWP8z8DwnwEImBigAAAfFwICgH3ifwAAAABJRU5ErkJggg==';

describe('DiffStore', () => {
  it('returns null diff when no baseline exists', async () => {
    const store = new DiffStore();
    const result = await store.diffAndStore('/test', RED_PNG);
    expect(result).toBeNull(); // first call — no baseline
  });

  it('returns zero diff for identical images', async () => {
    const store = new DiffStore();
    await store.diffAndStore('/test', RED_PNG); // set baseline
    const result = await store.diffAndStore('/test', RED_PNG); // compare
    expect(result).not.toBeNull();
    expect(result!.changedPercent).toBe(0);
  });

  it('routes are isolated', async () => {
    const store = new DiffStore();
    await store.diffAndStore('/a', RED_PNG);
    const result = await store.diffAndStore('/b', RED_PNG); // different route, no baseline
    expect(result).toBeNull();
  });
});
