/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SettingsLayout } from './layout';

export class DeleteSyncDataPage extends SettingsLayout {
  readonly path = 'settings/delete_sync_data';

  get passwordHeading() {
    return this.page.getByRole('heading', {
      name: 'Re-enter your password for security',
    });
  }

  get passwordTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter your password' });
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get devicesHeading() {
    return this.page.getByRole('heading', { name: 'Delete synced data?' });
  }

  get signOutAllCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Sign out of Firefox' });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  /** Reads "Delete" or "Delete and sign out" depending on the checkboxes. */
  get deleteButton() {
    return this.page.getByTestId('delete-sync-data-confirm');
  }

  async fillOutPassword(password: string) {
    await this.passwordHeading.waitFor();
    await this.passwordTextbox.fill(password);
    await this.continueButton.click();
    await this.devicesHeading.waitFor();
  }
}
