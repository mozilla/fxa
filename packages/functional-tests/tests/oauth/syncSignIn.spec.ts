/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test.describe('signin with OAuth after Sync', () => {
    test('signin to OAuth with Sync creds', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        signupReact,
        signinTokenCode,
        connectAnotherDevice,
        relier,
      },
      testAccountTracker,
    }) => {
      const account = testAccountTracker.generateAccountDetails();
      const syncCredentials = await testAccountTracker.signUpSync();
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signinReact.fillOutEmailFirstForm(syncCredentials.email);
      await signinReact.fillOutPasswordForm(syncCredentials.password);

      await page.waitForURL(/signin_token_code/);

      await expect(signinTokenCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

      // Sign up for a new account via OAuth
      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.useDifferentAccountLink.click();

      await signupReact.fillOutFirstSignUp(
        account.email,
        account.password,
        AGE_21
      );

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      await relier.clickSignIn();

      // By default, we should see the email we signed up for Sync with
      await expect(page.getByText(syncCredentials.email)).toBeVisible();

      await signinReact.fillOutPasswordForm(syncCredentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test('email-first Sync signin', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        signupReact,
        signinTokenCode,
        connectAnotherDevice,
        relier,
      },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();

      await signupReact.fillOutFirstSignUp(email, password, AGE_21);

      expect(await relier.isLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );

      await expect(signinReact.passwordFormHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_token_code/);
      await expect(signinTokenCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(email);
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });
  });
});
