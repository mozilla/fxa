/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';

/**
 * Shared locators and actions used by both CheckoutPage and UpgradePage.
 * These map to DOM elements that appear on multiple payment flow pages
 * (consent checkbox, success/error sections).
 */
export class BasePaymentPage {
  constructor(
    public page: Page,
    readonly target: BaseTarget
  ) {}

  // Consent checkbox (shared CheckoutForm component)

  get consentCheckbox() {
    return this.page.locator(
      'input[type="checkbox"][name="confirm"][aria-required]'
    );
  }

  // Success page

  get successHeading() {
    return this.page.locator('#subscription-confirmation-heading');
  }

  get invoiceNumber() {
    return this.page.getByText(/Invoice #/);
  }

  get successActionButton() {
    return this.page
      .locator('section[aria-labelledby="subscription-confirmation-heading"]')
      .locator('a[role="button"]');
  }

  // Error page

  get errorHeading() {
    return this.page.locator('#page-information-heading');
  }

  get errorButton() {
    return this.page.getByRole('link', {
      name: /Contact Support|Manage my subscription|Try again/i,
    });
  }

  // Shared actions

  /**
   * Wait for a subscription to be fully provisioned after a successful
   * checkout. The success page appears once Stripe confirms the payment,
   * but the webhook that creates the subscription record on the server
   * may still be in-flight. Multi-step tests (upgrade, duplicate) must
   * call this before navigating to step 2 to avoid a race where the
   * eligibility check doesn't yet see the new subscription.
   *
   * Polls the success action button's href until it resolves (confirming
   * the page is stable) then waits a short buffer for webhook delivery.
   */
  async waitForSubscriptionProvisioned() {
    await expect(this.successActionButton).toBeVisible({ timeout: 10_000 });
    // Brief buffer for Stripe webhook to deliver and the server to
    // persist the subscription. 5s is conservative; webhooks typically
    // arrive within 1-2s in test environments.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(5_000);
  }

  /**
   * Check the consent checkbox. Waits for it to become interactive
   * before clicking.
   */
  async checkConsent() {
    await expect(this.consentCheckbox).toBeVisible({ timeout: 10_000 });
    await expect(this.consentCheckbox).not.toHaveAttribute(
      'aria-disabled',
      'true',
      { timeout: 10_000 }
    );
    await this.consentCheckbox.click();
    await expect(this.consentCheckbox).toBeChecked();
  }
}
