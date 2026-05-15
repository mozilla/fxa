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
      'Subscription management smoke tests are not run in production'
    );
  });

  test('Manage page loads with active subscription', async ({
    pages: { relier, signin },
    paymentPages: { checkout, manage },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    await manage.goto();
    await manage.waitForManagePage();

    await expect(manage.activeSubscriptionsList).toBeVisible();
    await expect(manage.paymentMethodLastFour).toBeVisible();
    await expect(manage.paymentMethodIcon).toBeVisible();
  });

  test('Change payment method (Stripe)', async ({
    pages: { relier, signin },
    paymentPages: { checkout, manage },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    await manage.updatePaymentMethod(StripeTestCards.SUCCESS_MASTERCARD);

    await manage.waitForManagePage();
    await expect(manage.paymentMethodLastFour).toContainText('4444');
  });

  test('Cancel subscription', async ({
    pages: { relier, signin },
    paymentPages: { checkout, manage, cancel },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    await manage.goto();
    await manage.waitForManagePage();

    const cancelBtn = manage.cancelButton();
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });
    await cancelBtn.click();

    await expect(cancel.cancelHeading).toBeVisible({ timeout: 30_000 });
    await cancel.confirmAndCancel();
    await cancel.waitForCancelConfirmation();

    await manage.goto();
    await manage.waitForManagePage();
    await expect(manage.cancelledStatus).toBeVisible();
  });

  test('Resubscribe cancelled subscription', async ({
    pages: { relier, signin },
    paymentPages: { checkout, manage, cancel, staySubscribed },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickSubscribePlusMonthly();
    await checkout.completeCheckoutAs(signin, credentials);

    // Cancel the subscription first
    await manage.goto();
    await manage.waitForManagePage();

    const cancelBtn = manage.cancelButton();
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });
    await cancelBtn.click();

    await expect(cancel.cancelHeading).toBeVisible({ timeout: 30_000 });
    await cancel.confirmAndCancel();
    await cancel.waitForCancelConfirmation();

    // Navigate back to manage and resubscribe
    await manage.goto();
    await manage.waitForManagePage();

    const stayBtn = manage.staySubscribedButton();
    await expect(stayBtn).toBeVisible({ timeout: 10_000 });
    await stayBtn.click();

    await expect(staySubscribed.staySubscribedHeading).toBeVisible({
      timeout: 30_000,
    });
    await staySubscribed.resubscribe();
    await staySubscribed.waitForSuccess();

    await expect(staySubscribed.backToSubscriptionsLink).toBeVisible({
      timeout: 10_000,
    });
    await staySubscribed.backToSubscriptionsLink.click();
    await manage.waitForManagePage();

    await expect(manage.cancelledStatus).toBeHidden({ timeout: 30_000 });
    await expect(manage.activeSubscriptionsList).toBeVisible();
  });
});

test.describe('severity-2', () => {
  test.setTimeout(180_000);
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({}, { project }) => {
    test.skip(
      project.name.includes('production'),
      'Subscription management tests are not run in production'
    );
  });

  test('Manage page empty state', async ({
    target,
    page,
    pages: { signin },
    paymentPages: { manage },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await manage.goto();

    await expect(page).toHaveURL(new RegExp(target.contentServerUrl), {
      timeout: 30_000,
    });
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await manage.waitForManagePage();

    await expect(manage.emptyStateMessage).toBeVisible();
  });
});
