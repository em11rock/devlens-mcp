import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface DiffResult {
  diffImageBase64: string;
  changedPercent: number;
  changedPixels: number;
  totalPixels: number;
}

export class DiffStore {
  private baselines = new Map<string, Buffer>();

  async diffAndStore(routeKey: string, newImageBase64: string): Promise<DiffResult | null> {
    const newBuf = Buffer.from(newImageBase64, 'base64');
    const previous = this.baselines.get(routeKey);

    // Always update baseline
    this.baselines.set(routeKey, newBuf);

    if (!previous) return null; // first capture for this route

    const imgA = PNG.sync.read(previous);
    const imgB = PNG.sync.read(newBuf);

    // If dimensions changed, treat as 100% changed — no pixel-level diff possible
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      return { diffImageBase64: newImageBase64, changedPercent: 100, changedPixels: -1, totalPixels: -1 };
    }

    const { width, height } = imgA;
    const diff = new PNG({ width, height });
    const changedPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });
    const totalPixels = width * height;

    return {
      diffImageBase64: PNG.sync.write(diff).toString('base64'),
      changedPercent: Math.round((changedPixels / totalPixels) * 100 * 10) / 10,
      changedPixels,
      totalPixels,
    };
  }

  clear(routeKey?: string): void {
    if (routeKey) this.baselines.delete(routeKey);
    else this.baselines.clear();
  }
}
