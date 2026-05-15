/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/payments';
import { StripeTestCards } from '../lib/stripe-test-cards';

// Each test creates its own account and cart — no shared state.
test.describe.configure({ retries: 2 });

test.describe('severity-1 #smoke', () => {
  test('Unauthenticated checkout page loads', async ({ target, page }) => {
    const checkoutUrl = `${target.paymentsNextUrl}/${target.paymentsTestOfferingId}/monthly/landing`;
    await page.goto(checkoutUrl);
    await expect(page).toHaveURL(new RegExp(target.contentServerUrl));
  });
});

test.describe('severity-1 #smoke', () => {
  test.setTimeout(180_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Checkout smoke tests are not run in production'
    );
  });

  test('Stripe checkout success', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Navigate from relier to checkout
    await relier.goto();
    await relier.clickSubscribeMonthly();

    // Wait for checkout start page with embedded sign-in form
    await checkout.handleLocationIfNeeded();

    // Use the checkout page's embedded sign-in form
    await checkout.emailInput.fill(credentials.email);
    await checkout.signInContinueButton.click();

    // Redirected to FXA to complete sign-in
    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutPasswordForm(credentials.password);

    // Wait for redirect back to checkout start page (now authenticated)
    await checkout.waitForPaymentReady();

    // Wait for Stripe iframe to fully load before interacting
    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.SUCCESS);
    await checkout.submit();

    // Verify success
    await checkout.waitForSuccess();
    await expect(checkout.successHeading).toContainText('check your email');
    await expect(checkout.invoiceNumber).toBeVisible();
    await expect(checkout.successActionButton).toBeVisible();
  });

  test('Stripe checkout 3DS', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribePlusMonthly();

    await checkout.handleLocationIfNeeded();

    await checkout.emailInput.fill(credentials.email);
    await checkout.signInContinueButton.click();

    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutPasswordForm(credentials.password);

    await checkout.waitForPaymentReady();

    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.THREE_DS_AUTHENTICATE);
    await checkout.submit();

    await checkout.handle3dsChallenge();

    await checkout.waitForSuccess();
    await expect(checkout.successHeading).toContainText('check your email');
  });

  test('Stripe checkout declined card - shows error and restart', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribeMonthly();

    await checkout.handleLocationIfNeeded();

    await checkout.emailInput.fill(credentials.email);
    await checkout.signInContinueButton.click();

    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutPasswordForm(credentials.password);

    await checkout.waitForPaymentReady();

    // Wait for Stripe iframe to fully load before interacting
    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.DECLINED);
    await checkout.submit();

    // Verify error page
    await checkout.waitForError();
    await expect(checkout.errorHeading).toBeVisible();
    await expect(checkout.retryButton).toBeVisible();

    // Restart flow — "Try again" navigates to /landing which triggers
    // the OAuth redirect chain, creating a new cart at /start or /new
    await checkout.retryButton.click();
    await expect(page).toHaveURL(/checkout.*start|\/new/, { timeout: 30_000 });
  });
});

test.describe('severity-2', () => {
  test.setTimeout(180_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Checkout tests are not run in production'
    );
  });

  test('Stripe checkout insufficient funds - shows error', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribeMonthly();

    await checkout.handleLocationIfNeeded();

    await checkout.emailInput.fill(credentials.email);
    await checkout.signInContinueButton.click();

    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutPasswordForm(credentials.password);

    await checkout.waitForPaymentReady();

    // Wait for Stripe iframe to fully load before interacting
    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.INSUFFICIENT_FUNDS);
    await checkout.submit();

    await checkout.waitForError();
    await expect(checkout.errorHeading).toBeVisible();
  });

  test('Stripe checkout expired card - shows error', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribeMonthly();

    await checkout.handleLocationIfNeeded();

    await checkout.emailInput.fill(credentials.email);
    await checkout.signInContinueButton.click();

    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutPasswordForm(credentials.password);

    await checkout.waitForPaymentReady();

    // Wait for Stripe iframe to fully load before interacting
    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.EXPIRED);
    await checkout.submit();

    await checkout.waitForError();
    await expect(checkout.errorHeading).toBeVisible();
  });

  test('New user checkout with account creation', async ({
    target,
    page,
    pages: { relier, signup, confirmSignupCode },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    // Navigate from relier to checkout
    await relier.goto();
    await relier.clickSubscribeMonthly();

    // Wait for checkout start page with embedded sign-in form
    await checkout.handleLocationIfNeeded();

    // Enter new email in the checkout sign-in form to trigger signup
    await checkout.emailInput.fill(email);
    await checkout.signInContinueButton.click();

    // Redirected to FXA — complete signup flow
    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signup.fillOutSignupForm(password);

    // Confirm signup code
    await expect(page).toHaveURL(/confirm_signup_code/);
    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    // After verification, should be redirected to checkout start (authenticated)
    await checkout.waitForPaymentReady();

    // Complete checkout
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.SUCCESS);
    await checkout.submit();

    await checkout.waitForSuccess();
    await expect(checkout.successHeading).toContainText('check your email');
  });
});
