import { captureRoute } from '../browser/capture.js';
import type { DevLensConfig } from '../config.js';

export async function warmup(
  devServerUrl: string | undefined,
  config: DevLensConfig,
): Promise<{ ok: boolean; durationMs: number; url: string }> {
  const url = devServerUrl ?? config.devServerUrl;
  const start = Date.now();
  await captureRoute(url, undefined, config.defaultViewport ?? { width: 1280, height: 900 });
  return { ok: true, durationMs: Date.now() - start, url };
}
