import { EmailHeader, EmailType } from '../lib/email';
import { BaseLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';

export const selectors = {
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
  NOTES_HEADER: '#notes-by-firefox',
  MIN_LENGTH_MET: '#password-too-short.password-strength-met',
  MIN_LENGTH_FAIL: '#password-too-short.password-strength-fail',
  NOT_COMMON_FAIL: '#password-too-common.password-strength-fail',
  NOT_COMMON_UNMET: '#password-too-common.password-strength-unmet',
  NOT_COMMON_MET: '#password-too-common.password-strength-met',
  NOT_EMAIL_UNMET: '#password-same-as-email.password-strength-unmet',
  NOT_EMAIL_MET: '#password-same-as-email.password-strength-met',
  NOT_EMAIL_FAIL: '#password-same-as-email.password-strength-fail',
};

export class LoginPage extends BaseLayout {
  readonly path = '';

  readonly selectors = {
    AGE: '#age',
    DATA_TESTID: '[data-testid=logo]',
    EMAIL: 'input[type=email]',
    EMAIL_PREFILLED: '#prefillEmail',
    EMAIL_HEADER: '#fxa-enter-email-header',
    ERROR: '.error',
    LINK_LOST_RECOVERY_KEY: 'a.lost-recovery-key',
    LINK_RESET_PASSWORD: 'a[href^="/reset_password"]',
    LINK_USE_DIFFERENT: '#use-different',
    LINK_USE_RECOVERY_CODE: '#use-recovery-code-link',
    NUMBER_INPUT: 'input[type=number]',
    PASSWORD: '#password',
    PASSWORD_HEADER: '#fxa-signin-password-header',
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
    MIN_LENGTH_MET: '#password-too-short.password-strength-met',
    MIN_LENGTH_FAIL: '#password-too-short.password-strength-fail',
    NOT_COMMON_FAIL: '#password-too-common.password-strength-fail',
    NOT_COMMON_UNMET: '#password-too-common.password-strength-unmet',
    NOT_COMMON_MET: '#password-too-common.password-strength-met',
    NOT_EMAIL_UNMET: '#password-same-as-email.password-strength-unmet',
    NOT_EMAIL_MET: '#password-same-as-email.password-strength-met',
    NOT_EMAIL_FAIL: '#password-same-as-email.password-strength-fail',
  };

  get emailHeader() {
    return this.page.locator(this.selectors.EMAIL_HEADER);
  }

  get passwordHeader() {
    return this.page.locator(this.selectors.PASSWORD_HEADER);
  }

  get tooltip() {
    return this.page.locator(this.selectors.TOOLTIP);
  }

  get submitButton() {
    return this.page.locator(this.selectors.SUBMIT);
  }

  async fillOutEmailFirstSignIn(email, password) {
    await this.setEmail(email);
    await this.submit();
    await this.setPassword(password);
    await this.submit();
  }

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

  async minLengthFailError() {
    const error = this.page.locator(this.selectors.MIN_LENGTH_FAIL);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async minLengthSuccess() {
    const error = this.page.locator(this.selectors.MIN_LENGTH_MET);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notEmailUnmetError() {
    const error = this.page.locator(this.selectors.NOT_EMAIL_UNMET);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notEmailFailError() {
    const error = this.page.locator(this.selectors.NOT_EMAIL_FAIL);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notEmailSuccess() {
    const error = this.page.locator(this.selectors.NOT_EMAIL_MET);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notCommonPasswordUnmetError() {
    const error = this.page.locator(this.selectors.NOT_COMMON_UNMET);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notCommonPasswordSuccess() {
    const error = this.page.locator(this.selectors.NOT_COMMON_MET);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async notCommonPasswordFailError() {
    const error = this.page.locator(this.selectors.NOT_COMMON_FAIL);
    await error.waitFor({ state: 'visible' });
    return error.isVisible();
  }

  async fillOutFirstSignUp(
    email: string,
    password: string,
    verify = true,
    enterEmail = true
  ) {
    if (enterEmail) {
      await this.setEmail(email);
      await this.submit();
    }
    await this.page.fill(selectors.PASSWORD, password);
    await this.page.fill(selectors.VPASSWORD, password);
    await this.page.fill(selectors.AGE, '24');
    await this.submit();
    if (verify) {
      await this.fillOutSignUpCode(email);
    }
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

  async fillOutSignInCode(email: string) {
    const code = await this.target.email.waitForEmail(
      email,
      EmailType.verifyLoginCode,
      EmailHeader.signinCode
    );
    await this.setCode(code);
    await this.submit();
  }

  setEmail(email: string) {
    return this.page.fill(selectors.EMAIL, email);
  }

  setPassword(password: string) {
    return this.page.fill(selectors.PASSWORD, password);
  }

  async clickUseRecoveryCode() {
    return this.page.click(selectors.LINK_USE_RECOVERY_CODE);
  }

  async setCode(code: string) {
    return this.page.fill(selectors.TEXT_INPUT, code);
  }

  async loginHeader() {
    const header = this.page.locator(selectors.DATA_TESTID);
    await header.waitFor();
    return header.isVisible();
  }

  async signInError() {
    const error = this.page.locator(selectors.ERROR);
    await error.waitFor();
    return error.textContent();
  }

  async getUseDifferentAccountLink() {
    return this.page.locator(selectors.LINK_USE_DIFFERENT);
  }

  async useDifferentAccountLink() {
    return this.page.click(selectors.LINK_USE_DIFFERENT);
  }

  async getTooltipError() {
    return this.page.innerText(selectors.TOOLTIP);
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
      this.page.locator(selectors.SUBMIT).click(),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }

  async clickForgotPassword() {
    return Promise.all([
      this.page.locator(selectors.LINK_RESET_PASSWORD).click(),
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
  }

  async isSigninHeader() {
    return this.page.isVisible(selectors.SIGNIN_HEADER, {
      timeout: 100,
    });
  }

  async isSyncConnectedHeader() {
    return this.page.isVisible(selectors.SYNC_CONNECTED_HEADER, {
      timeout: 100,
    });
  }

  async signInPasswordHeader() {
    const header = this.page.locator('#fxa-signin-password-header');
    await header.waitFor();
    return header.isVisible();
  }

  async signUpPasswordHeader() {
    const header = this.page.locator('#fxa-signup-password-header');
    await header.waitFor();
    return header.isVisible();
  }

  async resetPasswordHeader() {
    const resetPass = this.page.locator(selectors.RESET_PASSWORD_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async resetPasswordLinkExpriredHeader() {
    const resetPass = this.page.locator(
      selectors.RESET_PASSWORD_EXPIRED_HEADER
    );
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async permissionsHeader() {
    const resetPass = this.page.locator(selectors.PERMISSIONS_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async notesHeader() {
    const header = this.page.locator(selectors.NOTES_HEADER);
    await header.waitFor();
    return header.isVisible();
  }

  async clickDontHaveRecoveryKey() {
    return Promise.all([
      this.page.locator(selectors.LINK_LOST_RECOVERY_KEY).click(),
      this.page.waitForNavigation(),
    ]);
  }

  setRecoveryKey(key: string) {
    return this.page.fill(selectors.TEXT_INPUT, key);
  }

  setAge(age: string) {
    return this.page.fill(selectors.AGE, age);
  }

  async setNewPassword(password: string) {
    await this.page.fill(selectors.PASSWORD, password);
    await this.page.fill(selectors.VPASSWORD, password);
    await this.submit();
  }

  async setTotp(secret: string) {
    const code = await getCode(secret);
    await this.page.fill(selectors.NUMBER_INPUT, code);
    await this.submit();
  }

  async getPrefilledEmail() {
    return this.page.innerText(selectors.EMAIL_PREFILLED);
  }

  async getEmailInputElement() {
    return this.page.locator(selectors.EMAIL);
  }

  async getEmailInput() {
    return this.page.inputValue(selectors.EMAIL);
  }

  async isCachedLogin() {
    return this.page.isVisible(selectors.SUBMIT_USER_SIGNED_IN, {
      timeout: 1000,
    });
  }

  async clearCache() {
    await this.page.goto(`${this.target.contentServerUrl}/clear`, {
      waitUntil: 'load',
    });
    return this.page.waitForTimeout(1000);
  }

  createEmail(template?: string) {
    if (!template) {
      template = 'signin{id}';
    }
    return template.replace('{id}', Math.random() + '') + '@restmail.net';
  }

  async getStorage() {
    await this.goto();
    return this.page.evaluate((creds) => {
      console.log('getStorage', localStorage.getItem('__fxa_storage.accounts'));
    });
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

  async getAccountFromFromLocalStorage(email: string) {
    return await this.page.evaluate((email) => {
      const accounts: Array<{ email: string; sessionToken: string }> =
        JSON.parse(localStorage.getItem('__fxa_storage.accounts') || '{}');
      return Object.values(accounts).find((x) => x.email === email);
    }, email);
  }

  async destroySession(email: string) {
    const account = await this.getAccountFromFromLocalStorage(email);
    if (account?.sessionToken) {
      return await this.target.auth.sessionDestroy(account.sessionToken);
    }
  }
}
