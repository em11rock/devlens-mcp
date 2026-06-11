# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-11

### Added
- Initial release
- `dl_warmup` — pre-warm the browser for fast subsequent captures (~50ms)
- `dl_capture` — screenshot a dev server route, with optional CSS selector cropping
- `dl_diff` — pixel-level before/after diff with baseline storage per route
- `dl_snapshot` — fast DOM structural snapshot (~10ms) with computed styles and bounding boxes
- `devlens init` CLI command to scaffold `.mcp.json` and `devlens.config.ts` in a project
- MCP server powered by `@modelcontextprotocol/sdk`
- File-to-route mapping via `devlens.config.ts` and glob patterns
- HMR debounce to let the dev server settle before capturing
