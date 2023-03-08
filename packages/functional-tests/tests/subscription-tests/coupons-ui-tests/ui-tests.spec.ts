import { test, expect } from '../../../lib/fixtures/standard';

test.describe('ui functionality', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('verify coupon feature not available when changing plans', async ({
    page,
    pages: { relier, subscribe },
  }) => {
    await relier.goto();
    await relier.clickSubscribe6Month();

    // Verify discount section is displayed
    expect(await subscribe.discountTextbox()).toBe(true);

    // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
    await subscribe.addCouponCode('auto10pforever');

    // Verify the coupon is applied successfully
    expect(await subscribe.discountAppliedSuccess()).toBe(true);

    //Subscribe successfully with Stripe
    await subscribe.setFullName();
    await subscribe.setCreditCardInfo();
    await subscribe.clickPayNow();
    await subscribe.submit();
    await relier.goto();

    //Change the plan
    await relier.clickSubscribe12Month();

    //Verify Discount section is not displayed
    expect(await subscribe.planUpgradeDetails()).not.toContain('Promo');

    //Submit the changes
    await subscribe.clickConfirmPlanChange();
    await subscribe.clickPayNow();
    await subscribe.submit();

    //Verify the subscription is successful
    expect(await subscribe.isSubscriptionSuccess()).toBe(true);
  });
});
