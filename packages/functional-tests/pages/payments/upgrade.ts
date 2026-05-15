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

  /**
   * Wait for the upgrade page to resolve eligibility and fully render.
   * Waits for the URL to leave /start, the upgrade section to appear,
   * and all content (prorated amount, acknowledgment) to be visible
   * before the caller interacts with the page.
   */
  async waitForUpgradePage(timeout = 60_000) {
    await expect(this.page).not.toHaveURL(/\/start(\?|$)/, { timeout });
    await expect(this.upgradeSection).toBeVisible({ timeout });
    await expect(this.proratedAmount).toBeVisible({ timeout: 15_000 });
    await expect(this.acknowledgmentText).toBeVisible({ timeout: 15_000 });

    // Wait for the Stripe payment element to fully load before
    // interacting with consent or submit. The form isn't ready until
    // Stripe's iframe renders.
    const stripeIframe = this.page.locator(
      'iframe[title*="Secure payment input frame"]:not([tabindex="-1"])'
    );
    await expect(stripeIframe).toBeVisible({ timeout: 30_000 });
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
  async waitForSuccess(timeout = 90_000) {
    await expect(this.page).toHaveURL(
      /success|error|processing|start/,
      { timeout }
    );
    const url = this.page.url();
    if (/error/.test(url)) {
      throw new Error(`Expected success but landed on error page: ${url}`);
    }
    // If still on /processing or /start, wait for a real terminal state
    if (/processing|\/start/.test(url)) {
      await expect(this.page).toHaveURL(/success|error/, { timeout });
      const resolvedUrl = this.page.url();
      if (/error/.test(resolvedUrl)) {
        throw new Error(
          `Expected success but landed on error page: ${resolvedUrl}`
        );
      }
    }
    await expect(this.page).toHaveURL(/success/, { timeout: 30_000 });
    await expect(this.successHeading).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Wait for the eligibility error page to become visible.
   * First waits for any terminal state to avoid hanging for the full
   * timeout if the page lands on /success instead.
   */
  async waitForEligibilityError(timeout = 90_000) {
    await expect(this.page).toHaveURL(
      /success|error|processing|start/,
      { timeout }
    );
    const url = this.page.url();
    if (/success/.test(url)) {
      throw new Error(`Expected error but landed on success page: ${url}`);
    }
    if (/processing|\/start/.test(url)) {
      await expect(this.page).toHaveURL(/success|error/, { timeout });
      const resolvedUrl = this.page.url();
      if (/success/.test(resolvedUrl)) {
        throw new Error(
          `Expected error but landed on success page: ${resolvedUrl}`
        );
      }
    }
    await expect(this.page).toHaveURL(/error/, { timeout: 30_000 });
    await expect(this.errorHeading).toBeVisible({ timeout: 30_000 });
  }
}
