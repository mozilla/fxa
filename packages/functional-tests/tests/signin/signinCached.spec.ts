/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow(); //This test has steps for email rendering that runs slow on stage
  });

  test.describe('signin cached', () => {
    test('sign in twice, on second attempt email will be cached', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const { email } = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl);

      expect(await login.getPrefilledEmail()).toContain(email);

      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('sign in with incorrect email case before normalization fix, on second attempt canonical form is used', async ({
      target,
      syncBrowserPages: { page, login, settings },
      testAccountTracker,
    }) => {
      const { email } = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl);
      await login.denormalizeStoredEmail(email);

      expect(await login.getPrefilledEmail()).toContain(email);

      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Verify email is normalized
      await expect(settings.primaryEmail.status).toHaveText(email);
    });

    test('expired cached credentials', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const credentials = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await login.destroySession(credentials.email);
      await page.goto(target.contentServerUrl);

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      await login.setPassword(credentials.password);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('cached credentials that expire while on page', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const credentials = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      await login.destroySession(credentials.email);
      await login.clickSignIn();

      await expect(
        page.getByText('Session expired. Sign in to continue.')
      ).toBeVisible();

      await login.setPassword(credentials.password);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('unverified cached signin redirects to confirm email', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify sign up code header is visible
      await expect(login.signUpCodeHeader).toBeVisible();

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      await login.clickSignIn();

      //Cached login should still go to email confirmation screen for unverified accounts
      await expect(login.signUpCodeHeader).toBeVisible();

      //Fill the code and submit
      await login.fillOutSignUpCode(credentials.email);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('sign in once, use a different account', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);

      await login.useDifferentAccountLink();
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      // testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl);

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
    });
  });
});

async function signInSyncAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSync();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
