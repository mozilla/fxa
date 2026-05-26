/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/payments';
import { StripeTestCards } from '../lib/stripe-test-cards';

// Each test creates its own account and subscription — no shared state.
test.describe.configure({ retries: 2 });

test.describe('severity-1 #smoke', () => {
  test.setTimeout(240_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Upgrade smoke tests are not run in production'
    );
  });

  test('Upgrade happy path — lower-tier to higher-tier with prorated price', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Subscribe to the monthly (lower-tier) plan
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

    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.SUCCESS);
    await checkout.submit();

    await checkout.waitForSuccess();
    await expect(checkout.successHeading).toContainText('check your email');

    // Wait for the subscription to be fully provisioned before step 2.
    // The success page appears immediately but the Stripe webhook that
    // creates the server-side subscription record may still be in-flight.
    await checkout.waitForSubscriptionProvisioned();

    // Step 2: Navigate to the 12-month (higher-tier) plan to trigger upgrade
    await relier.goto();
    await relier.clickSubscribe12Month();

    // Wait for eligibility to resolve and the upgrade page to fully render
    await upgrade.waitForUpgradePage();

    // Confirm the upgrade
    await upgrade.checkConsent();
    await upgrade.confirmUpgrade();

    // Verify success
    await upgrade.waitForSuccess();
    await expect(upgrade.successHeading).toBeVisible();
  });
});

test.describe('severity-2', () => {
  test.setTimeout(240_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Upgrade tests are not run in production'
    );
  });

  test('Duplicate subscription blocked — already subscribed user is rejected', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Complete initial monthly subscription
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

    await checkout.waitForStripeReady();
    await checkout.checkConsent();
    await checkout.fillCard(StripeTestCards.SUCCESS);
    await checkout.submit();

    await checkout.waitForSuccess();
    await checkout.waitForSubscriptionProvisioned();

    // Step 2: Attempt to subscribe to the same monthly plan again
    await relier.goto();
    await relier.clickSubscribeMonthly();

    // The system detects the duplicate subscription and shows an error
    await upgrade.waitForEligibilityError();
    await expect(upgrade.errorHeading).toContainText(/already subscribed/i);
    await expect(upgrade.errorButton).toBeVisible();
  });

  test('Downgrade blocked — higher-tier user cannot subscribe to lower tier', async ({
    target,
    page,
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Complete initial 12-month (higher-tier) subscription
    await relier.goto();
    await relier.clickSubscribe12Month();

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
    await checkout.fillCard(StripeTestCards.SUCCESS);
    await checkout.submit();

    await checkout.waitForSuccess();
    await checkout.waitForSubscriptionProvisioned();

    // Step 2: Attempt to subscribe to the monthly (lower-tier) plan
    await relier.goto();
    await relier.clickSubscribeMonthly();

    // The system detects the downgrade attempt and shows an error
    await upgrade.waitForEligibilityError();
    await expect(upgrade.errorHeading).toContainText(/contact support/i);
    await expect(upgrade.errorButton).toBeVisible();
  });
});
