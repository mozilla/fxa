/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
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

  get settingsHeading() {
    return this.page.getByRole('heading', { name: 'Settings' });
  }

  get accountRecoveryKeyStatus() {
    return this.page.getByTestId('recovery-key-unit-row-header-value');
  }

  get accountRecoveryKeyCreateButton() {
    return this.page.getByTestId('recovery-key-unit-row-route');
  }

  get twoStepAuthenticationStatus() {
    return this.page.getByTestId('two-step-unit-row-header-value');
  }

  get addTwoStepAuthenticationButton() {
    return this.page.getByTestId('two-step-unit-row-route');
  }

  clickDeleteAccount() {
    return Promise.all([
      this.page.locator('[data-testid=settings-delete-account]').click(),
      this.page.waitForEvent('framenavigated'),
    ]);
  }

  async disconnectSync(creds) {
    await this.goto();
    const services = await this.connectedServices.services();
    const sync = services.find((s) => s.name.includes(' on '));

    await sync?.signout();
    await this.page.click('text=Rather not say >> input[name="reason"]');
    await this.clickModalConfirm();

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

  async clickEmailPreferences() {
    const [emailPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator('[data-testid=nav-link-newsletters]').click(),
    ]);
    return emailPage;
  }

  async clickPaidSubscriptions() {
    const [subscriptionPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator('[data-testid=nav-link-subscriptions]').click(),
    ]);
    return subscriptionPage;
  }
}
