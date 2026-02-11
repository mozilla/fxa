/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { SettingsLayout } from './layout';

export class ChangePasswordPage extends SettingsLayout {
  readonly path = 'settings/change_password';

  get changePasswordHeading() {
    return this.page.getByRole('heading', { name: 'Change password' });
  }

  get currentPasswordTextbox() {
    return this.page.getByTestId('current-password-input-field');
  }

  get newPasswordTextbox() {
    return this.page.getByTestId('new-password-input-field');
  }

  get confirmPasswordTextbox() {
    return this.page.getByTestId('verify-password-input-field');
  }

  get passwordError() {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByTestId('icon-invalid') });
  }

  get passwordLengthInvalidIcon() {
    return this.page
      .getByTestId('change-password-length')
      .getByTestId('icon-invalid');
  }

  get passwordLengthUnsetIcon() {
    return this.page
      .getByTestId('change-password-length')
      .getByTestId('icon-unset');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get forgotPasswordLink() {
    return this.page.getByTestId('nav-link-reset-password');
  }

  get tooltip() {
    return this.page.getByTestId('tooltip');
  }

  async fillOutChangePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await expect(this.changePasswordHeading).toBeVisible();

    await this.currentPasswordTextbox.fill(oldPassword);
    await this.newPasswordTextbox.fill(newPassword);
    await this.confirmPasswordTextbox.fill(newPassword);
    await this.saveButton.click();
  }
}
