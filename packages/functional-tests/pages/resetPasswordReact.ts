import { expect } from '@playwright/test';
import { getReactFeatureFlagUrl } from '../lib/react-flag';
import { BaseLayout } from './layout';

export class ResetPasswordReactPage extends BaseLayout {
  readonly path = '';

  get resetPasswordHeading() {
    return (
      this.page
        .getByRole('heading', { name: /^Reset password/ })
        // for password reset redesign, with resetPasswordWithCode flag
        .or(this.page.getByRole('heading', { name: /^Password reset/ }))
    );
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  get beginResetButton() {
    return (
      this.page
        .getByRole('button', { name: 'Begin reset' })
        // for password reset redesign, with resetPasswordWithCode flag
        .or(
          this.page.getByRole('button', { name: 'Send me reset instructions' })
        )
    );
  }

  get confirmResetPasswordHeading() {
    return (
      this.page
        .getByRole('heading', { name: 'Reset email sent' })
        // for password reset redesign, with resetPasswordWithCode flag
        .or(this.page.getByRole('heading', { name: 'Enter confirmation code' }))
    );
  }

  get resendButton() {
    return this.page
      .getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      }) // for password reset redesign, with resetPasswordWithCode flag
      .or(this.page.getByRole('button', { name: 'Resend code' }));
  }

  get statusBar() {
    return this.page.getByRole('status');
  }

  get createNewPasswordHeading() {
    return this.page.getByRole('heading', { name: 'Create new password' });
  }

  get generateRecoveryKeyButton() {
    return this.page.getByRole('button', {
      name: 'Generate a new account recovery key',
    });
  }

  get newPasswordHeading() {
    return this.page.getByRole('heading', { name: 'Create new password' });
  }

  get newPasswordTextbox() {
    return this.page.getByRole('textbox', { name: 'New password' });
  }

  get reenterPasswordTextbox() {
    return this.page.getByRole('textbox', { name: 'Re-enter password' });
  }

  get resetPasswordButton() {
    return this.page.getByRole('button', { name: 'Reset password' });
  }

  get passwordResetConfirmationHeading() {
    return this.page.getByRole('heading', {
      name: 'Your password has been reset',
    });
  }

  get confirmRecoveryKeyHeading() {
    return this.page.getByRole('heading', {
      name: 'Reset password with account recovery key',
    });
  }

  get recoveryKeyTextbox() {
    return this.page.getByRole('textbox', {
      name: 'Enter account recovery key',
    });
  }

  get confirmRecoveryKeyButton() {
    return this.page.getByRole('button', {
      name: 'Confirm account recovery key',
    });
  }

  get forgotKeyLink() {
    return this.page.getByRole('link', {
      name: 'Don’t have an account recovery key?',
    });
  }

  goto(route = '/reset_password', query?: string) {
    return this.page.goto(getReactFeatureFlagUrl(this.target, route, query));
  }

  async fillOutNewPasswordForm(password: string) {
    await expect(this.newPasswordHeading).toBeVisible();

    await this.newPasswordTextbox.fill(password);
    await this.reenterPasswordTextbox.fill(password);
    await this.resetPasswordButton.click();
  }

  async fillOutRecoveryKeyForm(key: string) {
    await expect(this.confirmRecoveryKeyHeading).toBeVisible();

    await this.recoveryKeyTextbox.fill(key);
    await this.confirmRecoveryKeyButton.click();
  }

  async fillOutEmailForm(email: string): Promise<void> {
    await expect(this.resetPasswordHeading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.beginResetButton.click();
  }
}
