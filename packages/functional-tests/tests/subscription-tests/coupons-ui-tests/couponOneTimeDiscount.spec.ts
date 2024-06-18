/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../../lib/fixtures/standard';
import { VALID_VISA } from '../../../lib/paymentArtifacts';
import { BaseTarget, Credentials } from '../../../lib/targets/base';
import { TestAccountTracker } from '../../../lib/testAccountTracker';
import { Coupon } from '../../../pages/products';
import { SettingsPage } from '../../../pages/settings';
import { SigninPage } from '../../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test one time discount', () => {
    test('subscribe with a one time discount coupon', async ({
      target,
      page,
      pages: { relier, settings, signin, subscribe },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'auto50ponetime' is a one time 50% discount coupon for a 12mo plan
      await subscribe.addCouponCode(Coupon.AUTO_50_PERCENT_ONE_TIME);

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();
      await expect(subscribe.couponSuccessMessage).toHaveText(
        'Your plan will automatically renew at the list price.'
      );

      // Verify the line items is visible after applying discount
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

    test('remove a coupon and verify', async ({
      pages: { relier, subscribe },
    }, { project }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/05/13 (see FXA-9689).'
      );
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );

      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'auto50ponetime' is a one time 50% discount coupon for a 12mo plan
      await subscribe.addCouponCode(Coupon.AUTO_50_PERCENT_ONE_TIME);

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();
      await expect(subscribe.couponSuccessMessage).toHaveText(
        'Your plan will automatically renew at the list price.'
      );

      // Verify the line items is visible after applying discount
      await expect(subscribe.listPrice).toBeVisible();
      await expect(subscribe.promoCode).toBeVisible();

      // Remove the coupon
      await subscribe.removeCouponButton.click();

      // Verify the discount is removed
      await expect(subscribe.promoCode).toBeHidden();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await expect(page).toHaveURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
