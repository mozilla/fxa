/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export const selectors = {
  RESET_PASSWORD_EXPIRED_HEADER: '#fxa-reset-link-expired-header',
  RESET_PASSWORD_HEADER: '#fxa-reset-password-header',
  CONFIRM_RESET_PASSWORD_HEADER: '#fxa-confirm-reset-password-header',
  COMPLETE_RESET_PASSWORD_HEADER: '#fxa-complete-reset-password-header',
  EMAIL: 'input[type=email]',
  SUBMIT: 'button[type=submit]',
  VPASSWORD: '#vpassword',
  PASSWORD: '#password',
  RESEND_RESET_PASSWORD_LINK: '#resend',
  REMEMBER_PASSWORD: 'text="Remember password? Sign in"',
  RESEND_SUCCESS: '.success',
  UNKNOWN_ACCOUNT_ERROR: '.error',
  RESET_PASSWORD_COMPLETE_HEADER: '#fxa-reset-password-complete-header',
};

export class ResetPasswordPage extends BaseLayout {
  public react = true;
  readonly path = '';

  getEmailValue() {
    return this.page.locator(selectors.EMAIL);
  }

  async resetPasswordHeader(headerTextPartial?: string) {
    if (this.react) {
      const header = await this.page.waitForSelector('#root .card-header');
      const headerText =
        // clean up any special characters and line breaks
        // eslint-disable-next-line no-control-regex
        (await header.textContent())?.replace(/[^\x00-\x7F]/g, '') || '';

      return (
        headerText.startsWith(headerTextPartial || 'Reset password') &&
        (await header.isVisible())
      );
    }

    const resetPass = this.page.locator(selectors.RESET_PASSWORD_HEADER);
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async confirmResetPasswordHeader() {
    const header = this.page.locator(selectors.CONFIRM_RESET_PASSWORD_HEADER);
    await header.waitFor();
  }

  async completeResetPasswordHeader(page: BaseLayout['page'] = this.page) {
    const header = page.locator(selectors.COMPLETE_RESET_PASSWORD_HEADER);
    await header.waitFor();
  }

  async resetPasswordLinkExpiredHeader() {
    const header = this.page.locator(selectors.RESET_PASSWORD_EXPIRED_HEADER);
    await header.waitFor();
  }

  async resetNewPassword(
    password: string,
    page: BaseLayout['page'] = this.page
  ) {
    if (this.react) {
      await page.getByLabel('New password').fill(password);
      await page.getByLabel('Re-enter password').fill(password);
      await page.locator(selectors.SUBMIT).click();
      return;
    }

    await page.locator(selectors.PASSWORD).fill(password);
    await page.locator(selectors.VPASSWORD).fill(password);
    await page.locator(selectors.SUBMIT).click();
  }

  async fillOutResetPassword(email) {
    await this.page.locator(selectors.EMAIL).fill(email);
    await this.submit();
  }

  async clickBeginReset() {
    await this.page.locator(selectors.SUBMIT).click();
  }

  async clickResend() {
    await this.page.locator(selectors.RESEND_RESET_PASSWORD_LINK).click();
  }

  async clickRememberPassword() {
    await this.page.locator(selectors.REMEMBER_PASSWORD).click();
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
    await this.page.locator(selectors.SUBMIT).click();
    await this.page.waitForURL(/confirm_reset_password/);
  }
}
