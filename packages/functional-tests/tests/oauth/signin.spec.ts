/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  PASSWORD,
  BLOCKED_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(({}, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
  });

  test.describe('OAuth signin', () => {
    test('verified', async ({ credentials, pages: { login, relier } }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached login', async ({
      credentials,
      pages: { login, relier },
    }) => {
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
      credentials,
      pages: { login, relier },
    }) => {
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
      target,
      pages: { login, relier },
      emails,
    }) => {
      // Create unverified account via backend
      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'false',
      });
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(email, PASSWORD);
      // User is shown confirm email page
      await login.fillOutSignInCode(email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified with a cached login', async ({
      page,
      pages: { configPage, login, relier },
      target,
      emails,
    }) => {
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.signUpRoutes === true);
      // Create unverified account
      const [email] = emails;

      await relier.goto();
      await relier.clickEmailFirst();
      // Dont register account and attempt to login via relier
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });
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
      emails,
    }) => {
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.signUpRoutes === true);

      // Create unverified account
      const [email] = emails;

      await relier.goto();
      await relier.clickChooseFlow();
      // Dont register account and attempt to login via relier
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });
      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();

      // User shown signin enter password page
      await expect(login.signinPasswordHeader).toBeVisible();
    });
  });

  test.describe('OAuth signin', () => {
    test.use({
      emailOptions: [{ prefix: BLOCKED_EMAIL_PREFIX, password: PASSWORD }],
    });

    test('verified, blocked', async ({
      target,
      page,
      pages: { login, relier, settings, deleteAccount },
      emails,
    }) => {
      const [blockedEmail] = emails;

      await target.createAccount(blockedEmail, PASSWORD);
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(blockedEmail, PASSWORD);
      await login.unblock(blockedEmail);

      expect(await relier.isLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.goto();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });

    test('verified, blocked, incorrect password', async ({
      target,
      page,
      pages: { login, relier, settings, deleteAccount },
      emails,
    }) => {
      const [blockedEmail] = emails;

      await target.createAccount(blockedEmail, PASSWORD);
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(blockedEmail, 'wrong password');
      await login.unblock(blockedEmail);

      // After filling in the unblock code, the user is prompted again to enter password
      await expect(page.getByText('Incorrect password')).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await login.setPassword(PASSWORD);
      await login.submit();
      await login.unblock(blockedEmail);
      await settings.goto();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
