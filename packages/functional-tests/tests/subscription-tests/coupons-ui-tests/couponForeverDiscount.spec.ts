/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VALID_VISA } from '../../../lib/paymentArtifacts';
import { Coupon } from '../../../pages/products';
import { expect, test } from '../subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test forever discount', () => {
    test('subscribe successfully with a forever discount coupon', async ({
      page,
      pages: { relier, signin, subscribe },
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

      // Verify the line items after applying discount
      await expect(subscribe.listPrice).toBeVisible();
      await expect(subscribe.promoCode).toBeVisible();

      // Successfully subscribe
      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

      expect(await relier.isPro()).toBe(true);
    });

    test('subscribe with credit card and use coupon', async ({
      page,
      pages: { relier, signin, subscribe },
      credentials,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode(Coupon.AUTO_10_PERCENT_FOREVER);
      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

      expect(await relier.isPro()).toBe(true);
    });
  });
});
