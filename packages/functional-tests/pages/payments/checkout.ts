/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { TestCardDefaults } from '../../lib/stripe-test-cards';
import { BasePaymentPage } from './base';

export class CheckoutPage extends BasePaymentPage {
  // Start page — sign-in section (unauthenticated only)

  get signinHeading() {
    return this.page.getByRole('heading', { name: /Sign in or create/ });
  }

  get emailInput() {
    return this.page.getByTestId('email');
  }

  get signInContinueButton() {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }

  // Start page — payment section

  get paymentHeading() {
    return this.page.getByTestId('header');
  }

  get subscribeButton() {
    return this.page.getByRole('button', { name: /Subscribe Now/i });
  }

  // Stripe PaymentElement (iframe matched by URL, same approach as legacy tests)

  private get stripeFrame() {
    // Stripe renders multiple iframes with similar titles; the hidden
    // helper iframe has tabindex="-1". Target only the interactive one.
    return this.page.frameLocator(
      'iframe[title*="Secure payment input frame"]:not([tabindex="-1"])'
    );
  }

  get cardNumberInput() {
    return this.stripeFrame.locator('[autocomplete="cc-number"]');
  }

  get cardExpiryInput() {
    return this.stripeFrame.locator('[autocomplete="cc-exp"]');
  }

  get cardCvcInput() {
    return this.stripeFrame.locator('[autocomplete="cc-csc"]');
  }

  get postalCodeInput() {
    return this.stripeFrame.locator(
      '[autocomplete="postal-code"], [name="postalCode"], [name="zip"]'
    );
  }

  get stripeLinkCheckbox() {
    return this.stripeFrame.getByText(/Save (?:my )?information for/i);
  }

  // Location page (shown when geolocation can't determine tax address)

  get locationHeading() {
    return this.page.locator('#location-page-heading');
  }

  get countrySelect() {
    return this.page.locator('select[name="countryCode"]');
  }

  get locationPostalCodeInput() {
    return this.page.getByTestId('postal-code');
  }

  get locationSaveButton() {
    return this.page.getByTestId('tax-location-save-button');
  }

  /**
   * Handle the location page if shown, then wait for the sign-in form.
   * When geolocation can't resolve the user's location (e.g. CI),
   * the flow goes: /new → /location → fill country/zip → /new → /start.
   * When geolocation works (local), it goes directly to /start.
   */
  async handleLocationIfNeeded(country = 'US', postalCode = '10001') {
    // Wait for the URL to settle on either /location or a page with the
    // sign-in heading. Checking the URL is more reliable than .or() on
    // two elements, which can resolve on a briefly-visible element that
    // disappears during a redirect.
    await this.page.waitForURL(
      (url) =>
        url.pathname.includes('/location') || url.pathname.includes('/start'),
      { timeout: 90_000, waitUntil: 'domcontentloaded' }
    );

    if (this.page.url().includes('/location')) {
      await expect(this.locationHeading).toBeVisible({ timeout: 10_000 });
      await this.countrySelect.selectOption(country);
      await this.locationPostalCodeInput.fill(postalCode);
      await this.locationSaveButton.click();
      // After location submit, wait for redirect to checkout with sign-in
      await expect(this.signinHeading).toBeVisible({ timeout: 30_000 });
    } else {
      await expect(this.signinHeading).toBeVisible({ timeout: 30_000 });
    }
  }

  /**
   * Wait for the payment page to be fully loaded after an auth redirect.
   * Ensures the redirect chain (FXA → OAuth → payments) has settled and
   * the page has finished loading before interacting with payment elements.
   */
  async waitForPaymentReady(timeout = 60_000) {
    await expect(this.paymentHeading).toBeVisible({ timeout });
    await this.page.waitForLoadState('load');
  }

  // Actions

