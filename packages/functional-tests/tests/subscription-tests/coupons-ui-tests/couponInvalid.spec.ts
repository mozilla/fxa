/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VALID_VISA } from '../../../lib/paymentArtifacts';
import { Coupon } from '../../../pages/products';
import { expect, test } from '../subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test invalid', () => {
    test('apply an invalid coupon', async ({ pages: { relier, subscribe } }, {
      project,
    }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      // But valid for a 12mo plan
      await subscribe.addCouponCode(Coupon.AUTO_INVALID);

      // Asserting that the code is invalid for a 6mo plan
      await expect(subscribe.couponErrorMessage).toHaveText(
        'The code you entered is invalid.'
      );

      // Adding the same code to a 12mo plan
      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      // But valid for a 12mo plan
      await subscribe.addCouponCode(Coupon.AUTO_INVALID);

      // Verifying the coupon is valid with a discount line item
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();
    });

    test('subscribe successfully with an invalid coupon', async ({
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

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      await subscribe.addCouponCode(Coupon.AUTO_INVALID);

      // Asserting that the code is invalid for a 6m plan
      await expect(subscribe.couponErrorMessage).toHaveText(
        'The code you entered is invalid.'
      );

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
  });
});
