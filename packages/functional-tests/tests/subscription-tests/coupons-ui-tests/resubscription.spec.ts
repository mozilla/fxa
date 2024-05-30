/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../../lib/fixtures/standard';
import { VALID_VISA } from '../../../lib/paymentArtifacts';
import { BaseTarget, Credentials } from '../../../lib/targets/base';
import { TestAccountTracker } from '../../../lib/testAccountTracker';
import { Coupon } from '../../../pages/products';
import { SubscriptionManagementPage } from '../../../pages/products/subscriptionManagement';
import { SettingsPage } from '../../../pages/settings';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-2 #smoke', () => {
  test.describe('resubscription test', () => {
    test('resubscribe successfully with the same coupon after canceling for stripe', async ({
      target,
      page,
      pages: { relier, subscribe, settings, signinReact },
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
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe6Month();

      // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
      await subscribe.addCouponCode(Coupon.AUTO_10_PERCENT_FOREVER);

      // Verify the coupon is applied successfully
      await expect(subscribe.promoCodeAppliedHeading).toBeVisible();

      const total = await subscribe.totalPrice.textContent();

      //Subscribe successfully with Stripe
      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      //Signin to FxA account
      await signinReact.goto();

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signinReact.signInButton.click();
      const newPage = await settings.clickPaidSubscriptions();
      const subscriptionManagement = new SubscriptionManagementPage(
        newPage,
        target
      );

      //Verify no coupon details are visible
      await expect(subscriptionManagement.subscriptionDetails).not.toHaveText(
        'Promo'
      );

      //Cancel subscription and then resubscribe
      await subscriptionManagement.cancelSubscription();
      await subscriptionManagement.resubscribe();

      //Verify that the resubscription has the same coupon applied
      const resubscriptionPrice =
        await subscriptionManagement.resubscriptionPrice.textContent();
      expect(resubscriptionPrice).toEqual(total);
      //Verify no coupon details are visible
      await expect(subscriptionManagement.subscriptionDetails).not.toHaveText(
        'Promo'
      );
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
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  await expect(page).toHaveURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