  /**
   * Wait for the Stripe iframe and card number field to be ready.
   * Retries until the frame exists and the field is visible.
   */
  async waitForStripeReady() {
    const stripeIframe = this.page.locator(
      'iframe[title*="Secure payment input frame"]:not([tabindex="-1"])'
    );
    await expect(stripeIframe).toBeVisible({ timeout: 30_000 });
    await stripeIframe.scrollIntoViewIfNeeded();
    await expect(this.cardNumberInput).toBeAttached({ timeout: 10_000 });
  }

  /**
   * Fill Stripe PaymentElement card fields inside the iframe.
   * Uses pressSequentially to simulate real keystrokes, which
   * Stripe's internal event handlers require to register field
   * completion (fill() sets value synthetically and Stripe may
   * not detect it).
   */
  private async typeInStripeField(
    locator: ReturnType<typeof this.stripeFrame.locator>,
    value: string
  ) {
    // Wait for the field to be editable before interacting — the Stripe
    // iframe may still be wiring up event handlers or may have remounted.
    await expect(locator).toBeEditable({ timeout: 10_000 });
    await locator.click();
    await locator.pressSequentially(value, { delay: 50 });
  }

  /**
   * Fill card fields and uncheck Stripe Link.
   * Link always auto-checks after card details are filled, revealing
   * additional email/phone fields. This method unchecks it for the
   * standard (non-Link) checkout flow.
   */
  async fillCard(
    number: string,
    exp = `${TestCardDefaults.EXP_MONTH}/${String(TestCardDefaults.EXP_YEAR).slice(-2)}`,
    cvc = TestCardDefaults.CVC,
    zip = '10001'
  ) {
    // Re-verify the Stripe iframe is ready (it may remount after
    // the consent checkbox toggles the PaymentElement out of readOnly)
    await this.waitForStripeReady();

    // Wait for the card number field to be editable — Stripe's internal
    // JS may still be wiring up event handlers after the iframe appears.
    await expect(this.cardNumberInput).toBeEditable({ timeout: 10_000 });

    await this.typeInStripeField(this.cardNumberInput, number);
    await this.typeInStripeField(this.cardExpiryInput, exp);
    await this.typeInStripeField(this.cardCvcInput, cvc);
    await this.typeInStripeField(this.postalCodeInput, zip);

    // Link may auto-check after card fill — uncheck if present.
    // Stripe A/B tests this feature so it may not always appear.
    try {
      await this.stripeLinkCheckbox.waitFor({
        state: 'visible',
        timeout: 5_000,
      });
      await this.stripeLinkCheckbox.click();
    } catch {
      // Stripe Link checkbox not shown — no action needed
    }
  }

  /**
   * Click the Subscribe Now button. Waits for it to be enabled
   * (aria-disabled="false") before clicking.
   */
  async submit() {
    await expect(this.subscribeButton).toHaveAttribute(
      'aria-disabled',
      'false',
      { timeout: 30_000 }
    );
    await this.subscribeButton.click();
  }

  /**
   * Wait for the success page heading to become visible.
   * First waits for processing to resolve to any terminal state,
   * then asserts we landed on success specifically.
   */
  async waitForSuccess(timeout = 90_000) {
    // Wait for a terminal state. The path-boundary patterns (/…/) prevent
    // false matches on unrelated URL segments.
    await expect(this.page).toHaveURL(
      /\/(success|error|needs_input|processing)(\/|$|\?)/,
      { timeout }
    );
    const url = this.page.url();
    if (/\/error(\/|$|\?)/.test(url)) {
      throw new Error(`Expected success but landed on error page: ${url}`);
    }
    // If still on /processing, give it more time to transition
    if (/\/processing(\/|$|\?)/.test(url)) {
      await expect(this.page).toHaveURL(
        /\/(success|error|needs_input)(\/|$|\?)/,
        { timeout }
      );
      const resolvedUrl = this.page.url();
      if (/\/error(\/|$|\?)/.test(resolvedUrl)) {
        throw new Error(
          `Expected success but landed on error page: ${resolvedUrl}`
        );
      }
    }
    await expect(this.page).toHaveURL(/\/success(\/|$|\?)/, {
      timeout: 30_000,
    });
    await expect(this.successHeading).toBeVisible({ timeout: 30_000 });
  }
}
