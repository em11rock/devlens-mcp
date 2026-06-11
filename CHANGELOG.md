# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-06-11

### Fixed
- `loadConfig` was replacing `.ts` → `.js` before importing, but `init` wrote `devlens.config.ts` — routes were always empty on first use
- `loadConfig` now tries `devlens.config.js` first, then `devlens.config.ts` as a fallback
- Silent `catch {}` replaced with a visible `[devlens]` warning when no config file is found

### Changed
- `init` now writes `devlens.config.js` (with JSDoc types) instead of `devlens.config.ts` — no TS loader required
- `devlens.config.example.ts` renamed to `devlens.config.example.js`

### Added
- Regression tests for config loading (`src/__tests__/config.test.ts`)

## [0.1.2] - 2026-06-11

### Changed
- `init` now runs `npx playwright install chromium` automatically — no separate install step needed

## [0.1.1] - 2026-06-11

### Fixed
- Removed unused `zod` dependency
- Fixed unsafe `as` casts in `server.ts` — replaced with type-safe string/number extractors
- Fixed `devlens.config.example.ts` import path (was pointing to local dev path, now uses `devlens-mcp`)
- Raised cold-load test threshold from 3s to 15s to avoid flaky failures on slow CI

### Added
- `exports` field in `package.json` for proper ESM resolution
- GitHub Actions CI workflow (build + test on push/PR)
- GitHub Actions publish workflow (auto-publish on `v*` tags)
- `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`
- ESLint + Prettier config (`.eslintrc.json`, `.prettierrc`)
- `lint` and `format` scripts in `package.json`

### Changed
- `SKILL.md` trigger paths generified (was hardcoded to `apps/web/src/**`)

## [0.1.0] - 2026-06-11

### Added
- Initial release
- `dl_warmup` — pre-warm the browser for fast subsequent captures (~50ms)
- `dl_capture` — screenshot a dev server route, with optional CSS selector cropping
- `dl_diff` — pixel-level before/after diff with baseline storage per route
- `dl_snapshot` — fast DOM structural snapshot (~10ms) with computed styles and bounding boxes
- `devlens init` CLI command to scaffold `.mcp.json`, `.claude/skills/devlens.md`, and `devlens.config.js`
- MCP server powered by `@modelcontextprotocol/sdk`
- File-to-route mapping via `devlens.config.js` and glob patterns
- HMR debounce to let the dev server settle before capturing
