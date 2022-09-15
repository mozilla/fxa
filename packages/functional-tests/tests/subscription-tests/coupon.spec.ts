import { test, expect } from '../../lib/fixtures/standard';

test.describe('coupon test', () => {
  test.beforeEach(({}, { project }) => {
    test.skip(project.name !== 'stage', "Only run these tests in 'stage' env");
  });

  test('subscribe with an expired coupon', async ({
    pages: { relier, subscribe },
  }) => {
    test.slow();
    await relier.goto();
    await relier.clickSubscribe6Month();
    await subscribe.addExpiredCoupon();

    // Verifying the correct error message
    expect(await subscribe.couponErrorMessageText()).toMatch(
      'The code you entered has expired'
    );
  });

  test('subscribe with an invalid coupon', async ({
    pages: { relier, subscribe },
  }) => {
    test.slow();
    await relier.goto();
    await relier.clickSubscribe6Month();
    await subscribe.addInvalidCoupon();

    // Asserting that the code is invalid for a 6m plan
    expect(await subscribe.couponErrorMessageText()).toMatch(
      'The code you entered is invalid'
    );

    // Adding the same code to a 12m plan
    await relier.goto();
    await relier.clickSubscribe12Month();
    await subscribe.addInvalidCoupon();

    // verifying the coupon is valid with a discount line item
    expect(await subscribe.discountAppliedSucess()).toMatch('Discount');
  });
});
