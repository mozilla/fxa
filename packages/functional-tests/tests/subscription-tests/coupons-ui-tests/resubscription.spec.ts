import { test, expect } from '../../../lib/fixtures/standard';

test.describe('resubscription test', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('resubscribe successfully with the same coupon after canceling for stripe', async ({
    page,
    pages: { relier, subscribe, login, settings, subscriptionManagement },
  }) => {
    await relier.goto();
    await relier.clickSubscribe6Month();

    // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
    await subscribe.addCouponCode('auto10pforever');

    // Verify the coupon is applied successfully
    expect(await subscribe.discountAppliedSuccess()).toBe(true);

    const total = await subscribe.getTotalPrice();

    //Subscribe successfully with Stripe
    await subscribe.setFullName();
    await subscribe.setCreditCardInfo();
    await subscribe.clickPayNow();
    await subscribe.submit();

    //Login to FxA account
    await login.goto();
    await login.clickSignIn();
    const subscriptionPage = await settings.clickPaidSubscriptions();
    subscriptionManagement.page = subscriptionPage;

    //Cancel subscription and then resubscribe
    await subscriptionManagement.cancelSubscription();
    await subscriptionManagement.resubscribe();

    //Verify that the resubscription has the same coupon applied
    expect(await subscriptionManagement.getResubscriptionPrice()).toEqual(
      total
    );
  });

  test('resubscribe successfully with the same coupon after canceling for paypal', async ({
    page,
    pages: { relier, subscribe, login, settings, subscriptionManagement },
  }) => {
    await relier.goto();
    await relier.clickSubscribe6Month();

    // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
    await subscribe.addCouponCode('auto10pforever');

    // Verify the coupon is applied successfully
    expect(await subscribe.discountAppliedSuccess()).toBe(true);

    const total = await subscribe.getTotalPrice();

    //Subscribe successfully using Paypal
    await subscribe.setPayPalInfo();
    await subscribe.submit();

    //Login to FxA account
    await login.goto();
    await login.clickSignIn();
    const subscriptionPage = await settings.clickPaidSubscriptions();
    subscriptionManagement.page = subscriptionPage;

    //Cancel subscription and then resubscribe
    await subscriptionManagement.cancelSubscription();
    await subscriptionManagement.resubscribe();

    //Verify that the resubscription has the same coupon applied
    expect(await subscriptionManagement.getResubscriptionPrice()).toEqual(
      total
    );
  });

  test('update mode of payment for stripe', async ({
    page,
    pages: { relier, subscribe, login, settings, subscriptionManagement },
  }) => {
    await relier.goto();
    await relier.clickSubscribe6Month();

    // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
    await subscribe.addCouponCode('auto10pforever');

    //Subscribe successfully
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
