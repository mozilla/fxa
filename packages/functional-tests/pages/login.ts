import { EmailHeader, EmailType } from '../lib/email';
import { BaseLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';

export class LoginPage extends BaseLayout {
  readonly path = '';

  readonly selectors = {
    AGE: '#age',
    DATA_TESTID: '[data-testid=logo]',
    EMAIL: 'input[type=email]',
    EMAIL_PREFILLED: '#prefillEmail',
    ERROR: '.error',
    LINK_LOST_RECOVERY_KEY: 'a.lost-recovery-key',
    LINK_RESET_PASSWORD: 'a[href^="/reset_password"]',
    LINK_USE_DIFFERENT: '#use-different',
    LINK_USE_RECOVERY_CODE: '#use-recovery-code-link',
    NUMBER_INPUT: 'input[type=number]',
    PASSWORD: '#password',
    PASSWORD_INPUT: 'input[type=password]',
    PERMISSIONS_HEADER: '#fxa-permissions-header',
    RESET_PASSWORD_EXPIRED_HEADER: '#fxa-reset-link-expired-header',
    RESET_PASSWORD_HEADER: '#fxa-reset-password-header',
    SIGNIN_HEADER: '#fxa-signin-header',
    SUBMIT: 'button[type=submit]',
    SUBMIT_USER_SIGNED_IN: '#use-logged-in',
    TEXT_INPUT: 'input[type=text]',
    TOOLTIP: '.tooltip',
    VPASSWORD: '#vpassword',
    SYNC_CONNECTED_HEADER: '#fxa-connected-heading',
  };

  async login(email: string, password: string, recoveryCode?: string) {
    // When running tests in parallel, playwright shares the storage state,
    // so we might not always be at the email first screen.
    if (await this.isCachedLogin()) {
      // User is already signed in and attempting to sign in to another service,
      // we show a `Continue` button, and they don't have to re-enter password
      return this.submit();
    } else if (await this.isSigninHeader()) {
      // The user has specified an email address in url or this service
      // requires them to set a password to login (ie Sync)
      await this.setPassword(password);
    } else {
      // The email first flow, where user enters email and we take them to
      // the signin page
      await this.setEmail(email);
      await this.submit();
      await this.setPassword(password);
    }

    await this.submit();
    if (recoveryCode) {
      await this.clickUseRecoveryCode();
      await this.setCode(recoveryCode);
      await this.submit();
    }
  }

  async fillOutFirstSignUp(email: string, password: string) {
    await this.setEmail(email);
    await this.page.click(this.selectors.SUBMIT);
    await this.page.fill(this.selectors.PASSWORD, password);
    await this.page.fill(this.selectors.VPASSWORD, password);
    await this.page.fill(this.selectors.AGE, '24');
    await this.page.click(this.selectors.SUBMIT);
    await this.fillOutSignUpCode(email);
  }

  async fillOutSignUpCode(email: string) {
    const code = await this.target.email.waitForEmail(
      email,
      EmailType.verifyShortCode,
      EmailHeader.shortCode
    );
    await this.setCode(code);
    await this.submit();
  }

  setEmail(email: string) {
    return this.page.fill(this.selectors.EMAIL, email);
  }

  setPassword(password: string) {
    return this.page.fill(this.selectors.PASSWORD, password);
  }

  async clickUseRecoveryCode() {
    return this.page.click(this.selectors.LINK_USE_RECOVERY_CODE);
  }

  async setCode(code: string) {
    return this.page.fill(this.selectors.TEXT_INPUT, code);
  }

  async loginHeader() {
    const header = this.page.locator(this.selectors.DATA_TESTID);
    await header.waitFor();
    return header.isVisible();
  }

  async signInError() {
    const error = this.page.locator(this.selectors.ERROR);
    await error.waitFor();
    return error.textContent();
  }

  async useDifferentAccountLink() {
    return this.page.click(this.selectors.LINK_USE_DIFFERENT);
  }

  async getTooltipError() {
    return this.page.innerText(this.selectors.TOOLTIP);
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
      this.page.click(this.selectors.SUBMIT),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }

  async clickForgotPassword() {
    return Promise.all([
      this.page.click(this.selectors.LINK_RESET_PASSWORD),
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
  }

  async isSigninHeader() {
    return this.page.isVisible(this.selectors.SIGNIN_HEADER, {
      timeout: 100,
    });
  }

  async isSyncConnectedHeader() {
    return this.page.isVisible(this.selectors.SYNC_CONNECTED_HEADER, {
      timeout: 100,
    });
  }

  async resetPasswordHeader() {
    const resetPass = this.page.locator(this.selectors.RESET_PASSWORD_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async resetPasswordLinkExpriredHeader() {
    const resetPass = this.page.locator(
      this.selectors.RESET_PASSWORD_EXPIRED_HEADER
    );
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async permissionsHeader() {
    const resetPass = this.page.locator(this.selectors.PERMISSIONS_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async clickDontHaveRecoveryKey() {
    return Promise.all([
      this.page.click(this.selectors.LINK_LOST_RECOVERY_KEY),
      this.page.waitForNavigation(),
    ]);
  }

  setRecoveryKey(key: string) {
    return this.page.fill(this.selectors.TEXT_INPUT, key);
  }

  setAge(age: string) {
    return this.page.fill(this.selectors.AGE, age);
  }

  async setNewPassword(password: string) {
    await this.page.fill(this.selectors.PASSWORD, password);
    await this.page.fill(this.selectors.VPASSWORD, password);
    await this.submit();
  }

  async setTotp(secret: string) {
    const code = await getCode(secret);
    await this.page.fill(this.selectors.NUMBER_INPUT, code);
    await this.submit();
  }

  async getPrefilledEmail() {
    return this.page.innerText(this.selectors.EMAIL_PREFILLED);
  }

  async isCachedLogin() {
    return this.page.isVisible(this.selectors.SUBMIT_USER_SIGNED_IN, {
      timeout: 100,
    });
  }

  async clearCache() {
    return Promise.all([
      this.page.goto(`${this.target.contentServerUrl}/clear`),
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
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
