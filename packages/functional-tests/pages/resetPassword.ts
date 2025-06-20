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

  get successBanner() {
    return this.page.getByRole('status');
  }

  get errorBanner() {
    return this.page.getByRole('alert');
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

  get passwordResetSuccessMessage() {
    return this.page.getByText(/Your password has been reset/);
  }

  get passwordResetSuccessRecovyerKeyReminderHeading() {
    return this.page.getByText(/Your password has been reset/);
  }

  get passwordResetSuccessRecovyerKeyReminderMessage() {
    return this.page.getByText('generate a new account recovery key');
  }

  get passwordResetConfirmationContinueButton() {
    return this.page.getByRole('button', {
      name: /^Continue to/,
    });
  }

  get passwordResetPasswordSaved() {
    return this.page.getByText('New password saved!');
  }

  get recoveryKey() {
    return this.page.getByTestId('datablock');
  }

  get recoveryKeyHintHeading() {
    return this.page.getByRole('heading', {
      name: 'Add a hint to help find your key',
    });
  }

  get recoveryKeyHintTextbox() {
    return this.page.getByRole('textbox', { name: 'hint' });
  }

  get recoveryKeyFinishButton() {
    return this.page.getByRole('button', { name: 'Finish' });
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

  get errorBannerBackupCodeLink() {
    return this.page.getByRole('link', {
      name: 'Use backup authentication codes instead?',
    });
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
    await this.page.getByLabel('Enter 6-digit code').fill(code);
    return this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async clickTroubleEnteringCode() {
    return this.page.getByText('Trouble entering code?').click();
  }

  async fillOurRecoveryCodeForm(code: string) {
    await this.page.getByLabel('Enter 10-character code').fill(code);
    return this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async downloadRecoveryKey() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByText('Download and continue').click(),
    ]);
    return download;
  }

  async continueWithoutDownloadingRecoveryKey() {
    return this.page.getByText('Continue without downloading').click();
  }

  // Password reset with recovery phone
  async fillRecoveryPhoneCodeForm(code: string) {
    await this.page.locator('input[name="code"]').fill(code);
  }

  async clickConfirmButton() {
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async clickChoosePhone() {
    await this.page.locator('.input-radio-wrapper').first().click();
  }

  async clickContinueButton() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
