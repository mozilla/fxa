/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';
import { SigninTokenCodePage } from '../../pages/signinTokenCode';

test.describe('severity-2 #smoke', () => {
  test.describe('sync signin cached', () => {
    test.beforeEach(async () => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
    });

    test('sign in on desktop then specify a different email on query parameter continues to cache desktop signin', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        connectAnotherDevice,
        settings,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 error on code submission, authentication token not found'
      );
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        settings,
        signinReact,
        signinTokenCode,
        testAccountTracker
      );
      const query = { email: credentials.email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      //Check prefilled email
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.fillOutPasswordForm(credentials.password);

      await connectAnotherDevice.clickNotNow();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Reset prefill and context
      await signinReact.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });

      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();

      await signinReact.useDifferentAccountLink.click();
      await expect(signinReact.emailFirstHeading).toBeVisible();
    });

    test('sign in with desktop context then no context, desktop credentials should persist', async ({
      target,
      syncBrowserPages: { page, signinReact, signinTokenCode, settings },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 error on code submission, authentication token not found'
      );
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        settings,
        signinReact,
        signinTokenCode,
        testAccountTracker
      );
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();

      await signinReact.useDifferentAccountLink.click();
      await expect(signinReact.emailFirstHeading).toBeVisible();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Reset prefill and context
      await signinReact.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await signinReact.useDifferentAccountLink.click();
      await expect(signinReact.emailFirstHeading).toBeVisible();
    });
  });
});

async function signInSyncAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signinReact: SigninReactPage,
  signinTokenCode: SigninTokenCodePage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSync();
  await page.goto(
    `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
  );
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);
  await expect(signinTokenCode.heading).toBeVisible();
  const code = await target.emailClient.getSigninTokenCode(credentials.email);
  await signinTokenCode.fillOutCodeForm(code);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
