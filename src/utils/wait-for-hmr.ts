export function waitForHmr(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
