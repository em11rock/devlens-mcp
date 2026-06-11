# Contributing

## Getting started

```bash
git clone https://github.com/em11rock/devlens-mcp.git
cd devlens-mcp
npm install
npx playwright install chromium
```

## Development workflow

```bash
npm run dev       # watch mode build
npm test          # run tests
npm run lint      # lint
npm run format    # format with prettier
```

## Project structure

```
src/
  browser/       # Playwright browser/page singleton and capture logic
  cli/           # init command
  tools/         # MCP tool handlers (warmup, capture, diff, snapshot)
  utils/         # route-mapper, diff store, HMR wait
  config.ts      # config loading and types
  server.ts      # MCP server setup
  index.ts       # CLI entry point
```

## Pull requests

- Keep PRs focused — one concern per PR
- Add or update tests for any changed behavior
- Run `npm test` and `npm run build` before submitting
- Describe the *why* in the PR description, not just the *what*

## Releasing

Releases are automated via GitHub Actions. Push a tag matching `v*` (e.g. `v0.2.0`) to trigger a publish to npm. Requires the `NPM_TOKEN` secret to be set in the repository settings.
