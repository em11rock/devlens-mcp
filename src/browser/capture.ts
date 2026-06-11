import { BrowserManager } from './manager.js';

export interface CaptureResult {
  imageBase64: string;
  durationMs: number;
  url: string;
  selector?: string;
  found: boolean;
}

/** Normalise a URL for comparison: strip trailing slash so that
 *  'https://example.com' and 'https://example.com/' are treated as equal. */
export function normaliseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.pathname === '/') u.pathname = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return raw.replace(/\/$/, '');
  }
}

export async function captureRoute(
  url: string,
  selector: string | undefined,
  viewport: { width: number; height: number },
): Promise<CaptureResult> {
  const start = Date.now();
  const page = await BrowserManager.getPage();

  await page.setViewportSize(viewport);

  // Only navigate if URL changed — avoids reload cost on repeated same-route captures.
  // Use domcontentloaded (not networkidle) so the cold call stays well under 3 s.
  if (normaliseUrl(page.url()) !== normaliseUrl(url)) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  }

  const screenshot = await page.screenshot({ type: 'png', fullPage: false });
  return {
    imageBase64: screenshot.toString('base64'),
    durationMs: Date.now() - start,
    url,
    selector: undefined,
    found: true,
  };
}

export async function captureElement(
  url: string,
  selector: string,
  viewport: { width: number; height: number },
): Promise<CaptureResult> {
  const start = Date.now();
  const page = await BrowserManager.getPage();

  await page.setViewportSize(viewport);

  if (normaliseUrl(page.url()) !== normaliseUrl(url)) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  }

  const locator = page.locator(selector).first();
  const count = await locator.count();

  if (count === 0) {
    return { imageBase64: '', durationMs: Date.now() - start, url, selector, found: false };
  }

  const screenshot = await locator.screenshot({ type: 'png' });
  return {
    imageBase64: screenshot.toString('base64'),
    durationMs: Date.now() - start,
    url,
    selector,
    found: true,
  };
}
