---
name: devlens
description: Real-time visual QA for frontend development. Auto-invoked when editing frontend files.
triggers:
  - frontend
  - ui
  - component
  - tsx
  - css
---

# DevLens — Automatic Visual QA

You have access to four visual inspection tools: `dl_warmup`, `dl_capture`, `dl_diff`, `dl_snapshot`.

## Rules — follow these automatically, no user prompting needed

### Rule 1: Warmup at session start
The first time you are about to edit any frontend file (`.tsx`, `.ts`, `.css`, `.vue`, `.svelte`), call `dl_warmup` first.
This pre-warms the browser so subsequent captures cost ~50ms instead of ~500ms.
Only call it once per session.

### Rule 2: Capture after every frontend file write
After every `Edit` or `Write` to a file matching `**/*.tsx`, `**/*.vue`, `**/*.svelte`, or `**/*.css`:
1. Call `dl_capture` with either `route` (if you know it) or `filePath` (auto-resolved from devlens.config.ts)
2. Add `selector` if you only changed a specific component (keeps the image small and fast)
3. Look at the returned image — does it look right?
4. If something looks wrong (layout broken, text missing, wrong color, overlapping elements), fix it before moving on

Do this every time, automatically. Do not wait to be asked.

### Rule 3: Diff before/after for significant changes
When making a change you expect to visually alter the page (not just a bug fix):
1. Call `dl_diff` before the change to set the baseline
2. Make your code changes
3. Call `dl_diff` again to see exactly what pixels changed
4. Verify the diff matches your intent

### Rule 4: Pre-deploy visual audit
Before running any deploy command (`wrangler pages deploy`, `npm run deploy`, etc.):
1. Call `dl_capture` on the key routes that were changed during this session
2. Review each screenshot
3. Only proceed with deploy if all look correct

Routes to always check before deploy:
- `/` (Dashboard)
- Any route you edited during this session

### Rule 5: Snap on request
If the user asks "does this look right?", "show me what it looks like", or "screenshot this", 
call `dl_capture` immediately and show the result.

## Performance expectations
- `dl_warmup`: ~500ms (cold), do once
- `dl_capture` warm: ~50–80ms
- `dl_snapshot`: ~10ms
- `dl_diff` warm: ~60ms

These are fast enough to call after every file write without slowing down development.

## Selector tips
- Use `.classname` to target a specific component
- Use `[data-testid="x"]` for test-id targeting
- Omit selector for full-page captures (slower, larger image)
- Prefer element-level captures during iteration, full-page before deploy
