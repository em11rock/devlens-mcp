import { captureRoute, captureElement } from '../browser/capture.js';
import { resolveRoute } from '../utils/route-mapper.js';
import { waitForHmr } from '../utils/wait-for-hmr.js';
import type { DevLensConfig } from '../config.js';

export interface CaptureInput {
  route?: string;
  filePath?: string;
  selector?: string;
  waitMs?: number;
}

export async function capture(input: CaptureInput, config: DevLensConfig) {
  let route = input.route;
  if (!route && input.filePath) {
    route = resolveRoute(input.filePath, config) ?? undefined;
  }
  if (!route) {
    return { error: 'No route resolved — pass route directly or add filePath to devlens.config.ts mappings' };
  }

  const url = `${config.devServerUrl}${route}`;
  const debounce = input.waitMs ?? config.hmrDebounceMs ?? 150;
  await waitForHmr(debounce);

  const viewport = config.defaultViewport ?? { width: 1280, height: 900 };

  if (input.selector) {
    return captureElement(url, input.selector, viewport);
  }
  return captureRoute(url, undefined, viewport);
}
