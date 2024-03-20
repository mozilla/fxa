/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({ target }) => {
    test.slow();
  });

  test.describe('signin with OAuth after Sync', () => {
    test('signin to OAuth with Sync creds', async ({
      target,
      standardEmail,
      syncEmail,
      syncBrowserPages: {
        configPage,
        page,
        login,
        connectAnotherDevice,
        relier,
        signupReact,
      },
    }) => {
      const config = await configPage.getConfig();
      await target.createAccount(syncEmail, password);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.login(syncEmail, password);
      await login.fillOutSignInCode(syncEmail);
      // eslint-disable-next-line playwright/prefer-web-first-assertions
      expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await login.useDifferentAccountLink();
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(standardEmail, password);
      } else {
        await signupReact.fillOutEmailFirst(standardEmail);
        await signupReact.fillOutSignupForm(password);
        await signupReact.fillOutCodeForm(standardEmail);
      }

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();

      await relier.clickSignIn();

      // By default, we should see the email we signed up for Sync with
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.clickSignIn();
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test('email-first Sync signin', async ({
      target,
      syncEmail,
      syncBrowserPages: {
        configPage,
        page,
        login,
        connectAnotherDevice,
        relier,
        signupReact,
      },
    }) => {
      const config = await configPage.getConfig();
      await relier.goto();
      await relier.clickEmailFirst();
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(syncEmail, password);
      } else {
        await signupReact.fillOutEmailFirst(syncEmail);
        await signupReact.fillOutSignupForm(password);
        await signupReact.fillOutCodeForm(syncEmail);
      }
      expect(await relier.isLoggedIn()).toBe(true);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      expect(await login.getPrefilledEmail()).toContain(syncEmail);
      await login.setPassword(password);
      await login.submit();
      await login.fillOutSignInCode(syncEmail);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
