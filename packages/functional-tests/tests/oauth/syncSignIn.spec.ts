/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('signin with OAuth after Sync', () => {
    test('signin to OAuth with Sync creds', async ({
      target,
      syncBrowserPages: {
        page,
        login,
        signupReact,
        connectAnotherDevice,
        relier,
      },
      testAccountTracker,
    }) => {
      const account = testAccountTracker.generateAccountDetails();
      const syncCredentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.login(syncCredentials.email, syncCredentials.password);
      const loginCode = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await login.fillOutSignInCode(loginCode);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await login.useDifferentAccountLink();
      await signupReact.fillOutEmailForm(account.email);
      await signupReact.fillOutSignupForm(account.password, AGE_21);
      const shortCode = await target.emailClient.getVerifyShortCode(
        account.email
      );
      await signupReact.fillOutCodeForm(shortCode);

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      await relier.clickSignIn();

      // By default, we should see the email we signed up for Sync with
      expect(await login.getPrefilledEmail()).toContain(syncCredentials.email);

      await login.clickSignIn();

      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test('email-first Sync signin', async ({
      target,
      syncBrowserPages: {
        page,
        login,
        signupReact,
        connectAnotherDevice,
        relier,
      },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password, AGE_21);
      const verifyCode = await target.emailClient.getVerifyShortCode(email);
      await signupReact.fillOutCodeForm(verifyCode);

      expect(await relier.isLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );

      expect(await login.getPrefilledEmail()).toContain(email);

      await login.setPassword(password);
      await login.submit();
      const loginCode = await target.emailClient.getVerifyLoginCode(email);
      await login.fillOutSignInCode(loginCode);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
