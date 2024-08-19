/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { SettingsLayout } from './layout';

export class SecondaryEmailPage extends SettingsLayout {
  readonly path = 'settings/emails';

  get secondaryEmailHeading() {
    return this.page.getByRole('heading', { name: 'Secondary email' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 2' });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 2' });
  }

  get verificationCodeTextbox() {
    return this.page.getByTestId('verification-code-input-field');
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'confirm' });
  }

  async submit() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.saveButton.click();
    return waitForNavigation;
  }

  async fillOutEmail(email: string): Promise<void> {
    await expect(this.secondaryEmailHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.saveButton.click();
  }

  async fillOutVerificationCode(code: string): Promise<void> {
    await expect(this.step2Heading).toBeVisible();

    await this.verificationCodeTextbox.fill(code);
    await this.confirmButton.click();
  }
}
