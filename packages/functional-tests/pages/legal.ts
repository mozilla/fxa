import { BaseLayout } from './layout';

export class LegalPage extends BaseLayout {
  readonly path = 'legal';

  get pageHeader() {
    return this.page.getByRole('heading', { name: 'Legal' });
  }

  get privacyNoticeLink() {
    return this.page.getByRole('link', { name: 'Privacy Notice' });
  }

  get termsOfServiceLink() {
    return this.page.getByRole('link', { name: 'Terms of Service' });
  }

  async clickPrivacyNoticeLink() {
    this.privacyNoticeLink.click();
    await this.page.waitForURL(/\/legal\/privacy/);
  }

  async clickTermsOfServiceLink() {
    this.termsOfServiceLink.click();
    await this.page.waitForURL(/\/legal\/terms/);
  }
}
