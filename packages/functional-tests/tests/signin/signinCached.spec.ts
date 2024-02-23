/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
const password = 'passwordzxcv';
let email;
let email2;
let syncBrowserPages;

test.describe('severity-2 #smoke', () => {
  test.describe('signin cached', () => {
    test.beforeEach(async ({ target }) => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
      syncBrowserPages = await newPagesForSync(target);
      const { login } = syncBrowserPages;
      email = login.createEmail('sync{id}');
      email2 = login.createEmail();
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
      await target.auth.signUp(email2, password, {
        lang: 'en',
        preVerified: 'true',
      });
    });

    test.afterEach(async ({ target }) => {
      test.slow(); //The cleanup was timing out and exceeding 3000ms
      await syncBrowserPages.browser?.close();
      if (email) {
        // Cleanup any accounts created during the test
        await target.auth.accountDestroy(email, password);
      }
    });

    test('sign in twice, on second attempt email will be cached', async ({
      target,
    }) => {
      const { page, login } = syncBrowserPages;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('sign in with incorrect email case before normalization fix, on second attempt canonical form is used', async ({
      target,
    }) => {
      const { page, login, settings } = syncBrowserPages;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.denormalizeStoredEmail(email);
      await page.reload();

      expect(await login.getPrefilledEmail()).toContain(email);
      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Verify email is normalized
      const primary = await settings.primaryEmail.statusText();
      expect(primary).toEqual(email);
    });

    test('sign in once, use a different account', async ({ target }) => {
      const { page, login } = syncBrowserPages;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.useDifferentAccountLink();
      await login.fillOutEmailFirstSignIn(email2, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      // testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email2);
    });

    test('expired cached credentials', async ({ target }) => {
      const { page, login } = syncBrowserPages;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.destroySession(email);
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.setPassword(password);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('cached credentials that expire while on page', async ({ target }) => {
      const { page, login } = syncBrowserPages;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email);

      await login.destroySession(email);
      await login.clickSignIn();

      //Session expired error should show.
      expect(await login.signInError()).toContain(
        'Session expired. Sign in to continue.'
      );
      await login.setPassword(password);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('unverified cached signin redirects to confirm email', async ({
      target,
    }) => {
      test.fixme(true, 'test to be fixed, see FXA-9194');
      const { page, login } = syncBrowserPages;
      const email_unverified = login.createEmail();
      await target.auth.signUp(email_unverified, password, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email_unverified, password);

      //Verify sign up code header is visible
      expect(login.signUpCodeHeader()).toBeVisible();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email_unverified);
      await login.clickSignIn();

      //Cached login should still go to email confirmation screen for unverified accounts
      expect(login.signUpCodeHeader()).toBeVisible();

      //Fill the code and submit
      await login.fillOutSignUpCode(email_unverified);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });
});
