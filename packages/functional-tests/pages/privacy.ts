import { BaseLayout } from './layout';

export class PrivacyPage extends BaseLayout {
  readonly path = 'legal/privacy';

  get backButton() {
    return this.page.getByRole('button', { name: 'Back' });
  }

  get pageHeader() {
    return this.page.getByRole('heading', {
      name: 'Mozilla Accounts Privacy Notice',
    });
  }

  async clickBackButton() {
    await this.backButton.click();
    await this.page.waitForURL(/\/legal$/);
  }
}
