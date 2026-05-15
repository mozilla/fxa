/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';

export class CancelPage {
  constructor(
    public page: Page,
    readonly target: BaseTarget
  ) {}

  // Cancel confirmation page

  get cancelHeading() {
    return this.page.locator('#cancel-subscription-heading');
  }

  get confirmCheckbox() {
    return this.page.locator('input#cancelAccess[type="checkbox"]');
  }

  get submitCancelButton() {
    return this.page.getByRole('button', {
      name: /Cancel your subscription to/i,
    });
  }

  get keepSubscriptionButton() {
    return this.page.getByRole('link', { name: /Keep subscription/i });
  }

  // Already-cancelled state

  get expirationDate() {
    return this.page.getByText(/You will still have access .* until/);
  }

  get productName() {
    return this.cancelHeading;
  }

  // Error state

  get errorMessage() {
    return this.page.locator('[role="alert"]');
  }

  // Actions

  /**
   * Check the acknowledge checkbox and click the cancel button.
   */
  async confirmAndCancel() {
    await expect(this.confirmCheckbox).toBeVisible({ timeout: 10_000 });
    await this.confirmCheckbox.click();
    await expect(this.confirmCheckbox).toBeChecked();
    await this.submitCancelButton.click();
    await expect(this.submitCancelButton).toBeDisabled({ timeout: 30_000 });
  }

  /**
   * Wait for the already-cancelled confirmation state.
   */
  async waitForCancelConfirmation(timeout = 30_000) {
    await expect(this.page.getByText(/sorry to see you go/i)).toBeVisible({
      timeout,
    });
  }
}
