/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { TestCardDefaults, StripeTestCards } from '../../lib/stripe-test-cards';
import { BasePaymentPage } from './base';
import type { SigninPage } from '../signin';

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

  get checkoutForm() {
    return this.page.getByRole('form', { name: 'Checkout form' });
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


  // Processing page

  get processingSection() {
    return this.page.getByTestId('payment-processing');
  }

  get loadingSpinner() {
    return this.page.getByTestId('loading-spinner');
  }

  get processingHeading() {
    return this.page.getByRole('heading', {
      name: /process your payment/i,
    });
  }

  // Success page (checkout-specific; shared locators are in BasePaymentPage)

  get paymentAmount() {
    return this.page
      .locator('section[aria-labelledby="subscription-confirmation-heading"]')
      .getByText(/\$[\d.]+/);
  }

  get productName() {
    return this.page.getByTestId('plan-details-product');
  }

  // Error page (checkout-specific; shared locators are in BasePaymentPage)

  get errorBanner() {
    return this.page.locator(
      'section[aria-labelledby="page-information-heading"]'
    );
  }

  get retryButton() {
    return this.page.getByRole('link', { name: /Try again/i });
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
    // Wait for either the location page or the sign-in heading
    const locationOrSignin = this.locationHeading.or(this.signinHeading);
    await expect(locationOrSignin).toBeVisible({ timeout: 90_000 });

    // Use URL to determine which page we're on — avoids a race between
    // the .or() resolution and a concurrent redirect swapping the page.
    if (this.page.url().includes('/location')) {
      await this.countrySelect.selectOption(country);
      await this.locationPostalCodeInput.fill(postalCode);
      await this.locationSaveButton.click();
      // After location submit, wait for redirect to checkout with sign-in
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
    // Triple-click to select all existing text, then type to replace.
    // Stripe may auto-fill postal code from geolocation. Stripe iframes
    // use custom elements where fill('') may not work.
    await locator.click({ clickCount: 3 });
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
      await this.stripeLinkCheckbox.waitFor({ state: 'visible', timeout: 5_000 });
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
   * Wait for the processing page to appear.
   */
  async waitForProcessing(timeout = 30_000) {
    await expect(this.processingSection).toBeVisible({ timeout });
  }

  /**
   * Wait for the success page heading to become visible.
   * First waits for processing to resolve to any terminal state,
   * then asserts we landed on success specifically.
   */
  async waitForSuccess(timeout = 90_000) {
    // Wait for any post-submit state. Include "processing" so we don't
    // burn the full timeout when the page is visibly stuck there.
    await expect(this.page).toHaveURL(
      /success|error|needs_input|processing/,
      { timeout }
    );
    const url = this.page.url();
    if (/error/.test(url)) {
      throw new Error(`Expected success but landed on error page: ${url}`);
    }
    // If still on /processing, give it more time to transition
    if (/processing/.test(url)) {
      await expect(this.page).toHaveURL(/success|error|needs_input/, {
        timeout,
      });
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
   * Wait for the error page to become visible.
   * First waits for processing to resolve to any terminal state,
   * then asserts we landed on error specifically.
   */
  async waitForError(timeout = 90_000) {
    await expect(this.page).toHaveURL(
      /success|error|needs_input|processing/,
      { timeout }
    );
    const url = this.page.url();
    if (/success/.test(url)) {
      throw new Error(`Expected error but landed on success page: ${url}`);
    }
    if (/processing/.test(url)) {
      await expect(this.page).toHaveURL(/success|error|needs_input/, {
        timeout,
      });
      const resolvedUrl = this.page.url();
      if (/success/.test(resolvedUrl)) {
        throw new Error(
          `Expected error but landed on success page: ${resolvedUrl}`
        );
      }
    }
    await expect(this.page).toHaveURL(/error/, { timeout: 30_000 });
    await expect(this.errorBanner).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Handle Stripe 3D Secure authentication challenge.
   * The test card 4000000000003220 shows a Stripe-hosted 3DS dialog.
   *
   * The 3DS dialog lives in nested cross-origin iframes that
   * Playwright's frameLocator can't reliably interact with, so we
   * use page.frames() + evaluate to find and click the button.
   * `expect.toPass()` handles the retry/polling automatically.
   */
  async handle3dsChallenge() {
    // After submit, the page navigates: /start -> /processing -> /needs_input
    // Include "processing" so we detect slow transitions early.
    await expect(this.page).toHaveURL(
      /success|error|needs_input|processing/,
      { timeout: 90_000 }
    );
    // If still on /processing, wait for it to resolve
    if (/processing/.test(this.page.url())) {
      await expect(this.page).toHaveURL(/success|error|needs_input/, {
        timeout: 90_000,
      });
    }
    const url = this.page.url();
    if (/error/.test(url)) {
      throw new Error(`3DS challenge expected /needs_input but landed on error: ${url}`);
    }
    if (/success/.test(url)) {
      // 3DS was auto-completed or skipped — no challenge to handle
      return;
    }

    // Retry clicking the 3DS Complete button until it works.
    // The button is inside:
    //   div[data-react-aria-top-layer] >
    //     iframe[name*="__privateStripeFrame"] >
    //       iframe[name="stripe-challenge-frame"] >
    //         button#test-source-authorize-3ds ("COMPLETE")
    await expect(async () => {
      const challengeFrame = this.page
        .frames()
        .find((f) => f.url().includes('3d_secure_2_test'));
      if (!challengeFrame) throw new Error('3DS challenge frame not found');
      await challengeFrame.evaluate(() => {
        const btn = document.querySelector(
          '#test-source-authorize-3ds'
        ) as HTMLButtonElement;
        if (!btn) throw new Error('3DS button not found');
        btn.click();
      });
    }).toPass({ intervals: [1_000], timeout: 30_000 });

    // Wait for the 3DS completion to propagate — the page should
    // navigate away from /needs_input to /success or /error.
    await expect(this.page).not.toHaveURL(/needs_input/, { timeout: 60_000 });
  }

  /**
   * Complete the full checkout flow: sign in, fill card, submit, and
   * wait for provisioning. Use this in tests that need an active
   * subscription as a precondition (upgrade, manage, cancel).
   */
  async completeCheckoutAs(
    signin: SigninPage,
    credentials: { email: string; password: string },
    card = StripeTestCards.SUCCESS
  ) {
    await this.handleLocationIfNeeded();

    await this.emailInput.fill(credentials.email);
    await this.signInContinueButton.click();

    await expect(this.page).toHaveURL(
      new RegExp(this.target.contentServerUrl),
      { timeout: 60_000 }
    );
    await signin.fillOutPasswordForm(credentials.password);

    await this.waitForPaymentReady();

    await this.waitForStripeReady();
    await this.checkConsent();
    await this.fillCard(card);
    await this.submit();

    await this.waitForSuccess();
    await expect(this.successHeading).toBeVisible({ timeout: 10_000 });
    await this.waitForSubscriptionProvisioned();
  }
}
