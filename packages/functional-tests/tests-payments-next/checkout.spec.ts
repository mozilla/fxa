/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../lib/email';
import { expect, test } from '../lib/fixtures/payments';
import { StripeTestCards } from '../lib/stripe-test-cards';

// Each test creates its own account and cart — no shared state.

test.describe('severity-1 #smoke', () => {
  test.setTimeout(180_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Checkout smoke tests are not run in production'
    );
  });

  test.describe('with retries', () => {
    test.describe.configure({ retries: 2 });

    test('Unauthenticated checkout page loads', async ({ target, page }) => {
      const checkoutUrl = `${target.paymentsNextUrl}/${target.paymentsTestOfferingId}/monthly/landing`;
      await page.goto(checkoutUrl);
      await expect(page).toHaveURL(new RegExp(target.contentServerUrl));
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

    // Payments Next is in servicesWithEmailVerification, so a heuristic
    // unverified session has to be challenged here rather than passed through
    // to the grant the way an unlisted RP is.
    //
    // Paired with the hardcoded-client test in tests/signin/unverifiedSession
    // .spec.ts. This one runs the real embedded sign-in, and is the only one
    // that reaches stage; that one is the only one that runs on PRs. Neither
    // reaches production — the describe above skips checkout there.
    test('checkout challenges a heuristic unverified session and sends one code', async ({
      target,
      page,
      pages: { relier, signin, signinTokenCode },
      paymentPages: { checkout },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpUnverifiedSession();
      await target.emailClient.clear(credentials.email);

      await relier.goto();
      await relier.clickSubscribeMonthly();
      await checkout.handleLocationIfNeeded();

      await checkout.emailInput.fill(credentials.email);
      await checkout.signInContinueButton.click();

      await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
        timeout: 30_000,
      });
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_token_code/);
      // Read from the header rather than `getVerifyLoginCode`, which clears
      // the inbox this test counts.
      const code = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.verifyLoginCode,
        EmailHeader.signinCode
      );
      await signinTokenCode.fillOutCodeForm(code);

      // Back to checkout, now with a verified session.
      await checkout.waitForPaymentReady();

      await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.newDeviceLogin
      );
      expect(
        await target.emailClient.countEmailsByType(
          credentials.email,
          EmailType.verifyLoginCode
        )
      ).toBe(1);
    });
  });

  test('PayPal checkout success', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout },
    testAccountTracker,
  }, { project }) => {
    test.skip(
      project.name.includes('local'),
      'PayPal sandbox is not reachable from local CI'
    );
    test.skip(
      !process.env.PAYPAL_SANDBOX_BUYER_EMAIL ||
        !process.env.PAYPAL_SANDBOX_BUYER_PWD,
      'PayPal sandbox buyer credentials not configured'
    );
    const sandboxEmail = process.env.PAYPAL_SANDBOX_BUYER_EMAIL as string;
    const sandboxPassword = process.env.PAYPAL_SANDBOX_BUYER_PWD as string;

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

    // Wait for Stripe iframe to fully load, then select PayPal
    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.selectPayPal();

    // Complete PayPal sandbox flow — returns false on sandbox failure
    // (logs to Sentry, does not block deployment)
    const paypalSuccess = await checkout.handlePayPalPopup(
      sandboxEmail,
      sandboxPassword
    );
    test.skip(!paypalSuccess, 'PayPal sandbox unavailable');

    // Verify success
    await checkout.waitForSuccess();
    await expect(checkout.successHeading).toContainText('check your email');
    await expect(checkout.invoiceNumber).toBeVisible();
    await expect(checkout.successActionButton).toBeVisible();
  });
});

test.describe('severity-2', () => {
  test.setTimeout(180_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      !project.name.includes('stage'),
      'New user checkout with account creation only runs in stage'
    );
  });

  test('New user checkout with account creation', async ({
    target,
    page,
    pages: { relier, signinPasswordlessCode },
    paymentPages: { checkout },
    testAccountTracker,
  }) => {
    const { email } =
      testAccountTracker.generatePasswordlessAccountDetails();

    // Navigate from relier to checkout
    await relier.goto();
    await relier.clickSubscribeMonthly();

    // Wait for checkout start page with embedded sign-in form
    await checkout.handleLocationIfNeeded();

    // Enter new email in the checkout sign-in form to trigger signup
    await checkout.emailInput.fill(email);
    await checkout.signInContinueButton.click();

    // Redirected to FXA — OTP is enabled for 123DonePro on stage,
    // so new users go through the passwordless signup code flow
    await page.waitForURL(/signin_passwordless_code/, { timeout: 30_000 });
    await expect(signinPasswordlessCode.heading).toBeVisible();
    const code = await target.emailClient.getPasswordlessSignupCode(email);
    await signinPasswordlessCode.fillOutCodeForm(code);

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
