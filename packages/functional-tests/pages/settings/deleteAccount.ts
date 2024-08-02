/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { SettingsLayout } from './layout';

export class DeleteAccountPage extends SettingsLayout {
  readonly path = 'settings/delete_account';

  get deleteAccountHeading() {
    return this.page.getByRole('heading', { name: 'Delete account' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 2' });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 2' });
  }

  get passwordTextbox() {
    return this.page.getByRole('textbox', { name: 'password' });
  }

  get deleteButton() {
    return this.page.getByRole('button', { name: 'Delete' });
  }

  get tooltip() {
    return this.page.getByTestId('tooltip');
  }

  async checkAllBoxes() {
    const checkBoxes = this.page.getByTestId('checkbox-container');
    for (let i = 0; i < (await checkBoxes.count()); i++) {
      await checkBoxes.nth(i).click();
    }
  }

  async deleteAccount(password: string) {
    await expect(this.deleteAccountHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    await this.checkAllBoxes();
    await this.continueButton.click();

    await expect(this.step2Heading).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.deleteButton.click();
  }
}
