/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';

export class ResetPasswordPage extends BaseLayout {
  readonly path = '';

  get resetPasswordHeading() {
    return (
      this.page
        // TODO in FXA-9728, remove the second option in regex
        // (support for reset password with link)
        .getByRole('heading', {
          name: /^(?:Reset your password|Reset password)/,
        })
    );
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  get beginResetButton() {
    return (
      this.page
        // TODO in FXA-9728, remove the second option in regex
        // (support for reset password with link)
        .getByRole('button', {
          name: /^(?:Send me reset instructions|Begin reset)/,
        })
    );
  }

  get confirmResetPasswordHeading() {
    return (
      this.page
        // TODO in FXA-9728, remove the second option in regex
        // (support for reset password with link)
        .getByRole('heading', {
          name: /^(?:Check your email|Reset email sent)/,
        })
    );
  }

  get resendButton() {
    return (
      this.page
        // TODO in FXA-9728, remove the second option in regex
        // (support for reset password with link)
        .getByRole('button', {
          name: /^(?:Resend code|Not in inbox or spam folder)/,
        })
    );
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
    return this.page.getByRole('heading', { name: 'Create a new password' });
  }

  get newPasswordTextbox() {
    return this.page.getByRole('textbox', { name: 'New password' });
  }

  get newPasswordInput() {
    return this.page.getByTestId('new-password-input-container');
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

  get dataLossWarning() {
    return this.page.getByText(
      'Resetting your password may delete your encrypted browser data.'
    );
  }

  get resetPasswordWithRecoveryKey() {
    return this.page.getByRole('link', {
      name: 'Reset your password with your recovery key.',
    });
  }

  get forgotKeyLink() {
    return this.page.getByRole('link', {
      name: 'Don’t have an account recovery key?',
    });
  }

  get confirmationCodeFirstInput() {
    return this.page.getByRole('textbox').first();
  }

  get confirmationCodeSubmitButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  goto(route = '/reset_password', query?: string) {
    const url = query
      ? `${this.target.contentServerUrl}${route}?${query}`
      : `${this.target.contentServerUrl}${route}`;
    return this.page.goto(url);
  }

  async fillOutEmailForm(email: string): Promise<void> {
    await expect(this.resetPasswordHeading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.beginResetButton.click();
  }

  async fillOutNewPasswordForm(password: string, submit = true) {
    await expect(this.newPasswordHeading).toBeVisible();

    await this.newPasswordTextbox.fill(password);
    await this.reenterPasswordTextbox.fill(password);

    if (submit) {
      await this.resetPasswordButton.click();
    }
  }

  async fillOutRecoveryKeyForm(key: string) {
    await expect(this.confirmRecoveryKeyHeading).toBeVisible();

    await this.recoveryKeyTextbox.fill(key);
    await this.confirmRecoveryKeyButton.click();
  }

  async fillOutResetPasswordCodeForm(code: string) {
    await expect(this.confirmResetPasswordHeading).toBeVisible();
    // using .pressSequentially() instead of .fill()
    // because of onChange handling on the code input component
    // that distributes typed text or pasted text between single digit inputs
    await this.confirmationCodeFirstInput.pressSequentially(code);
    await this.confirmationCodeSubmitButton.click();
  }
}
