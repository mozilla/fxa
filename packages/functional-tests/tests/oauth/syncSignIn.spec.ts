/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  expect,
  test,
  PASSWORD,
  SIGNIN_EMAIL_PREFIX,
  SYNC_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test.describe('signin with OAuth after Sync', () => {
    test.use({
      emailOptions: [
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
        { prefix: SYNC_EMAIL_PREFIX, password: PASSWORD },
      ],
    });

    test('signin to OAuth with Sync creds', async ({
      emails,
      target,
      syncBrowserPages: {
        page,
        login,
        connectAnotherDevice,
        relier,
        signupReact,
        configPage,
      },
    }) => {
      const config = await configPage.getConfig();
      const [email, syncEmail] = emails;
      await target.createAccount(syncEmail, PASSWORD);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.login(syncEmail, PASSWORD);
      await login.fillOutSignInCode(syncEmail);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await login.useDifferentAccountLink();

      // This conditional is temporary until we have a test explicitely for this in React.
      // When that happens, we can skip this entire test if the flag is on instead. For
      // now, it's compatible with `fullProdRollout: true` _and_ `fullProdRollout: false`.
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(email, PASSWORD);
      } else {
        await signupReact.fillOutEmailForm(email);
        await signupReact.fillOutSignupForm(PASSWORD, '21');
        await signupReact.fillOutCodeForm(email);
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
    test.use({
      emailOptions: [{ prefix: SYNC_EMAIL_PREFIX, password: PASSWORD }],
    });

    test('email-first Sync signin', async ({
      emails,
      target,
      syncBrowserPages: {
        page,
        login,
        connectAnotherDevice,
        relier,
        configPage,
        signupReact,
      },
    }) => {
      const config = await configPage.getConfig();
      const [syncEmail] = emails;
      await relier.goto();
      await relier.clickEmailFirst();
      // This conditional is temporary until we have a test explicitely for this in React.
      // When that happens, we can skip this entire test if the flag is on instead. For
      // now, it's compatible with `fullProdRollout: true` _and_ `fullProdRollout: false`.
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(syncEmail, PASSWORD);
      } else {
        await signupReact.fillOutEmailForm(syncEmail);
        await signupReact.fillOutSignupForm(PASSWORD, '21');
        await signupReact.fillOutCodeForm(syncEmail);
      }

      expect(await relier.isLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );

      expect(await login.getPrefilledEmail()).toContain(syncEmail);

      await login.setPassword(PASSWORD);
      await login.submit();
      await login.fillOutSignInCode(syncEmail);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
