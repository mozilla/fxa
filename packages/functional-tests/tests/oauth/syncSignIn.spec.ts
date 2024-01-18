/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';
let syncBrowserPages;
let email;
let email2;

test.describe('severity-1 #smoke', () => {
  test.describe('signin with OAuth after Sync', () => {
    test.beforeEach(async ({ target }) => {
      test.slow();
      syncBrowserPages = await newPagesForSync(target);
    });

    test.afterEach(async ({ target }) => {
      if (email) {
        await target.auth.accountDestroy(email, password);
        email = '';
      }
      if (email2) {
        await target.auth.accountDestroy(email2, password);
        email2 = '';
      }
      await syncBrowserPages.browser?.close();
    });

    test('signin to OAuth with Sync creds', async ({ target }) => {
      const {
        configPage,
        page,
        login,
        connectAnotherDevice,
        relier,
        signupReact,
      } = syncBrowserPages;
      const config = await configPage.getConfig();

      email = login.createEmail('sync{id}');
      email2 = login.createEmail();

      await target.createAccount(email, password);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.login(email, password);
      await login.fillOutSignInCode(email);
      expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await login.useDifferentAccountLink();
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(email2, password);
      } else {
        await signupReact.fillOutEmailFirst(email2);
        await signupReact.fillOutSignupForm(password);
        await signupReact.fillOutCodeForm(email2);
      }

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();

      await relier.clickSignIn();

      // By default, we should see the email we signed up for Sync with
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.clickSignIn();
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test.beforeEach(async ({ target }) => {
      test.slow();
      syncBrowserPages = await newPagesForSync(target);
    });

    test.afterEach(async ({ target }) => {
      if (email) {
        await target.auth.accountDestroy(email, password);
        email = '';
      }
      await syncBrowserPages.browser?.close();
    });

    test('email-first Sync signin', async ({ target }) => {
      const {
        configPage,
        page,
        login,
        connectAnotherDevice,
        relier,
        signupReact,
      } = syncBrowserPages;
      const config = await configPage.getConfig();

      const email = login.createEmail('sync{id}');
      await relier.goto();
      await relier.clickEmailFirst();
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(email, password);
      } else {
        await signupReact.fillOutEmailFirst(email);
        await signupReact.fillOutSignupForm(password);
        await signupReact.fillOutCodeForm(email);
      }
      expect(await relier.isLoggedIn()).toBe(true);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      expect(await login.getPrefilledEmail()).toContain(email);
      await login.setPassword(password);
      await login.submit();
      await login.fillOutSignInCode(email);
      expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();
    });
  });
});
