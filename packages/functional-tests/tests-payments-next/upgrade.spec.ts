/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/payments';

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
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Subscribe to the daily (lower-tier) plan
    // Uses 123DoneProPlus (no free trial) to avoid free trial eligibility errors
    await relier.goto();
    await relier.clickSubscribePlusDaily();
    await checkout.completeCheckoutAs(signin, credentials);

    // Step 2: Navigate to the monthly (higher-tier) plan to trigger upgrade
    await relier.goto();
    await relier.clickSubscribePlusMonthly();

    await upgrade.waitForUpgradePage();

    await upgrade.checkConsent();
    await upgrade.confirmUpgrade();

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
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Complete initial monthly subscription
    // Uses 123DoneProPlus (no free trial) to avoid eligibility errors
    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    // Step 2: Attempt to subscribe to the same monthly plan again
    await relier.goto();
    await relier.clickSubscribePlusMonthly();

    await upgrade.waitForEligibilityError();
    await expect(upgrade.errorHeading).toContainText(/already subscribed/i);
    await expect(upgrade.errorButton).toBeVisible();
  });

  test('Downgrade blocked — higher-tier user cannot subscribe to lower tier', async ({
    pages: { relier, signin },
    paymentPages: { checkout, upgrade },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Step 1: Complete initial monthly (higher-tier) subscription
    // Uses 123DoneProPlus (no free trial) to avoid eligibility errors
    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    // Step 2: Attempt to subscribe to the daily (lower-tier) plan
    await relier.goto();
    await relier.clickSubscribePlusDaily();

    await upgrade.waitForEligibilityError();
    await expect(upgrade.errorHeading).toContainText(/contact support/i);
    await expect(upgrade.errorButton).toBeVisible();
  });
});
