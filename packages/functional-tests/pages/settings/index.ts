/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, Page } from '@playwright/test';
import {
  AvatarRow,
  ConnectedServicesRow,
  DataCollectionRow,
  DisplayNameRow,
  PasswordRow,
  PrimaryEmailRow,
  RecoveryKeyRow,
  SecondaryEmailRow,
  TotpRow,
  UnitRow,
} from './components/unitRow';
import { SettingsLayout } from './layout';

export class SettingsPage extends SettingsLayout {
  readonly path = 'settings';
  private rows = new Map<string, UnitRow>();

  private lazyRow<T extends UnitRow>(
    id: string,
    RowType: { new (page: Page, id: string): T }
  ): T {
    if (!this.rows.has(id)) {
      this.rows.set(id, new RowType(this.page, id));
    }
    return this.rows.get(id) as T;
  }

  get avatar() {
    return this.lazyRow('avatar', AvatarRow);
  }

  get displayName() {
    return this.lazyRow('display-name', DisplayNameRow);
  }

  get password() {
    return this.lazyRow('password', PasswordRow);
  }

  get primaryEmail() {
    return this.lazyRow('primary-email', PrimaryEmailRow);
  }

  get secondaryEmail() {
    return this.lazyRow('secondary-email', SecondaryEmailRow);
  }

  get recoveryKey() {
    return this.lazyRow('recovery-key', RecoveryKeyRow);
  }

  get totp() {
    return this.lazyRow('two-step', TotpRow);
  }

  get connectedServiceName() {
    return this.page.getByTestId('service-name');
  }

  get connectedServices() {
    return this.lazyRow('connected-services', ConnectedServicesRow);
  }

  get dataCollection() {
    return this.lazyRow('data-collection', DataCollectionRow);
  }

  get deleteAccountButton() {
    return this.page.getByTestId('settings-delete-account');
  }

  async disconnectSync(creds: { uid: string }) {
    await this.goto();
    const services = await this.connectedServices.services();
    const sync = services.find((s) => s.name.includes(' on '));

    await sync?.signout();
    await this.page
      .locator('text=Rather not say >> input[name="reason"]')
      .click();
    await this.modalConfirmButton.click();

    await this.page.evaluate((uid) => {
      window.dispatchEvent(
        new CustomEvent('WebChannelMessageToChrome', {
          detail: JSON.stringify({
            id: 'account_updates',
            message: {
              command: 'fxaccounts:logout',
              data: { uid },
            },
          }),
        })
      );
    }, creds.uid);
  }

  async disconnectTotp() {
    await this.totp.disableButton.click();
    await this.modalConfirmButton.click();

    await expect(this.settingsHeading).toBeVisible();
    await expect(this.alertBar).toHaveText('Two-step authentication disabled');
    await expect(this.totp.status).toHaveText('Disabled');
  }

  /**
   * Confirms the MFA modal (MfaGuard) by retrieving the code from the inbox
   * and submitting it. Use when an action triggers the protected modal.
   *
   * @param email - The account email address to fetch the MFA code for.
   */
  async confirmMfaGuard(email: string) {
    const code =
      await this.target.emailClient.getVerifyAccountChangeCode(email);
    await this.page
      .getByRole('heading', { name: 'Enter confirmation code' })
      .waitFor();
    await this.page
      .getByRole('textbox', { name: 'Enter 6-digit code' })
      .fill(code);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
