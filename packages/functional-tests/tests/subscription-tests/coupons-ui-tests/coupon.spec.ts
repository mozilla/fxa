/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../../lib/targets/base';
import { TestAccountTracker } from '../../../lib/testAccountTracker';
import { SettingsPage } from '../../../pages/settings';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-2 #smoke', () => {
  test.describe('coupon test', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('apply an expired coupon', async ({ pages: { relier, subscribe } }, {
      project,
    }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'autoexpired' coupon is an expired coupon for a 6mo plan
      await subscribe.addCouponCode('autoexpired');

      await expect(
        await subscribe.getCouponStatusByDataTestId('coupon-error')
      ).toBeVisible({
        timeout: 5000,
      });

      // Verifying the correct error message
      expect(await subscribe.couponErrorMessageText()).toContain(
        'The code you entered has expired'
      );
    });

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
      pages: { relier, settings, subscribe, signinReact },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

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
      await signinReact.signInButton.click();
      expect(await relier.isPro()).toBe(true);
    });

    test('subscribe successfully with a forever discount coupon', async ({
      target,
      page,
      pages: { relier, settings, subscribe, signinReact },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode('auto10pforever');

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();

      // Verify the line items after applying discount
      expect(await subscribe.discountListPrice()).toBe(true);
      expect(await subscribe.discountLineItem()).toBe(true);

      // Successfully subscribe
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();
      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.signInButton.click();
      expect(await relier.isPro()).toBe(true);
    });

    test('subscribe with a one time discount coupon', async ({
      target,
      page,
      pages: { relier, settings, subscribe, signinReact },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'auto50ponetime' is a one time 50% discount coupon for a 12mo plan
      await subscribe.addCouponCode('auto50ponetime');

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();
      expect(await subscribe.oneTimeDiscountSuccess()).toBe(true);

      // Verify the line items is visible after applying discount
      expect(await subscribe.discountListPrice()).toBe(true);
      expect(await subscribe.discountLineItem()).toBe(true);

      // Successfully subscribe
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();
      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.signInButton.click();
      expect(await relier.isPro()).toBe(true);
    });

    test('subscribe with credit card and use coupon', async ({
      target,
      page,
      pages: { relier, settings, signinReact, subscribe },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode('auto10pforever');
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();
      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.signInButton.click();
      expect(await relier.isPro()).toBe(true);
    });

    test('remove a coupon and verify', async ({
      pages: { relier, subscribe, signinReact },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );

      await relier.goto();
      await relier.clickSubscribe12Month();

      // 'auto50ponetime' is a one time 50% discount coupon for a 12mo plan
      await subscribe.addCouponCode('auto50ponetime');

      // Verify the coupon is applied successfully
      await expect(
        await subscribe.getCouponStatusByDataTestId('coupon-remove-button')
      ).toBeVisible({
        timeout: 5000,
      });
      expect(await subscribe.oneTimeDiscountSuccess()).toBe(true);

      // Verify the line items is visible after applying discount
      expect(await subscribe.discountListPrice()).toBe(true);
      expect(await subscribe.discountLineItem()).toBe(true);

      // Remove the coupon
      await subscribe.removeCouponCode();

      // Verify the discount is removed
      expect(await subscribe.discountLineItem()).toBe(false);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSubscription();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
