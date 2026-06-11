import { BrowserManager } from '../browser/manager.js';
import { normaliseUrl } from '../browser/capture.js';
import type { DevLensConfig } from '../config.js';

export async function snapshot(route: string, selector: string | undefined, config: DevLensConfig) {
  const url = `${config.devServerUrl}${route}`;
  const page = await BrowserManager.getPage();

  if (normaliseUrl(page.url()) !== normaliseUrl(url)) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  }

  const target = selector ? page.locator(selector).first() : page.locator('body');
  const found = (await target.count()) > 0;

  if (!found) return { found: false, elements: [] };

  const elements = await target.evaluate((el: Element) => {
    function extract(node: Element): object {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        tag: node.tagName.toLowerCase(),
        id: node.id || undefined,
        classes: Array.from(node.classList).slice(0, 5),
        text: node.textContent?.trim().slice(0, 120) || undefined,
        role: node.getAttribute('role') || undefined,
        ariaLabel: node.getAttribute('aria-label') || undefined,
        visible: rect.width > 0 && rect.height > 0,
        bounds: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        styles: {
          display: style.display,
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        },
        children: Array.from(node.children).slice(0, 8).map(extract),
      };
    }
    return extract(el);
  });

  return { found: true, url, selector, elements };
}
