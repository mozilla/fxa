/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '../../lib/fixtures/standard';
import { SettingsLayout } from './layout';

export class RecoveryPhoneSetupPage extends SettingsLayout {
  get path(): string {
    return '';
  }

  // Methods for AddRecoveryPhone
  addHeader() {
    return this.page.locator('h2', { hasText: 'Verify your phone number' });
  }

  get phoneNumberInput() {
    return this.page.locator('input[name="phoneNumber"]');
  }

  get sendCodeButton() {
    return this.page.locator('button', { hasText: 'Send code' });
  }

  get addErrorBanner() {
    return this.page.locator('#flow-setup-phone-submit-number-error');
  }

  get backButton() {
    return this.page.locator('button', { hasText: 'Back to settings' });
  }

  get status() {
    return this.page.getByTestId('backup-recovery-phone-status');
  }

  async enterPhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.fill(phoneNumber);
  }

  async clickSendCode() {
    await this.sendCodeButton.click();
  }

  async expectAddErrorBanner(message: string) {
    await expect(this.addErrorBanner).toHaveText(message);
  }

  // Methods for ConfirmRecoveryPhone
  get confirmHeader() {
    return this.page.locator('h2', { hasText: 'Enter verification code' });
  }

  get codeInput() {
    return this.page.locator('input[name="code"]');
  }

  get confirmButton() {
    return this.page.locator('button', { hasText: 'Confirm' });
  }

  get resendCodeButton() {
    return this.page.locator('button', { hasText: 'Resend code' });
  }

  get confirmErrorBanner() {
    return this.page.locator('#flow-setup-phone-confirm-code-error');
  }

  async enterCode(code: string) {
    await this.codeInput.fill(code);
  }

  async clickConfirm() {
    await this.confirmButton.click();
  }

  async clickResendCode() {
    await this.resendCodeButton.click();
  }

  /**
   * Enters the target's test phone number and clicks `Send Code`
   */
  async submitPhoneNumber() {
    await this.page.waitForURL(/recovery_phone\/setup/);
    await expect(this.addHeader()).toBeVisible();
    await this.enterPhoneNumber(this.target.smsClient.getPhoneNumber());
    await this.clickSendCode();
  }

  /**
   * Enters provided code and clicks submit
   * @param code
   */
  async submitCode(code: string) {
    await expect(this.confirmHeader).toBeVisible();
    await this.enterCode(code);
    await this.clickConfirm();
  }
}
