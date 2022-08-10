import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1', () => {
  test('subscribe with an expired coupon', async ({
    pages: { relier, login, subscribe },
  }, { project }) => {
    test.skip(project.name === 'production', 'prod needs a valid credit card');
    test.skip(project.name === 'local', 'No need to be run on local');
    test.slow();
    await relier.goto();
    await relier.clickSubscribe6month();
    await subscribe.setFullName();
    await subscribe.setCreditCardInfo();
    await subscribe.addExpiredCoupon();

    // Verifying the correct error message
    expect(await subscribe.couponErrorMessageText()).toMatch(
      'The code you entered has expired'
    );
  });

  test.describe('severity-1', () => {
    test('subscribe with an invalid coupon', async ({
      pages: { relier, login, subscribe },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'prod needs a valid credit card'
      );
      test.skip(project.name === 'local', 'No need to be run on local');
      test.slow();
      await relier.goto();
      await relier.clickSubscribe6month();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.addInvalidCoupon();

      // Asserting that the code is inavlid for a 6m plan
      expect(await subscribe.couponErrorMessageText()).toMatch(
        'The code you entered is invalid'
      );

      // Adding the same code to a 12m plan
      await relier.goto();
      await relier.clickSubscribe12month();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.addInvalidCoupon();

      // verifying the coupon is valid with a discount
      expect(await subscribe.appliedDiscountLineItem()).toMatch('Discount');
    });
  });
});
