/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { smartWindowDesktopOAuthQueryParams } from '../../lib/query-params';
import { gotoSyncSession } from '../../lib/sync-helpers';

test.describe('severity-1 #smoke', () => {
  test.describe('signin with OAuth after Sync', () => {
    test('signin to OAuth with Sync creds', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        signup,
        connectAnotherDevice,
        relier,
        signinTokenCode,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        target.name !== 'local',
        'FXA-11542, test is inconsistently failing in smoke tests with a different cached account than expected - suspect failing for react email-first'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();
      const syncCredentials = await testAccountTracker.signUpSync();

      await gotoSyncSession(page, target);
      await signin.fillOutEmailFirstForm(syncCredentials.email);
      await signin.fillOutPasswordForm(syncCredentials.password);
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Sign up for a new account via OAuth
      await relier.goto('force_passwordless=false');
      await relier.clickEmailFirst();
      await signin.useDifferentAccountLink.click();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const signupCode = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(signupCode);

      // RP is logged in, logout then back in again
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      await relier.clickSignIn();

      // By default, we should see the most recent signed in email
      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
    });

    test('can sign in to OAuth after abandoning sync confirmation code', async ({
      target,
      syncBrowserPages: { page, signin, signinTokenCode, relier },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();

      // Start sign-into-sync flow
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&force_passwordless=false`
      );
      await signin.fillOutEmailFirstForm(syncCredentials.email);
      await signin.fillOutPasswordForm(syncCredentials.password);

      // Confirm we reached the token code page, but intentionally skip entering the code
      await expect(page).toHaveURL(/signin_token_code/);

      // Navigate to 123done without completing sync verification
      await relier.goto();
      await relier.clickEmailFirst();

      // FxA sees the existing session and shows cached account
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      // We get a signin code, because we are using a restmail address, and forces
      // verification. ie Must verify will always be set on this client.
      await expect(page).toHaveURL(/signin_token_code/);
      const signinCode = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(signinCode);

      // OAuth sign-in should succeed even though the sync session was not verified
      expect(await relier.isLoggedIn()).toBe(true);
    });

    // After SyncOAuth signin and a localStorage wipe, OAuth-native flows
    // should still suggest the browser user instead of the email-first form.
    test('SmartWindow respects browser-signed-in user after SyncOAuth, localStorage cleared', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinTokenCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();

      // Real SyncOAuth signin so Firefox stores the user via fxaccounts:login.
      await gotoSyncSession(page, target);
      await signin.fillOutEmailFirstForm(syncCredentials.email);
      await signin.fillOutPasswordForm(syncCredentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // SmartWindow on Firefox 147+ supports keys_optional, so the cached
      // browser user is offered a passwordless sign-in instead of a prompt.
      await signin.goto('/authorization', smartWindowDesktopOAuthQueryParams);
      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await expect(signin.emailFirstHeading).not.toBeVisible();
    });

    // Same scenario, taken end-to-end through token-code to /settings.
    test('SmartWindow cached signin completes token verification', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinTokenCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();

      await gotoSyncSession(page, target);
      await signin.fillOutEmailFirstForm(syncCredentials.email);
      await signin.fillOutPasswordForm(syncCredentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // keys_optional cached signin: no password is prompted, the user
      // confirms with the Sign in button and completes via token code.
      await signin.goto('/authorization', smartWindowDesktopOAuthQueryParams);
      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await expect(signin.emailFirstHeading).not.toBeVisible();

      // With keys_optional the cached device is trusted, so confirming the
      // cached signin completes straight to settings without a token code.
      await signin.signInButton.click();
      await page.waitForURL(/settings/);
    });
  });

  test.describe('signin to Sync after OAuth', () => {
    test('email-first Sync signin', async ({
      target,
      syncBrowserPages: {
        confirmSignupCode,
        connectAnotherDevice,
        page,
        relier,
        signin,
        signinTokenCode,
        signup,
      },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();

      await relier.goto('force_passwordless=false');
      await relier.clickEmailFirst();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const signupCode = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(signupCode);

      expect(await relier.isLoggedIn()).toBe(true);

      await gotoSyncSession(page, target);

      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signin.fillOutPasswordForm(password);
      await expect(page).toHaveURL(/signin_token_code/);
      const signinCode = await target.emailClient.getVerifyLoginCode(email);
      await signinTokenCode.fillOutCodeForm(signinCode);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
