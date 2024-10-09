/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';

export class ResetPasswordPage extends BaseLayout {
  readonly path = '';

  get resetPasswordHeading() {
    return this.page.getByRole('heading', {
      name: /^Reset your password/,
    });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  get beginResetButton() {
    return this.page.getByRole('button', {
      name: /Continue/,
    });
  }

  get confirmResetPasswordHeading() {
    return this.page.getByRole('heading', {
      name: /^Check your email/,
    });
  }

  get resendButton() {
    return this.page.getByRole('button', {
      name: /^Resend code/,
    });
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
    return this.page.getByRole('textbox', { name: 'Confirm password' });
  }

  get resetPasswordButton() {
    return this.page.getByRole('button', { name: 'Create new password' });
  }

  get passwordResetConfirmationHeading() {
    return this.page.getByRole('heading', {
      name: 'Your password has been reset',
    });
  }

  get confirmRecoveryKeyHeading() {
    return this.page.getByRole('heading', {
      name: 'Enter your account recovery key',
    });
  }

  get recoveryKeyTextbox() {
    return this.page.getByRole('textbox', {
      name: 'Enter your 32-character account recovery key',
    });
  }

  get confirmRecoveryKeyButton() {
    return this.page.getByRole('button', {
      name: 'Continue',
    });
  }

  get dataLossWarning() {
    return this.page.getByText('Your browser data may not be recovered');
  }

  get resetPasswordWithRecoveryKey() {
    return this.page.getByRole('link', {
      name: 'Reset your password and keep your data',
    });
  }

  get forgotKeyLink() {
    return this.page.getByRole('link', {
      name: 'Can’t find your account recovery key?',
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

  async fillOutTotpForm(code: string) {
    await this.page.getByLabel('Enter code').fill(code);
    return this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async clickTroubleEnteringCode() {
    return this.page.getByText('Trouble entering code?').click();
  }

  async fillOurRecoveryCodeForm(code: string) {
    await this.page
      .getByLabel('Enter 10-digit backup authentication code')
      .fill(code);
    return this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
