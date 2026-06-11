import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { BrowserManager } from './browser/manager.js';
import { DiffStore } from './utils/diff.js';
import { warmup } from './tools/warmup.js';
import { capture } from './tools/capture.js';
import { snapshot } from './tools/snapshot.js';
import { diff } from './tools/diff.js';

const diffStore = new DiffStore();

export async function startServer() {
  const config = await loadConfig();
  const server = new Server(
    { name: 'devlens', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'dl_warmup',
        description: 'Pre-warm the browser by loading the dev server. Call once at the start of a frontend task. First call takes ~500ms; subsequent captures cost ~50ms.',
        inputSchema: {
          type: 'object',
          properties: {
            devServerUrl: { type: 'string', description: 'Override the dev server URL from config (e.g. "http://localhost:5173")' },
          },
        },
      },
      {
        name: 'dl_capture',
        description: 'Screenshot a dev server route and return a PNG image. Pass either `route` ("/dashboard") or `filePath` (auto-resolved via devlens.config.ts). Optionally pass `selector` to crop to a specific element. Call this after every frontend file write.',
        inputSchema: {
          type: 'object',
          properties: {
            route: { type: 'string', description: 'Dev server route, e.g. "/dashboard"' },
            filePath: { type: 'string', description: 'The file you just edited — route resolved from devlens.config.ts mappings' },
            selector: { type: 'string', description: 'CSS selector to crop to (e.g. ".onboarding-banner"). Omit for full page.' },
            waitMs: { type: 'number', description: 'ms to wait for HMR to settle (default: 150)' },
          },
        },
      },
      {
        name: 'dl_diff',
        description: 'Screenshot a route and compare to the last capture for that route. Returns a pixel diff image and the percentage of pixels changed. First call sets the baseline.',
        inputSchema: {
          type: 'object',
          properties: {
            route: { type: 'string' },
            selector: { type: 'string' },
          },
          required: ['route'],
        },
      },
      {
        name: 'dl_snapshot',
        description: 'Fast structural snapshot — returns DOM tree, computed styles, and bounding boxes without a visual screenshot. ~10ms. Use for quick layout/content verification.',
        inputSchema: {
          type: 'object',
          properties: {
            route: { type: 'string', description: 'Dev server route' },
            selector: { type: 'string', description: 'CSS selector to scope snapshot to' },
          },
          required: ['route'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;

    try {
      if (name === 'dl_warmup') {
        const result = await warmup((args as { devServerUrl?: string }).devServerUrl, config);
        return {
          content: [{ type: 'text', text: `Warmed up in ${result.durationMs}ms — ${result.url}` }],
        };
      }

      if (name === 'dl_capture') {
        const input = args as { route?: string; filePath?: string; selector?: string; waitMs?: number };
        const result = await capture(input, config);
        if ('error' in result) {
          return { content: [{ type: 'text', text: `Error: ${result.error}` }] };
        }
        const content: object[] = [
          { type: 'text', text: `Captured in ${result.durationMs}ms — ${result.url}${result.selector ? ` (${result.selector})` : ''}` },
        ];
        if (result.imageBase64) {
          content.push({ type: 'image', data: result.imageBase64, mimeType: 'image/png' });
        }
        return { content };
      }

      if (name === 'dl_diff') {
        const { route, selector } = args as { route: string; selector?: string };
        const result = await diff(route, selector, diffStore, config);
        if ('error' in result) return { content: [{ type: 'text', text: `Error: ${result.error}` }] };
        const content: object[] = [
          { type: 'text', text: result.diff
            ? `Changed: ${result.diff.changedPercent}% (${result.diff.changedPixels} pixels)`
            : (result as { message?: string }).message ?? 'Baseline set.' },
        ];
        if (result.diff?.diffImageBase64) {
          content.push({ type: 'image', data: result.diff.diffImageBase64, mimeType: 'image/png' });
        }
        return { content };
      }

      if (name === 'dl_snapshot') {
        const { route, selector } = args as { route: string; selector?: string };
        const result = await snapshot(route, selector, config);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: 'text', text: `Tool error: ${msg}` }], isError: true };
    }
  });

  process.on('SIGINT', async () => {
    await BrowserManager.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[devlens] MCP server ready');
}
