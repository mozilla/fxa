/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test.describe('signin cached', () => {
    test('sign in twice, on second attempt email will be cached', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInSyncAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await signin.clearSessionStorage();
      await page.goto(target.contentServerUrl);

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signin.signInButton.click();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('sign in with incorrect email case before normalization fix, on second attempt canonical form is used', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInSyncAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await signin.clearSessionStorage();
      await page.goto(target.contentServerUrl);
      await signin.denormalizeStoredEmail(email);

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signin.signInButton.click();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Verify email is normalized
      await expect(settings.primaryEmail.status).toHaveText(email);
    });

    test('expired cached credentials', async ({
      target,
      syncBrowserPages: { page, configPage, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInSyncAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signInRoutes,
        'FXA-9519, with React cached sign in is suggested but results in session expired error '
      );
      await signin.destroySession(credentials.email);
      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(page.getByText(credentials.email)).toBeVisible();

      // await signin.fillOutPasswordForm(credentials.password);
      await signin.signInButton.click();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('cached credentials that expire while on page', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInSyncAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.destroySession(credentials.email);
      await signin.signInButton.click();

      await expect(
        page.getByText('Session expired. Sign in to continue.')
      ).toBeVisible();

      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('unverified cached signin redirects to confirm email', async ({
      target,
      syncBrowserPages: {
        configPage,
        confirmSignupCode,
        page,
        settings,
        signin,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signInRoutes,
        'FXA-9519 different code sent out'
      );
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify sign up code header is visible
      await expect(page).toHaveURL(/confirm_signup_code/);
      await expect(confirmSignupCode.heading).toBeVisible();

      await page.goto(target.contentServerUrl);

      // Check prefilled email
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

      // Cached signin should still go to email confirmation screen for unverified accounts
      await expect(page).toHaveURL(/confirm_signup_code/);

      // Fill the code and submit
      const code = await target.emailClient.getVerifyShortCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      // Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('sign in once, use a different account', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(page.getByText(syncCredentials.email)).toBeVisible();

      await signin.useDifferentAccountLink.click();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
      await settings.signOut();

      // testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
    });
  });
});

async function signInSyncAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSync();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
