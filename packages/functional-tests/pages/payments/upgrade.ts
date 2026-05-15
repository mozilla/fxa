/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BasePaymentPage } from './base';

export class UpgradePage extends BasePaymentPage {
  // Upgrade-specific locators

  get upgradeSection() {
    return this.page.getByTestId('subscription-upgrade');
  }

  get proratedAmount() {
    return this.page.getByTestId('amount-due');
  }

  get acknowledgmentText() {
    return this.page.getByTestId('sub-update-acknowledgment');
  }

  get confirmUpgradeButton() {
    return this.page.getByRole('button', { name: /Subscribe Now/i });
  }

  // Actions

  /**
   * Click the Subscribe Now button to confirm upgrade. Waits for it to
   * be enabled (aria-disabled="false") before clicking.
   */
  async confirmUpgrade() {
    await expect(this.confirmUpgradeButton).toHaveAttribute(
      'aria-disabled',
      'false',
      { timeout: 30_000 }
    );
    await this.confirmUpgradeButton.click();
  }

  /**
   * Wait for the upgrade success page heading to become visible.
   * First waits for any terminal state to avoid hanging for the full
   * timeout if the page lands on /error instead.
   */
  async waitForSuccess(timeout = 60_000) {
    await expect(this.page).toHaveURL(/success|error/, { timeout });
    await expect(this.page).toHaveURL(/success/, { timeout: 15_000 });
    await expect(this.successHeading).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Wait for the eligibility error page to become visible.
   * First waits for any terminal state to avoid hanging for the full
   * timeout if the page lands on /success instead.
   */
  async waitForEligibilityError(timeout = 60_000) {
    await expect(this.page).toHaveURL(/success|error/, { timeout });
    await expect(this.page).toHaveURL(/error/, { timeout: 15_000 });
    await expect(this.errorHeading).toBeVisible({ timeout: 10_000 });
  }
}
