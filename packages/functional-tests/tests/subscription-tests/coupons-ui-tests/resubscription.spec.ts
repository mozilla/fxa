/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../../lib/fixtures/standard';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('resubscription test', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('resubscribe successfully with the same coupon after canceling for stripe', async ({
      pages: { relier, subscribe, login, settings, subscriptionManagement },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode('auto10pforever');

      // Verify the coupon is applied successfully
      expect(await subscribe.discountAppliedSuccess()).toBe(true);

      const total = await subscribe.getTotalPrice();

      //Subscribe successfully with Stripe
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();

      //Login to FxA account
      await login.goto();
      await login.clickSignIn();
      const subscriptionPage = await settings.clickPaidSubscriptions();
      subscriptionManagement.page = subscriptionPage;

      //Verify no coupon details are visible
      expect(await subscriptionManagement.subscriptionDetails()).not.toContain(
        'Promo'
      );

      //Cancel subscription and then resubscribe
      await subscriptionManagement.cancelSubscription();
      await subscriptionManagement.resubscribe();

      //Verify that the resubscription has the same coupon applied
      expect(await subscriptionManagement.getResubscriptionPrice()).toEqual(
        total
      );

      //Verify no coupon details are visible
      expect(await subscriptionManagement.subscriptionDetails()).not.toContain(
        'Promo'
      );
    });

    test('update mode of payment for stripe', async ({
      pages: { relier, subscribe, login, settings, subscriptionManagement },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode('auto10pforever');

      //Subscribe successfully
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();

      //Login to FxA account
      await login.goto();
      await login.clickSignIn();
      const subscriptionPage = await settings.clickPaidSubscriptions();
      subscriptionManagement.page = subscriptionPage;

      //Change stripe card information
      await subscriptionManagement.changeStripeCardDetails();

      //Verify that the card info is updated
      expect(await subscriptionManagement.getCardInfo()).toContain('4444');
    });
  });
});
