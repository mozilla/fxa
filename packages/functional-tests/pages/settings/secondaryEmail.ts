import { EmailHeader, EmailType } from '../../lib/email';
import { SettingsLayout } from './layout';

export class SecondaryEmailPage extends SettingsLayout {
  readonly path = 'settings/emails';

  setEmail(email: string) {
    return this.page.locator('input[type=email]').fill(email);
  }

  setVerificationCode(code: string) {
    return this.page.locator('input[type=text]').fill(code);
  }

  async submit() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.page.locator('button[type=submit]').click();
    return waitForNavigation;
  }

  async addAndVerify(email: string) {
    await this.target.email.clear(email);
    await this.setEmail(email);
    await this.submit();
    const code = await this.target.email.waitForEmail(
      email,
      EmailType.verifySecondaryCode,
      EmailHeader.verifyCode
    );
    await this.setVerificationCode(code);
    await this.submit();
    return code;
  }
}
