import { BaseLayout } from './layout';
import { LoginPage } from './login';

export const selectors = {
  RESET_PASSWORD_EXPIRED_HEADER: '#fxa-reset-link-expired-header',
  RESET_PASSWORD_HEADER: '#fxa-reset-password-header',
  CONFIRM_RESET_PASSWORD_HEADER: '#fxa-confirm-reset-password-header',
  EMAIL: 'input[type=email]',
  SUBMIT: 'button[type=submit]',
  VPASSWORD: '#vpassword',
  PASSWORD: '#password',
  RESEND_RESET_PASSWORD_LINK: '#resend',
  RESEND_SUCCESS: '.success',
  UNKNOWN_ACCOUNT_ERROR: '.error',
};

export class ResetPasswordPage extends BaseLayout {
  readonly path = '';

  getEmailValue() {
    return this.page.locator(selectors.EMAIL);
  }

  async resetPasswordHeader() {
    const resetPass = this.page.locator(selectors.RESET_PASSWORD_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async confirmResetPasswordHeader() {
    const resetPass = this.page.locator(
      selectors.CONFIRM_RESET_PASSWORD_HEADER
    );
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

  async resetNewPassword(password: string) {
    await this.page.fill(selectors.PASSWORD, password);
    await this.page.fill(selectors.VPASSWORD, password);
    await this.page.locator(selectors.SUBMIT).click();
  }

  async fillOutResetPassword(email) {
    await this.page.fill(selectors.EMAIL, email);
    await this.submit();
  }

  async clickBeginReset() {
    await this.page.locator(selectors.SUBMIT).click();
  }

  async clickResend() {
    await this.page.locator(selectors.RESEND_RESET_PASSWORD_LINK).click();
  }

  async resendSuccessMessage() {
    await this.page.locator(selectors.RESEND_SUCCESS).waitFor();
    return this.page.innerText(selectors.RESEND_SUCCESS);
  }

  async unknownAccountError() {
    await this.page.locator(selectors.UNKNOWN_ACCOUNT_ERROR).waitFor();
    return this.page.innerText(selectors.UNKNOWN_ACCOUNT_ERROR);
  }

  async submit() {
    return Promise.all([
      this.page.locator(selectors.SUBMIT).click(),
      this.page.waitForNavigation({ waitUntil: 'load' }),
    ]);
  }

  async addQueryParamsToLink(link: string, query: object) {
    query = query || {};
    const parsedLink = new URL(link);
    for (const paramName in query) {
      parsedLink.searchParams.set(paramName, query[paramName]);
    }
    return parsedLink.toString();
  }
}
