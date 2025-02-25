/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { ConnectedService } from './connectedService';

export class UnitRow {
  constructor(readonly page: Page, readonly id: string) {}

  get status() {
    return this.page.getByTestId(`${this.id}-unit-row-header-value`);
  }

  async screenshot() {
    const el = await this.page.waitForSelector(
      `[data-testid=${this.id}-unit-row]`
    );
    return el.screenshot();
  }
}

export class AvatarRow extends UnitRow {
  get photo() {
    return this.page
      .getByTestId('settings-profile')
      .getByTestId('avatar-nondefault');
  }

  get addButton() {
    return this.page.getByTestId('avatar-unit-row-route');
  }

  get changeButton() {
    return this.page.getByTestId('avatar-unit-row-route');
  }
}

export class DisplayNameRow extends UnitRow {
  get addButton() {
    return this.page.getByTestId('display-name-unit-row-route');
  }

  get changeButton() {
    return this.page.getByTestId('display-name-unit-row-route');
  }
}

export class PasswordRow extends UnitRow {
  get changeButton() {
    return this.page.getByTestId('password-unit-row-route');
  }
}

export class PrimaryEmailRow extends UnitRow {}

export class SecondaryEmailRow extends UnitRow {
  get addButton() {
    return this.page.getByTestId('secondary-email-unit-row-route');
  }

  get makePrimaryButton() {
    return this.page.getByTestId('secondary-email-make-primary');
  }

  get deleteButton() {
    return this.page.getByTestId('secondary-email-delete');
  }

  get unverifiedText() {
    return this.page.getByTestId('secondary-email-unverified-text');
  }
}

export class RecoveryKeyRow extends UnitRow {
  get createButton() {
    return this.page.getByTestId('recovery-key-unit-row-route');
  }

  get deleteButton() {
    return this.page.getByRole('button', {
      name: 'Delete account recovery key',
    });
  }
}

export class TotpRow extends UnitRow {
  get addButton() {
    return this.page.getByTestId('two-step-unit-row-route');
  }

  get disableButton() {
    return this.page.getByTestId('two-step-disable-button-unit-row-modal');
  }

  get changeButton() {
    return this.page.getByRole('button', { name: 'Create new codes' });
  }

  get addRecoveryPhoneButton() {
    return this.page.getByRole('button', { name: 'Add' });
  }

  get removeRecoveryPhoneButton() {
    return this.page.getByRole('button', { name: 'Remove recovery phone' });
  }
}

export class ConnectedServicesRow extends UnitRow {
  async services() {
    await this.page.waitForSelector('[data-testid=settings-connected-service]');
    const elements = await this.page.$$(
      '[data-testid=settings-connected-service]'
    );
    return Promise.all(
      elements.map((el) => ConnectedService.create(el, this.page))
    );
  }
}

export class DataCollectionRow extends UnitRow {
  getToggleStatus() {
    return this.page
      .locator('[data-testid=metrics-opt-out]')
      .getAttribute('aria-checked');
  }

  async isToggleSwitch() {
    const toggle = this.page.locator('[data-testid=metrics-opt-out]');
    await toggle.waitFor();
    return toggle.isVisible();
  }

  async toggleShareData(action: 'on' | 'off') {
    const toggle = this.page.locator('[data-testid=metrics-opt-out]');
    const checked: string | null = await toggle.getAttribute('aria-checked');
    if (
      (checked === 'true' && action === 'on') ||
      (checked === 'false' && action === 'off')
    ) {
      return;
    }
    return await toggle.click();
  }
}
