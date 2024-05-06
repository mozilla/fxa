/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(({}, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
  });

  test.describe('OAuth signin', () => {
    test('verified', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached login', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in
      await relier.clickEmailFirst();

      // Email is prefilled
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      expect(await login.isCachedLogin()).toBe(true);

      await login.submit();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached expired login', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in with cached user
      await relier.clickEmailFirst();

      expect(await login.getPrefilledEmail()).toContain(credentials.email);
      expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      await relier.signOut();

      // Clear cache and try to login
      await login.clearCache();
      await relier.goto();
      await relier.clickEmailFirst();

      // User will have to re-enter login information
      await login.login(credentials.email, credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified, acts like signup', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      // Create unverified account via backend
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);
      // User is shown confirm email page
      await login.fillOutSignInCode(credentials.email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified with a cached login', async ({
      page,
      pages: { configPage, login, relier },
      target,
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.signUpRoutes === true);
      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();
      // Dont register account and attempt to login via relier
      await login.fillOutFirstSignUp(email, password, { verify: false });
      await relier.goto();
      await relier.clickEmailFirst();
      await page.waitForURL(`${target.contentServerUrl}/oauth/**`);

      // Cached user detected
      expect(await login.getPrefilledEmail()).toContain(email);
      expect(await login.isCachedLogin()).toBe(true);

      await login.submit();
      // Verify email and ensure user is redirected to relier
      await login.fillOutSignUpCode(email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      pages: { configPage, login, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.signUpRoutes === true);

      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickChooseFlow();
      // Dont register account and attempt to login via relier
      await login.fillOutFirstSignUp(email, password, { verify: false });
      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();

      // User shown signin enter password page
      await expect(login.signinPasswordHeader).toBeVisible();
    });

    test('verified, blocked', async ({
      page,
      pages: { login, relier, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);
      await login.unblock(credentials.email);

      expect(await relier.isLoggedIn()).toBe(true);

      // Delete blocked account, required before teardown
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('verified, blocked, incorrect password', async ({
      page,
      pages: { login, relier, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, 'wrong password');
      await login.unblock(credentials.email);
      // After filling in the unblock code, the user is prompted again to enter password
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await login.setPassword(credentials.password);
      await login.submit();
      await login.unblock(credentials.email);
      await relier.isLoggedIn();
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function removeAccount(
  settings: SettingsPage,
  deleteAccount: DeleteAccountPage,
  page: Page,
  password: string
) {
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
