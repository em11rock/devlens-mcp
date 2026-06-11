import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { spawnSync } from 'child_process';

const SKILL_CONTENT = `---
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

You have access to four visual inspection tools: \`dl_warmup\`, \`dl_capture\`, \`dl_diff\`, \`dl_snapshot\`.

## Rules — follow these automatically, no user prompting needed

### Rule 1: Warmup at session start
The first time you are about to edit any frontend file (\`.tsx\`, \`.jsx\`, \`.css\`, \`.vue\`, \`.svelte\`), call \`dl_warmup\` first.
This pre-warms the browser so subsequent captures cost ~50ms instead of ~500ms.
Only call it once per session.

### Rule 2: Capture after every frontend file write
After every \`Edit\` or \`Write\` to a \`.tsx\`, \`.jsx\`, \`.css\`, \`.vue\`, or \`.svelte\` file:
1. Call \`dl_capture\` with either \`route\` (if you know it) or \`filePath\` (auto-resolved from devlens.config.js)
2. Add \`selector\` if you only changed a specific component (keeps the image small and fast)
3. Look at the returned image — does it look right?
4. If something looks wrong (layout broken, text missing, wrong color, overlapping elements), fix it before moving on

Do this every time, automatically. Do not wait to be asked.

### Rule 3: Diff before/after for significant changes
When making a change you expect to visually alter the page:
1. Call \`dl_diff\` before the change to set the baseline
2. Make your code changes
3. Call \`dl_diff\` again to see exactly what pixels changed
4. Verify the diff matches your intent

### Rule 4: Pre-deploy visual audit
Before running any deploy command:
1. Call \`dl_capture\` on the key routes that were changed during this session
2. Review each screenshot
3. Only proceed with deploy if all look correct

### Rule 5: Snap on request
If the user asks "does this look right?", "show me what it looks like", or "screenshot this",
call \`dl_capture\` immediately and show the result.

## Performance expectations
- \`dl_warmup\`: ~500ms (cold), do once
- \`dl_capture\` warm: ~50–80ms
- \`dl_snapshot\`: ~10ms
- \`dl_diff\` warm: ~60ms

## Selector tips
- Use \`.classname\` to target a specific component
- Use \`[data-testid="x"]\` for test-id targeting
- Omit selector for full-page captures (slower, larger image)
- Prefer element-level captures during iteration, full-page before deploy
`;

const CONFIG_TEMPLATE = `// devlens.config.js — map your source files to dev server routes
/** @type {import('devlens-mcp').DevLensConfig} */
const config = {
  devServerUrl: 'http://localhost:5173',
  hmrDebounceMs: 150,
  defaultViewport: { width: 1280, height: 900 },
  routes: [
    // { pattern: '**/pages/Home.tsx', route: '/' },
    // { pattern: '**/pages/About.tsx', route: '/about' },
    // { pattern: '**/components/**', route: null }, // null = no auto-route for components
  ],
};

export default config;
`;

export async function runInit(): Promise<void> {
  const cwd = process.cwd();

  // 1. Create/update .mcp.json
  const mcpPath = resolve(cwd, '.mcp.json');
  let mcpConfig: { mcpServers?: Record<string, unknown> } = {};
  if (existsSync(mcpPath)) {
    try {
      mcpConfig = JSON.parse(readFileSync(mcpPath, 'utf8')) as typeof mcpConfig;
    } catch {
      console.warn('  Warning: existing .mcp.json could not be parsed — overwriting');
    }
  }
  mcpConfig.mcpServers = mcpConfig.mcpServers ?? {};
  mcpConfig.mcpServers['devlens'] = { command: 'npx', args: ['--yes', 'devlens-mcp'] };
  writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2) + '\n');
  console.log('  ✓ .mcp.json updated');

  // 2. Create .claude/skills/devlens.md
  const skillsDir = resolve(cwd, '.claude', 'skills');
  mkdirSync(skillsDir, { recursive: true });
  writeFileSync(join(skillsDir, 'devlens.md'), SKILL_CONTENT);
  console.log('  ✓ .claude/skills/devlens.md written');

  // 3. Create devlens.config.js if not present
  const configPath = resolve(cwd, 'devlens.config.js');
  if (!existsSync(configPath)) {
    writeFileSync(configPath, CONFIG_TEMPLATE);
    console.log('  ✓ devlens.config.js created (edit this to add your routes)');
  } else {
    console.log('  ✓ devlens.config.js already exists — skipped');
  }

  // 4. Install Playwright Chromium browser
  console.log('  Installing Chromium browser...');
  const result = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', shell: true });
  if (result.status === 0) {
    console.log('  ✓ Chromium installed');
  } else {
    console.warn('  ⚠ Chromium install failed — run "npx playwright install chromium" manually');
  }

  console.log('');
  console.log('DevLens initialized. Next step:');
  console.log('');
  console.log('  1. Edit devlens.config.js to map your pages to routes');
  console.log('');
  console.log('  2. Restart Claude Code');
  console.log('');
  console.log('  Claude will then automatically screenshot your UI after every file write.');
}
