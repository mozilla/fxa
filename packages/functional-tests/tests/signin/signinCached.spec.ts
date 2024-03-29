/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test, PASSWORD } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('signin cached', () => {
    test.use({
      emailOptions: [{ PASSWORD }, { prefix: 'sync{id}', PASSWORD }],
    });
    test.beforeEach(async ({ emails, target, syncBrowserPages: { login } }) => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
      const [email, syncEmail] = emails;
      await target.auth.signUp(syncEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await target.auth.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
    });

    test('sign in twice, on second attempt email will be cached', async ({
      emails,
      target,
      syncBrowserPages: { page, login },
    }) => {
      const [email, syncEmail] = emails;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('sign in with incorrect email case before normalization fix, on second attempt canonical form is used', async ({
      emails,
      target,
      syncBrowserPages: { page, login, settings },
    }) => {
      const [email, syncEmail] = emails;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.clearSessionStorage();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.denormalizeStoredEmail(syncEmail);
      await page.reload();

      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.clickSignIn();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Verify email is normalized
      const primary = await settings.primaryEmail.statusText();
      expect(primary).toEqual(syncEmail);
    });

    test('sign in once, use a different account', async ({
      emails,
      target,
      syncBrowserPages: { page, login },
    }) => {
      const [email, syncEmail] = emails;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.useDifferentAccountLink();
      await login.fillOutEmailFirstSignIn(email, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      // testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(email);
    });

    test('expired cached credentials', async ({
      emails,
      target,
      syncBrowserPages: { page, login },
    }) => {
      const [email, syncEmail] = emails;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await login.destroySession(syncEmail);
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.setPassword(PASSWORD);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('cached credentials that expire while on page', async ({
      emails,
      target,
      syncBrowserPages: { page, login },
    }) => {
      const [email, syncEmail] = emails;
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(syncEmail, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });

      //Check prefilled email
      expect(await login.getPrefilledEmail()).toContain(syncEmail);

      await login.destroySession(syncEmail);
      await login.clickSignIn();

      //Session expired error should show.
      expect(await login.signInError()).toContain(
        'Session expired. Sign in to continue.'
      );
      await login.setPassword(PASSWORD);
      await login.clickSubmit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('unverified cached signin redirects to confirm email', async ({
      emails,
      target,
      syncBrowserPages: { page, login },
    }) => {
      const [email, syncEmail] = emails;
      test.fixme(true, 'test to be fixed, see FXA-9194');
      const email_unverified = login.createEmail();
      await target.auth.signUp(email_unverified, PASSWORD, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email_unverified, PASSWORD);

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
