/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FF_OAUTH_CLIENT_ID,
  FirefoxCommand,
  FxAStatusResponse,
} from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth signin', () => {
    test('verified', async ({
      pages: { signin, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached login', async ({
      pages: { page, signin, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in
      await relier.clickEmailFirst();

      // Email is prefilled
      await expect(signin.cachedSigninSubmitButton).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached expired login', async ({
      pages: { page, signin, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in with cached user
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninSubmitButton).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();
      await relier.signOut();

      // Clear cache and try to login
      await signin.clearCache();
      await relier.goto();
      await relier.clickEmailFirst();

      // User will have to re-enter login information
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified, acts like signup', async ({
      target,
      pages: { page, signin, relier, confirmSignupCode },
      testAccountTracker,
    }) => {
      // Create unverified account via backend
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        verified: false,
      });

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      // User is shown confirm email page
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified with a cached login', async ({
      pages: { page, confirmSignupCode, signin, signup, relier },
      target,
      testAccountTracker,
    }) => {
      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto('force_passwordless=false');
      await relier.clickEmailFirst();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      // Dont verify account and attempt to login via relier
      await page.waitForURL(/confirm_signup_code/);
      await expect(page).toHaveURL(/confirm_signup_code/);
      await relier.goto();
      await relier.clickEmailFirst();
      await page.waitForURL(`${target.contentServerUrl}/oauth/**`);

      // Cached user detected
      await expect(signin.cachedSigninSubmitButton).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signin.signInButton.click();
      // Verify email and ensure user is redirected to relier
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      pages: { page, signin, signup, relier, confirmSignupCode },
      testAccountTracker,
      target,
    }) => {
      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto('force_passwordless=false');
      await relier.clickChooseFlow();
      // Don't verify account and attempt to login via relier
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();
      await expect(signin.cachedSigninSubmitButton).toBeVisible();

      await signin.signInButton.click();
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
    });
  });
});

test.describe('severity-2', () => {
  test.describe('OAuth signin', () => {
    test('prompt=login destroys the replaced web session', async ({
      pages: { page, signin, settings },
      testAccountTracker,
      target,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // Settings asks the browser for its token before it destroys one.
      const noBrowserUser: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            signedInUser: null,
            clientId: FF_OAUTH_CLIENT_ID,
            capabilities: { engines: [], pairing: false, multiService: false },
          },
        },
      };
      await signin.respondToWebChannelMessageAlways(noBrowserUser);

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
      const { sessionToken: replacedToken } =
        (await signin.getAccountFromLocalStorage(credentials.email)) as {
          sessionToken: string;
        };
      expect(replacedToken).toBeTruthy();

      await page.goto(`${target.relierUrl}/api/prompt_login`);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL((url) => url.href.startsWith(target.relierUrl));

      await expect
        .poll(() =>
          target.authClient.sessionStatus(replacedToken).then(
            () => 'live',
            (err: { errno?: number }) => {
              // Only errno 110 (invalid token) proves the session is gone.
              if (err.errno === 110) return 'destroyed';
              throw err;
            }
          )
        )
        .toBe('destroyed');
    });
  });
});
