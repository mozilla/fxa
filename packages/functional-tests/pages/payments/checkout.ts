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

  get checkoutForm() {
    return this.page.getByRole('form', { name: 'Checkout form' });
  }

  get subscribeButton() {
    return this.page.getByRole('button', { name: /Subscribe Now/i });
  }

  // Stripe PaymentElement (iframe matched by URL, same approach as legacy tests)

  private get stripeFrame() {
    return this.page.frameLocator(
      'iframe[title*="Secure payment input frame"]'
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

  get linkPhoneInput() {
    return this.stripeFrame.locator('[name="linkMobilePhone"]');
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

    // If on the location page, fill it out
    if (await this.locationHeading.isVisible()) {
      await this.countrySelect.selectOption(country);
      await this.locationPostalCodeInput.fill(postalCode);
      await this.locationSaveButton.click();
      // After location submit, wait for redirect to checkout with sign-in
      await expect(this.signinHeading).toBeVisible({ timeout: 30_000 });
    }
  }

  // Actions

  /**
   * Wait for the Stripe iframe and card number field to be ready.
   * Retries until the frame exists and the field is visible.
   */
  async waitForStripeReady() {
    const stripeIframe = this.page.locator(
      'iframe[title*="Secure payment input frame"]'
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

    await this.typeInStripeField(this.cardNumberInput, number);
    await this.typeInStripeField(this.cardExpiryInput, exp);
    await this.typeInStripeField(this.cardCvcInput, cvc);
    await this.typeInStripeField(this.postalCodeInput, zip);

    // Link always auto-checks after card fill — uncheck it
    await expect(this.stripeLinkCheckbox).toBeVisible({ timeout: 5_000 });
    await this.stripeLinkCheckbox.click();
  }

  /**
   * Fill card fields and complete Stripe Link sign-up.
   * Keeps the "Save my information" checkbox checked and fills the
   * email and phone fields that Link requires.
   */
  async fillCardWithLink(
    number: string,
    phone = '2015550123',
    exp = `${TestCardDefaults.EXP_MONTH}/${String(TestCardDefaults.EXP_YEAR).slice(-2)}`,
    cvc = TestCardDefaults.CVC,
    zip = '10001'
  ) {
    await this.waitForStripeReady();

    await this.typeInStripeField(this.cardNumberInput, number);
    await this.typeInStripeField(this.cardExpiryInput, exp);
    await this.typeInStripeField(this.cardCvcInput, cvc);
    await this.typeInStripeField(this.postalCodeInput, zip);

    // Link always auto-checks — email is auto-filled, just fill phone
    await expect(this.linkPhoneInput).toBeVisible({ timeout: 10_000 });
    await this.typeInStripeField(this.linkPhoneInput, phone);
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
    await expect(this.page).toHaveURL(/success|error|needs_input/, {
      timeout,
    });
    await expect(this.page).toHaveURL(/success/);
    await expect(this.successHeading).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Wait for the error page to become visible.
   * First waits for processing to resolve to any terminal state,
   * then asserts we landed on error specifically.
   */
  async waitForError(timeout = 90_000) {
    await expect(this.page).toHaveURL(/success|error|needs_input/, {
      timeout,
    });
    await expect(this.page).toHaveURL(/error/);
    await expect(this.errorBanner).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Handle Stripe 3D Secure authentication challenge.
   * The test card 4000000000003220 shows a Stripe-hosted 3DS dialog.
   */
  async handle3dsChallenge() {
    // After submit, the page navigates: /start -> /processing -> /needs_input
    // The 3DS dialog is in nested iframes inside a top-layer overlay:
    //   div[data-react-aria-top-layer] >
    //     iframe[name*="__privateStripeFrame"] >
    //       iframe[name="stripe-challenge-frame"] >
    //         button#test-source-authorize-3ds ("COMPLETE")
    await expect(this.page).toHaveURL(/success|error|needs_input/, {
      timeout: 90_000,
    });
    await expect(this.page).toHaveURL(/needs_input/);

    // The 3DS Complete button is in nested cross-origin iframes that
    // Playwright's frameLocator can't reliably click. Use CDP to
    // find the frame by URL and dispatch the click via evaluate.
    // Retry in a loop and verify the page actually navigates away.
    // Find and click the 3DS Complete button, then wait for the
    // challenge frame to disappear (confirming 3DS was completed).
    // eslint-disable-next-line playwright/no-wait-for-timeout -- 3DS
    // challenge is in nested cross-origin iframes that Playwright's
    // frameLocator can't reliably interact with. We use page.frames()
    // + evaluate to click the button, with polling since there are no
    // reliable DOM signals for cross-origin iframe availability.
    let clicked = false;
    for (let i = 0; i < 30; i++) {
      const frames = this.page.frames();
      const challengeFrame = frames.find((f) =>
        f.url().includes('3d_secure_2_test')
      );
      if (!challengeFrame) {
        if (clicked) return; // Frame gone after click = success
        await this.page.waitForTimeout(1000); // eslint-disable-line playwright/no-wait-for-timeout
        continue;
      }
      try {
        await challengeFrame.waitForLoadState('domcontentloaded');
        await challengeFrame.evaluate(() => {
          const btn = document.querySelector(
            '#test-source-authorize-3ds'
          ) as HTMLButtonElement;
          btn?.click();
        });
        clicked = true;
        // Wait for the 3DS completion to propagate
        await this.page.waitForTimeout(2000); // eslint-disable-line playwright/no-wait-for-timeout
      } catch {
        // Frame detached during interaction = click worked
        if (clicked) return;
      }
    }
    throw new Error('Failed to complete 3DS challenge');
  }
}
