/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

let email = '';
const PASSWORD = 'passwordzxcv';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth signin', () => {
    test.beforeEach(({}, testInfo) => {
      test.slow(
        testInfo.project.name !== 'local',
        'email delivery can be slow'
      );
    });

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
      await expect(await login.getPrefilledEmail()).toContain(
        credentials.email
      );
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

      await expect(await login.getPrefilledEmail()).toContain(
        credentials.email
      );
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
    }) => {
      // Create unverified account via backend
      email = login.createEmail();
      await target.auth.signUp(email, PASSWORD, {
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
      pages: { login, relier },
      target,
    }) => {
      // Create unverified account
      email = login.createEmail();
      const password = 'passwordzxcv';

      await relier.goto();
      await relier.clickEmailFirst();

      // Dont register account and attempt to login via relier
      await login.fillOutFirstSignUp(email, password, { verify: false });

      await relier.goto();
      await relier.clickEmailFirst();

      // Cached user detected
      await page.waitForURL(`${target.contentServerUrl}/oauth/signin**`);
      await login.signInPasswordHeader();
      expect(await page.getByText(email).isVisible()).toBeTruthy();
      expect(await login.isCachedLogin()).toBe(true);
      await login.submit();

      // Verify email and ensure user is redirected to relier
      await login.fillOutSignUpCode(email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      target,
      page,
      credentials,
      pages: { login, relier },
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');

      // Create unverified account
      email = login.createEmail();

      await relier.goto();
      await relier.clickChooseFlow();
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });

      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();

      // User shown signin enter password page
      expect(await login.signInPasswordHeader()).toEqual(true);
    });

    test('verified, blocked', async ({ target, pages: { login, relier } }) => {
      const blockedEmail = login.createEmail('blocked{id}');
      await target.createAccount(blockedEmail, PASSWORD);

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(blockedEmail, PASSWORD);

      await login.unblock(blockedEmail);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified, blocked, incorrect password', async ({
      target,
      pages: { login, relier },
    }) => {
      const blockedEmail = login.createEmail('blocked{id}');
      await target.createAccount(blockedEmail, PASSWORD);

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(blockedEmail, 'wrong password');

      await login.unblock(blockedEmail);

      // After filling in the unblock code, the user is prompted again to enter password
      expect(await login.signInPasswordHeader()).toEqual(true);
    });
  });
});
