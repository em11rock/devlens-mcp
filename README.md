# DevLens

Real-time visual feedback for AI-assisted frontend development. A Claude Code plugin (MCP server) that gives Claude the ability to see what it's building — automatically, after every file write, in ~50ms.

## How it works

DevLens keeps a single Chromium instance alive for the duration of your Claude Code session. After every frontend file change, Claude calls `dl_capture` and receives a screenshot of the affected route. No user prompting needed — the companion skill handles it automatically.

## Tools

| Tool | Speed | Use |
|------|-------|-----|
| `dl_warmup` | ~500ms cold, once | Pre-warm browser at session start |
| `dl_capture` | ~50ms warm | Screenshot a route or element |
| `dl_diff` | ~60ms warm | Pixel diff vs last capture |
| `dl_snapshot` | ~10ms | DOM + styles, no pixels |

## Setup

In your project root:

```bash
npx devlens-mcp init
```

This creates `.mcp.json`, `.claude/skills/devlens.md`, and `devlens.config.js`, and installs the Chromium browser automatically.

Edit `devlens.config.js` to map your source files to dev server routes, then restart Claude Code.

```js
// devlens.config.js
/** @type {import('devlens-mcp').DevLensConfig} */
const config = {
  devServerUrl: 'http://localhost:5173',
  routes: [
    { pattern: '**/pages/Home.tsx', route: '/' },
    { pattern: '**/pages/About.tsx', route: '/about' },
    { pattern: '**/components/**', route: null },
  ],
};
export default config;
```

## What `init` sets up

- **`.mcp.json`** — registers the devlens MCP server so Claude Code can call the `dl_*` tools
- **`.claude/skills/devlens.md`** — the skill that tells Claude to automatically capture after every file write, diff before/after significant changes, and run a visual audit before deploying
- **`devlens.config.js`** — maps file glob patterns to dev server routes

## Performance

Warm captures target **<80ms**. Cold first-load is ~500ms (one-time per session). Element-level captures (`selector` param) are faster and produce smaller images.

## Open source

MIT. Works with any MCP-compatible AI client.
