import { describe, it, expect } from 'vitest';
import { resolveRoute } from '../utils/route-mapper.js';
import type { DevLensConfig } from '../config.js';

const config: DevLensConfig = {
  devServerUrl: 'http://localhost:5173',
  routes: [
    { pattern: '**/pages/Dashboard.tsx', route: '/' },
    { pattern: '**/pages/Inbox.tsx', route: '/engage/inbox' },
    { pattern: '**/pages/Reviews.tsx', route: '/manage/reviews' },
    { pattern: '**/components/**', route: null },
  ],
};

describe('resolveRoute', () => {
  it('resolves a known page file', () => {
    expect(resolveRoute('apps/web/src/pages/Dashboard.tsx', config)).toBe('/');
  });

  it('resolves a nested page', () => {
    expect(resolveRoute('apps/web/src/pages/Inbox.tsx', config)).toBe('/engage/inbox');
  });

  it('returns null for components (no auto-route)', () => {
    expect(resolveRoute('apps/web/src/components/ThreadCard.tsx', config)).toBeNull();
  });

  it('returns null for unknown files', () => {
    expect(resolveRoute('apps/web/src/lib/api.ts', config)).toBeNull();
  });
});
