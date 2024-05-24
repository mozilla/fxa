/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../../lib/targets/base';
import { TestAccountTracker } from '../../../lib/testAccountTracker';
import { LoginPage } from '../../../pages/login';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test invalid', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('apply an invalid coupon', async ({ pages: { relier, subscribe } }, {
      project,
    }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/05/13 (see FXA-9689).'
      );
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      // But valid for a 12mo plan
      await subscribe.addCouponCode('autoinvalid');

      await expect(
        await subscribe.getCouponStatusByDataTestId('coupon-error')
      ).toBeVisible({
        timeout: 5000,
      });

      // Asserting that the code is invalid for a 6mo plan
      expect(await subscribe.couponErrorMessageText()).toContain(
        'The code you entered is invalid'
      );

      // Adding the same code to a 12mo plan
      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      // But valid for a 12mo plan
      await subscribe.addCouponCode('autoinvalid');

      // Verifying the coupon is valid with a discount line item
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();
    });

    test('subscribe successfully with an invalid coupon', async ({
      target,
      page,
      pages: { relier, subscribe, login },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'autoinvalid' coupon is an invalid coupon for a 6mo plan
      await subscribe.addCouponCode('autoinvalid');

      // Asserting that the code is invalid for a 6m plan
      expect(await subscribe.couponErrorMessageText()).toContain(
        'The code you entered is invalid'
      );

      // Successfully subscribe
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();
      await relier.goto();
      await relier.clickEmailFirst();
      await login.submit();
      expect(await relier.isPro()).toBe(true);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
