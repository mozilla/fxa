/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '../../lib/fixtures/standard';
import { SettingsLayout } from './layout';

/**
 * MFA Guard Page Object Model
 */
export class MfaGuardPage extends SettingsLayout {
  readonly path = '';

  get mfaModal() {
    return this.page.getByTestId('modal-verify-session');
  }

  get mfaModalTitle() {
    return this.page.getByRole('heading', { name: 'Enter confirmation code' });
  }

  get confirmationCodeInput() {
    return this.page.locator('input[name="confirmationCode"]');
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  get emailAddress() {
    return this.page.getByText(/Enter the code that was sent to.*@/);
  }

  async waitForMfaModal() {
    await expect(this.mfaModal).toBeVisible();
    await expect(this.mfaModalTitle).toBeVisible();
  }

  async submitConfirmationCode(code: string) {
    await expect(this.confirmationCodeInput).toBeVisible();
    await this.confirmationCodeInput.fill(code);
    await this.confirmButton.click();
  }

  async waitForMfaModalToDisappear() {
    await expect(this.mfaModal).toBeHidden();
  }

  async isMfaModalVisible(): Promise<boolean> {
    try {
      await expect(this.mfaModal).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async getEmailFromModal(): Promise<string> {
    const text = await this.emailAddress.textContent();
    // Extract email from text like "Enter the code that was sent to user@example.com within 5 minutes"
    const match = text?.match(/sent to ([^@\s]+@[^@\s]+\.[^@\s]+)/);
    return match ? match[1] : '';
  }

  async getExpirationTime(): Promise<string> {
    const text = await this.page.getByText(/within \d+ minutes?/).textContent();
    // Extract the time from text like "within 5 minutes"
    const match = text?.match(/within (\d+) minutes?/);
    return match ? match[1] : '';
  }

  // Complete MFA flow helper
  async completeMfaFlow(confirmationCode: string) {
    await this.waitForMfaModal();
    await this.submitConfirmationCode(confirmationCode);
    await this.waitForMfaModalToDisappear();
  }
}
