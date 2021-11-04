import { EmailHeader, EmailType } from '../lib/email';
import { BaseLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';

export class LoginPage extends BaseLayout {
  readonly path = '';

  async login(email: string, password: string, recoveryCode?: string) {
    await this.setEmail(email);
    await this.page.click('button[type=submit]');
    await this.setPassword(password);
    await this.submit();
    if (recoveryCode) {
      await this.clickUseRecoveryCode();
      await this.setCode(recoveryCode);
      await this.submit();
    }
  }

  setEmail(email: string) {
    return this.page.fill('input[type=email]', email);
  }

  setPassword(password: string) {
    return this.page.fill('input[type=password]', password);
  }

  async clickUseRecoveryCode() {
    return this.page.click('#use-recovery-code-link');
  }

  async setCode(code: string) {
    return this.page.fill('input[type=text]', code);
  }

  async unblock(email: string) {
    const code = await this.target.email.waitForEmail(
      email,
      EmailType.unblockCode,
      EmailHeader.unblockCode
    );
    await this.setCode(code);
    await this.submit();
  }

  async submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
  }

  async clickForgotPassword() {
    return Promise.all([
      this.page.click('a[href="/reset_password"]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
  }

  async clickDontHaveRecoveryKey() {
    return Promise.all([
      this.page.click('a.lost-recovery-key'),
      this.page.waitForNavigation(),
    ]);
  }

  setRecoveryKey(key: string) {
    return this.page.fill('input[type=text]', key);
  }

  async setNewPassword(password: string) {
    await this.page.fill('#password', password);
    await this.page.fill('#vpassword', password);
    await this.submit();
  }

  async setTotp(secret: string) {
    const code = await getCode(secret);
    await this.page.fill('input[type=number]', code);
    await this.submit();
  }

  async useCredentials(credentials: any) {
    await this.goto();
    return this.page.evaluate((creds) => {
      localStorage.setItem(
        '__fxa_storage.accounts',
        JSON.stringify({
          [creds.uid]: {
            sessionToken: creds.sessionToken,
            uid: creds.uid,
          },
        })
      );
      localStorage.setItem(
        '__fxa_storage.currentAccountUid',
        JSON.stringify(creds.uid)
      );
    }, credentials);
  }
}
