import { chromium, Browser, Page } from 'playwright';

export class BrowserManager {
  private static browser: Browser | null = null;
  private static page: Page | null = null;

  static async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser.newPage();
      this.page.on('console', () => {});
      this.page.on('pageerror', () => {});
    }
    return this.page;
  }

  static async close(): Promise<void> {
    if (this.page && !this.page.isClosed()) await this.page.close();
    if (this.browser) await this.browser.close();
    this.page = null;
    this.browser = null;
  }

  static isWarm(): boolean {
    return this.browser !== null && this.page !== null && !this.page.isClosed();
  }
}
