// Copy this to your project root as devlens.config.js and edit to match your routes.
/** @type {import('devlens-mcp').DevLensConfig} */
const config = {
  devServerUrl: 'http://localhost:5173',
  hmrDebounceMs: 150,
  defaultViewport: { width: 1280, height: 900 },
  routes: [
    { pattern: '**/pages/Dashboard.tsx',     route: '/' },
    { pattern: '**/pages/Inbox.tsx',          route: '/engage/inbox' },
    { pattern: '**/pages/Listings.tsx',       route: '/manage/listings' },
    { pattern: '**/pages/Reviews.tsx',        route: '/manage/reviews' },
    { pattern: '**/pages/Rankings.tsx',       route: '/intelligence/rankings' },
    { pattern: '**/pages/Strategy.tsx',       route: '/intelligence/strategy' },
    { pattern: '**/pages/Billing.tsx',        route: '/settings/billing' },
    { pattern: '**/pages/Channels.tsx',       route: '/settings/channels' },
    { pattern: '**/components/**',            route: null },
  ],
};

export default config;
