import { BaseLayout } from './layout';

export class TermsOfService extends BaseLayout {
  readonly path = 'legal/terms';

  get backButton() {
    return this.page.getByRole('button', { name: 'Back' });
  }

  get pageHeader() {
    return this.page.getByRole('heading', {
      name: 'Mozilla Accounts Terms of Service',
    });
  }

  async clickBackButton() {
    await this.backButton.click();
    await this.page.waitForURL(/\/legal$/);
  }
}
