/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('support form without valid session', () => {
    test('go to support form, redirects to index', async ({
      page,
      target,
      pages: { login },
    }) => {
      await login.clearCache();
      await page.goto(`${target.contentServerUrl}/support`, {
        waitUntil: 'load',
      });
      expect(await login.waitForEmailHeader()).toBe(true);
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
      await page.goto(`${target.contentServerUrl}/support`, {
        waitUntil: 'load',
      });
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
      pages: {
        relier,
        subscribe,
        settings,
        signinReact,
        subscriptionManagement,
      },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      test.slow();

      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await relier.goto();
      await relier.clickSubscribe();
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();

      //Sign in to cached FxA account
      await page.goto(target.contentServerUrl);
      await signinReact.signInButton.click();
      await expect(settings.settingsHeading).toBeVisible();
      const subscriptionPage = await settings.clickPaidSubscriptions();
      subscriptionManagement.page = subscriptionPage;
      await subscriptionManagement.fillSupportForm();
      await subscriptionManagement.cancelSupportForm();

      //Verify it redirects back to the subscription management page
      expect(await subscriptionManagement.subscriptiontHeader()).toBe(true);
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

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
