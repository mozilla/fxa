import { Page } from '@playwright/test';
import { BaseTarget } from '../lib/targets/base';

export abstract class BaseLayout {
  readonly path?: string;

  constructor(public page: Page, protected readonly target: BaseTarget) {}

  protected get baseUrl() {
    return this.target.baseUrl;
  }

  get url() {
    return `${this.baseUrl}/${this.path}`;
  }

  goto(waitUntil: 'networkidle' | 'domcontentloaded' | 'load' = 'load') {
    return this.page.goto(this.url, { waitUntil });
  }

  screenshot() {
    return this.page.screenshot({ fullPage: true });
  }
}
