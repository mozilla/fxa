/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SettingsPage } from '../..//pages/settings';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { CAVE_JOHNSON_CREDIT_CARD } from '../../lib/paymentArtifacts';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SubscriptionManagementPage } from '../../pages/products/subscriptionManagement';
import {
  App,
  SubscriptionSupportPage,
  Topic,
} from '../../pages/products/support';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('support form without valid session', () => {
    test('go to support form, redirects to index', async ({
      page,
      target,
      pages: { login, settings },
    }) => {
      await login.clearCache();
      await page.goto(`${target.contentServerUrl}/support`);

      await expect(settings.settingsHeading).toBeVisible();
    });
  });

  test.describe('support form without active subscriptions', () => {
    test('go to support form, redirects to subscription management, then back to settings', async ({
      page,
      target,
      pages: { settings, signinReact },
      testAccountTracker,
    }) => {
      test.slow();
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
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
      pages: { relier, subscribe, settings, signinReact },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      test.slow();

      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(
        CAVE_JOHNSON_CREDIT_CARD
      );
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
      const subscriptionSupport = new SubscriptionSupportPage(newPage, target);

      await expect(subscriptionManagement.subscriptiontHeading).toBeVisible();

      await subscriptionManagement.contactsupportButton.click();

      await subscriptionSupport.fillOutSupportForm(
        'One, Two, Three Done...PRO',
        Topic.PAYMENT_AND_BILLING,
        App.Desktop,
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
