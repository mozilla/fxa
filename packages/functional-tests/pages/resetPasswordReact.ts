import { getReactFeatureFlagUrl } from '../lib/react-flag';
import { BaseLayout } from './layout';

export class ResetPasswordReactPage extends BaseLayout {
  readonly path = '';

  goto(route = '/reset_password', query?: string) {
    return this.page.goto(getReactFeatureFlagUrl(this.target, route, query));
  }

  // page can be passed in as an optional prop - useful when a test uses more than one page
  getEmailValue(page: BaseLayout['page'] = this.page) {
    return page.getByRole('textbox', { name: 'Email' }).inputValue();
  }

  async resetPasswordHeadingVisible(page: BaseLayout['page'] = this.page) {
    const heading = page.getByRole('heading', {
      // Full heading might include "continue to [relying party]"
      name: /Reset password/,
    });
    await heading.waitFor();
  }

  async confirmResetPasswordHeadingVisible(
    page: BaseLayout['page'] = this.page
  ) {
    const heading = page.getByRole('heading', {
      name: 'Reset email sent',
    });
    await heading.waitFor();
  }

  async completeResetPwdHeadingVisible(page: BaseLayout['page'] = this.page) {
    const heading = page.getByRole('heading', {
      name: 'Create new password',
    });
    await heading.waitFor();
  }

  async resetPwdConfirmedHeadingVisible(page: BaseLayout['page'] = this.page) {
    const heading = page.getByRole('heading', {
      name: 'Your password has been reset',
    });
    await heading.waitFor();
  }

  async confirmRecoveryKeyHeadingVisible(page: BaseLayout['page'] = this.page) {
    const heading = page.getByRole('heading', {
      name: 'Reset password with account recovery key',
    });
    await heading.waitFor();
  }

  async resetPwdLinkExpiredHeadingVisible(
    page: BaseLayout['page'] = this.page
  ) {
    const heading = page.getByRole('heading', {
      name: 'Reset password link expired',
    });
    await heading.waitFor();
  }

  async submitNewPassword(
    password: string,
    page: BaseLayout['page'] = this.page
  ) {
    await page.getByRole('textbox', { name: 'New password' }).fill(password);
    await page
      .getByRole('textbox', { name: 'Re-enter password' })
      .fill(password);
    await page.getByRole('button', { name: 'Reset password' }).click();
  }

  async submitRecoveryKey(key: string, page: BaseLayout['page'] = this.page) {
    const recoveryKeyInput = page.getByRole('textbox');
    const submitButton = page.getByRole('button');
    await recoveryKeyInput.fill(key);
    await submitButton.click();
  }

  async fillEmailToResetPwd(email, page: BaseLayout['page'] = this.page) {
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Begin reset' }).click();
  }

  async clickResendLink(page: BaseLayout['page'] = this.page) {
    const resendLink = page.getByRole('link', {
      name: 'Not in inbox or spam folder? Resend',
    });
    await resendLink.waitFor();
    await resendLink.click();
  }

  async resendSuccessMessageVisible(page: BaseLayout['page'] = this.page) {
    await page.getByText(/Email re-sent/).waitFor();
  }

  async unknownAccountError(page: BaseLayout['page'] = this.page) {
    await page.getByText('Unknown account').waitFor();
  }

  async addQueryParamsToLink(link: string, query: object) {
    query = query || {};
    const parsedLink = new URL(link);
    for (const paramName in query) {
      parsedLink.searchParams.set(paramName, query[paramName]);
    }
    return parsedLink.toString();
  }

  async clickDontHaveRecoveryKey(page: BaseLayout['page'] = this.page) {
    const forgotKeyLink = page.getByRole('link', {
      name: 'Don’t have an account recovery key?',
    });
    await forgotKeyLink.waitFor();
    await forgotKeyLink.click();
  }
}
