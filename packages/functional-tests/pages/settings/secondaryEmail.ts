import { EmailHeader, EmailType } from '../../lib/email';
import { SettingsLayout } from './layout';

export class SecondaryEmailPage extends SettingsLayout {
  readonly path = 'settings/emails';

  setEmail(email: string) {
    return this.page.fill('input[type=email]', email);
  }

  setVerificationCode(code: string) {
    return this.page.fill('input[type=text]', code);
  }

  submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
      this.page.waitForNavigation(),
    ]);
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
