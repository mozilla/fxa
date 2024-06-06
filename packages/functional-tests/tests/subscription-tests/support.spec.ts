/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SettingsPage } from '../..//pages/settings';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { VALID_VISA } from '../../lib/paymentArtifacts';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SubscriptionManagementPage } from '../../pages/products/subscriptionManagement';
import {
  App,
  SubscriptionSupportPage,
  Topic,
} from '../../pages/products/support';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('support form without valid session', () => {
    test('go to support form, redirects to index', async ({
      page,
      target,
      pages: { signin, settings },
    }) => {
      await signin.clearCache();
      await page.goto(`${target.contentServerUrl}/support`);

      await expect(settings.settingsHeading).toBeVisible();
    });
  });

  test.describe('support form without active subscriptions', () => {
    test('go to support form, redirects to subscription management, then back to settings', async ({
      page,
      target,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);
      await page.goto(`${target.contentServerUrl}/support`);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
    });
  });
});

test.describe('severity-2 #smoke', () => {
  test.describe('support form with active subscriptions', () => {
    // Since we don't have a proper Zendesk config in CircleCI, the test
    // case where a form is successfully submitted cannot be covered.

    test('go to support form, cancel, redirects to subscription management', async ({
      target,
      page,
      pages: { relier, subscribe, settings, signin },
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
      await relier.clickSubscribe();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      //Signin to FxA account
      await signin.goto();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();
      const newPage = await settings.clickPaidSubscriptions();
      const subscriptionManagement = new SubscriptionManagementPage(
        newPage,
        target
      );
      const subscriptionSupport = new SubscriptionSupportPage(newPage, target);

      await expect(subscriptionManagement.subscriptiontHeading).toBeVisible();

      await subscriptionManagement.contactsupportButton.click();

      await subscriptionSupport.fillOutSupportForm(
        target.subscriptionConfig.name,
        Topic.PAYMENT_AND_BILLING,
        App.DESKTOP,
        'Test Support',
        'Testing Support Form'
      );
      await subscriptionSupport.cancelButton.click();

      //Verify it redirects back to the subscription management page
      await expect(subscriptionManagement.subscriptiontHeading).toBeVisible();
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
