import { BaseLayout } from './layout';

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
  RESET_PASSWORD_COMPLETE_HEADER: '#fxa-reset-password-complete-header',
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

  async beginResetPasswordHeadingReact() {
    const beginResetPasswordHeading = this.page.getByRole('heading', {
      name: 'Reset password to continue to account settings',
    });
    await beginResetPasswordHeading.waitFor();
    return beginResetPasswordHeading.isVisible();
  }

  async confirmResetPasswordHeader() {
    const resetPass = this.page.locator(
      selectors.CONFIRM_RESET_PASSWORD_HEADER
    );
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async confirmResetPasswordHeadingReact() {
    const confirmResetPasswordHeading = this.page.getByRole('heading', {
      name: 'Reset email sent',
    });
    await confirmResetPasswordHeading.waitFor();
    return confirmResetPasswordHeading.isVisible();
  }

  async hasCompleteResetPasswordHeading(page: BaseLayout['page'] = this.page) {
    const completeResetPasswordHeading = page.getByRole('heading', {
      name: 'Create new password',
    });
    await completeResetPasswordHeading.waitFor();
    return completeResetPasswordHeading.isVisible();
  }

  async resetPasswordConfirmedReact(page: BaseLayout['page'] = this.page) {
    const resetPasswordConfirmedHeading = page.getByRole('heading', {
      name: 'Your password has been reset',
    });
    await resetPasswordConfirmedHeading.waitFor();
    return resetPasswordConfirmedHeading.isVisible();
  }

  async resetPasswordLinkExpiredHeader() {
    const resetPass = this.page.locator(
      selectors.RESET_PASSWORD_EXPIRED_HEADER
    );
    await resetPass.waitFor();
    return resetPass.isVisible();
  }

  async resetNewPassword(
    password: string,
    page: BaseLayout['page'] = this.page
  ) {
    await page.locator(selectors.PASSWORD).fill(password);
    await page.locator(selectors.VPASSWORD).fill(password);
    await page.locator(selectors.SUBMIT).click();
  }

  async submitNewPasswordReact(
    password: string,
    page: BaseLayout['page'] = this.page
  ) {
    await page.getByRole('textbox', { name: 'New password' }).fill(password);
    await page
      .getByRole('textbox', { name: 'Re-enter password' })
      .fill(password);
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

  async addQueryParamsToLink(link: string, query: object) {
    query = query || {};
    const parsedLink = new URL(link);
    for (const paramName in query) {
      parsedLink.searchParams.set(paramName, query[paramName]);
    }
    return parsedLink.toString();
  }
}
