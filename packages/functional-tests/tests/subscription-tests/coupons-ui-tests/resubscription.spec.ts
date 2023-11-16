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
      page,
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

    test('resubscribe successfully with the same coupon after canceling for paypal', async ({
      page,
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

      //Subscribe successfully using Paypal
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setPayPalInfo();
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
      page,
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

    //Disable as paypal sandbox is taking a long time to load
    /*test('update mode of payment for paypal', async ({
      page,
      pages: { relier, subscribe, login, settings, subscriptionManagement },
    }, { project }) => {
      test.skip(
        project.name !== 'local',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode('auto10pforever');

      //Subscribe successfully
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setPayPalInfo();
      await subscribe.submit();

      //Login to FxA account
      await login.goto();
      await login.clickSignIn();
      const subscriptionPage = await settings.clickPaidSubscriptions();
      subscriptionManagement.page = subscriptionPage;

      //Change Paypal information
      const paypalPage = await subscriptionManagement.clickPaypalChange();
      subscriptionManagement.page = paypalPage;

      //Login to Paypal sandbox
      await subscriptionManagement.loginPaypal();

      //Verify the account as 'CREDIT UNION'
      expect(await subscriptionManagement.checkPaypalAccount()).toContain(
        'CREDIT UNION'
      );

      //Change account from 'Credit Union' to 'Visa'
      await subscriptionManagement.updatePaypalAccount();

      //Added this timeout wait for page to be loaded correctly
      await page.waitForTimeout(2000);

      //Verify that the payment info is updated
      expect(await subscriptionManagement.checkPaypalAccount()).toContain('Visa');
    });*/
  });
});
