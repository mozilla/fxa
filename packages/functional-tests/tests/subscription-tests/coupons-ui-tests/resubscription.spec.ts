/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VALID_VISA } from '../../../lib/paymentArtifacts';
import { Coupon } from '../../../pages/products';
import { SubscriptionManagementPage } from '../../../pages/products/subscriptionManagement';
import { expect, test } from '../subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('resubscription test', () => {
    test('resubscribe successfully with the same coupon after canceling for stripe', async ({
      target,
      page,
      pages: { relier, subscribe, settings, signin },
      credentials,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode(Coupon.AUTO_10_PERCENT_FOREVER);

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();

      // Subscribe successfully with Stripe
      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      // Signin to FxA account
      await signin.goto();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();
      const newPage = await settings.clickPaidSubscriptions();
      const subscriptionManagement = new SubscriptionManagementPage(
        newPage,
        target
      );

      // Verify no coupon details are visible
      await expect(subscriptionManagement.subscriptionDetails).not.toHaveText(
        'Promo'
      );

      const total =
        await subscriptionManagement.priceDetailsStandalone.textContent();
      expect(total).not.toBeNull();

      // Cancel subscription and then resubscribe
      await subscriptionManagement.cancelSubscription();
      await subscriptionManagement.resubscribe();

      // Verify that the resubscription has the same coupon applied
      await expect(subscriptionManagement.priceDetailsStandalone).toHaveText(
        <string>total
      );
      // Verify no coupon details are visible
      await expect(subscriptionManagement.subscriptionDetails).not.toHaveText(
        'Promo'
      );
    });
  });
});
