/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VALID_MASTERCARD, VALID_VISA } from '../../../lib/paymentArtifacts';
import { Coupon } from '../../../pages/products';
import { SubscriptionManagementPage } from '../../../pages/products/subscriptionManagement';
import { expect, test } from '../subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('payment', () => {
    test('update mode of payment for stripe', async ({
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

      //Subscribe successfully
      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      //Signin to FxA account
      await signin.goto();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();
      const newPage = await settings.clickPaidSubscriptions();
      const subscriptionManagement = new SubscriptionManagementPage(
        newPage,
        target
      );
      await subscriptionManagement.ChangePaymentInformationButton.click();
      //Change stripe card information
      await subscriptionManagement.paymentInformation.fillOutCreditCardInfo(
        VALID_MASTERCARD
      );
      await subscriptionManagement.paymentInformation.updateButton.click();

      //Verify that the card info is updated
      const lastFour = VALID_MASTERCARD.number.slice(-4);
      await expect(
        subscriptionManagement.paymentInformation.cardInfoAndLastFour
      ).toContainText(lastFour);
    });
  });
});
