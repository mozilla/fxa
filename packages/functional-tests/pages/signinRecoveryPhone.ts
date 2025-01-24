/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninRecoveryPhonePage extends BaseTokenCodePage {
  readonly path = '/signin_recovery_phone';

  get codeInput() {
    this.checkPath();
    return this.page
      .getByLabel('Enter 6-digit code') // React
      .or(this.page.getByPlaceholder('Enter 6-digit code')); // Backbone
  }

  get resendCodeButton() {
    return this.page.getByRole('button', { name: 'Resend code' });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  get backButton() {
    return this.page.getByRole('button', { name: 'Back' });
  }

  get lockedOutLink() {
    return this.page.getByRole('link', { name: 'Are you locked out?' });
  }

  async enterCode(code: string) {
    await this.codeInput.fill(code);
  }

  async clickResendCode() {
    await this.resendCodeButton.click();
  }

  async clickConfirm() {
    await this.confirmButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickLockedOutLink() {
    await this.lockedOutLink.click();
  }
}
