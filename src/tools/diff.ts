import { capture } from './capture.js';
import type { DiffStore } from '../utils/diff.js';
import type { DevLensConfig } from '../config.js';

export async function diff(
  route: string,
  selector: string | undefined,
  store: DiffStore,
  config: DevLensConfig,
) {
  const result = await capture({ route, selector }, config);
  if ('error' in result) return result;
  if (!result.found) return { found: false };

  const key = `${route}${selector ?? ''}`;
  const diffResult = await store.diffAndStore(key, result.imageBase64);

  if (!diffResult) {
    return { ...result, diff: null, message: 'Baseline set — call again after making changes to see the diff.' };
  }

  return {
    ...result,
    diff: {
      diffImageBase64: diffResult.diffImageBase64,
      changedPercent: diffResult.changedPercent,
      changedPixels: diffResult.changedPixels,
    },
  };
}
