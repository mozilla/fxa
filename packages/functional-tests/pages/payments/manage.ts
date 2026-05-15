/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';
import { TestCardDefaults } from '../../lib/stripe-test-cards';

export class ManagePage {
  constructor(
    public page: Page,
    readonly target: BaseTarget
  ) {}

  // Page heading

  get subscriptionHeading() {
    return this.page.locator('#subscription-management');
  }

  // Active subscriptions section

  get activeSubscriptionsList() {
    return this.page.locator('ul[aria-label="Your active subscriptions"]');
  }

  getSubscriptionCard(productName: string) {
    return this.page.locator(
      `li[aria-labelledby="${productName}-information"]`
    );
  }

  getProductName(productName: string) {
    return this.page.locator(`#${productName}-information`);
  }

  getPlanInterval(productName: string) {
    return this.getSubscriptionCard(productName).getByText(
      /\/(month|year|week)/i
    );
  }

  // Payment details section

  get paymentDetailsSection() {
    return this.page.locator('#payment-details');
  }

  get paymentMethodLastFour() {
    return this.paymentDetailsSection.getByText(/Card ending in \d{4}/);
  }

  get paymentMethodIcon() {
    return this.paymentDetailsSection.locator('img');
  }

  get managePaymentButton() {
    return this.page.locator(
      'a[aria-label="Manage payment method"]'
    );
  }

  // Empty state

  get emptyStateMessage() {
    return this.page.getByText('You have no active subscriptions');
  }

  // Subscription actions

  cancelButton() {
    return this.page.getByRole('link', {
      name: /Cancel your subscription to/i,
    });
  }

  staySubscribedButton() {
    return this.page.getByRole('link', {
      name: /Stay subscribed to/i,
    });
  }

  // Cancelled status

  get cancelledStatus() {
    return this.activeSubscriptionsList.getByText(/Expires on/);
  }

  // Actions

  /**
   * Navigate to the subscriptions landing page, which triggers
   * FXA auth and redirects to the manage page.
   */
  async goto(locale = 'en') {
    await this.page.goto(
      `${this.target.paymentsNextUrl}/${locale}/subscriptions/landing`
    );
  }

  /**
   * Wait for the manage page to fully load.
   */
  async waitForManagePage(timeout = 60_000) {
    await expect(this.subscriptionHeading).toBeVisible({ timeout });
    // Wait for either the subscription list or the empty-state message to
    // render, so callers don't race against async API responses.
    await expect(
      this.activeSubscriptionsList.or(this.emptyStateMessage)
    ).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Navigate to the Stripe payment management page, fill a new card,
   * and save it. Waits for redirect back to the manage page.
   *
   * Uses pressSequentially inside the Stripe iframe since Stripe's
   * internal event handlers require real keystrokes to register
   * field completion.
   */
  async updatePaymentMethod(
    cardNumber: string,
    exp = `${TestCardDefaults.EXP_MONTH}/${String(TestCardDefaults.EXP_YEAR).slice(-2)}`,
    cvc = TestCardDefaults.CVC,
    zip = '10001'
  ) {
    // Navigate to the Stripe payment management page
    await this.page.goto(
      `${this.target.paymentsNextUrl}/en/subscriptions/payments/stripe`
    );
    await expect(this.page).toHaveURL(/payments\/stripe/, { timeout: 30_000 });

    // Wait for the Stripe PaymentElement iframe.
    // Stripe may render multiple iframes — use .first() for the visible one.
    const stripeIframe = this.page
      .locator('iframe[title*="Secure payment input frame"]')
      .first();
    await expect(stripeIframe).toBeVisible({ timeout: 30_000 });

    const stripeFrame = this.page
      .frameLocator('iframe[title*="Secure payment input frame"]')
      .first();

    // Expand the card form in the accordion
    await stripeFrame.getByRole('button', { name: 'Card' }).click();

    // Fill card fields
    const fields: Array<{ locator: ReturnType<typeof stripeFrame.locator>; value: string }> = [
      { locator: stripeFrame.locator('[autocomplete="cc-number"]'), value: cardNumber },
      { locator: stripeFrame.locator('[autocomplete="cc-exp"]'), value: exp },
      { locator: stripeFrame.locator('[autocomplete="cc-csc"]'), value: cvc },
      {
        locator: stripeFrame.locator(
          '[autocomplete="postal-code"], [name="postalCode"], [name="zip"]'
        ),
        value: zip,
      },
    ];

    for (const { locator, value } of fields) {
      await expect(locator).toBeAttached({ timeout: 10_000 });
      // Triple-click to select all existing text, then type to replace.
      // Stripe iframes use custom elements where fill('') may not work.
      await locator.click({ clickCount: 3 });
      await locator.pressSequentially(value, { delay: 50 });
    }

    // Wait for Stripe's onChange to propagate complete:true, then save
    const saveButton = this.page.getByRole('button', {
      name: /Save payment method/i,
    });
    await expect(saveButton).toBeVisible({ timeout: 10_000 });
    await expect(saveButton).not.toHaveAttribute('aria-disabled', 'true', {
      timeout: 30_000,
    });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for Stripe to process the save and redirect back to manage.
    // The redirect can be slow or fail entirely, so fall back to manual
    // navigation after a reasonable wait.
    try {
      await expect(this.page).toHaveURL(/subscriptions\/manage/, {
        timeout: 60_000,
      });
    } catch {
      // Redirect didn't happen — navigate manually. The save may still
      // have succeeded; the test verifies via the card last-four assertion.
      await this.goto();
      await this.waitForManagePage();
    }
  }
}
