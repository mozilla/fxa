/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { SigninPage } from '../../pages/signin';
import {
  smartWindowDesktopOAuthQueryParamsNoScope,
  syncDesktopOAuthQueryParamsNoScope,
  vpnDesktopOAuthQueryParamsNoScope,
} from '../../lib/query-params';
import {
  OLDSYNC_SCOPE,
  PROFILE_SCOPE,
  PROFILE_UID_SCOPE,
  SMARTWINDOW_SCOPE,
  VPN_SCOPE,
} from '../../lib/scopes';

// Waits for the fxa_oauth_login WebChannel message and returns the
// granted scopes as a string[]. Throws (failing the test) if the event
// is missing — checkWebChannelMessage already retries with a timeout.
async function getOAuthLoginScope(signin: SigninPage): Promise<string[]> {
  await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
  const events = await signin.getWebChannelEvents();
  const login = events.find((e) => e.command === FirefoxCommand.OAuthLogin);
  if (!login) {
    throw new Error('fxa_oauth_login WebChannel message not found');
  }
  const { scope } = login.data as { scope: string };
  return scope.split(' ');
}

// When the URL omits `scope=`, the auth-server resolves it from
// `service=`. apps/oldsync is appended when `keys_jwe` is in the request
// (i.e. the user entered a password and the client wrapped scoped keys).
// These tests exercise the end-to-end /oauth/authorization flow and
// assert the resolved scope on the WebChannel fxa_oauth_login payload
// that fxa-settings sends to Firefox.
test.describe('server-side scope resolution', () => {
  test('Sync signin flow without scope= resolves to apps/oldsync + profile', async ({
    target,
    syncOAuthBrowserPages: { page, signin, signinTokenCode },
    testAccountTracker,
  }) => {
    const syncCredentials = await testAccountTracker.signUpSync();

    await signin.goto('/authorization', syncDesktopOAuthQueryParamsNoScope);
    await signin.fillOutEmailFirstForm(syncCredentials.email);
    await signin.fillOutPasswordForm(syncCredentials.password);

    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(
      syncCredentials.email
    );
    await signinTokenCode.fillOutCodeForm(code);

    const scope = await getOAuthLoginScope(signin);
    expect(scope).toEqual(
      expect.arrayContaining([OLDSYNC_SCOPE, PROFILE_SCOPE])
    );
  });

  test('Sync signup without scope= resolves to apps/oldsync + profile', async ({
    target,
    syncOAuthBrowserPages: { page, signin, signup, confirmSignupCode },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();

    const params = new URLSearchParams(syncDesktopOAuthQueryParamsNoScope);
    await page.goto(`${target.contentServerUrl}?${params}`);

    await signin.fillOutEmailFirstForm(email);
    await signup.fillOutSyncSignupForm(password);

    await page.waitForURL(/confirm_signup_code/);
    const signupCode = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(signupCode);

    const scope = await getOAuthLoginScope(signin);
    expect(scope).toEqual(
      expect.arrayContaining([OLDSYNC_SCOPE, PROFILE_SCOPE])
    );
  });

  test('VPN flow without scope= and password entry grants vpn + profile + oldsync', async ({
    syncOAuthBrowserPages: { signin },
    testAccountTracker,
  }) => {
    // Freshly signed-up account: session is verified, no token code needed.
    const { email, password } = await testAccountTracker.signUp();

    await signin.goto('/authorization', vpnDesktopOAuthQueryParamsNoScope);
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    const scope = await getOAuthLoginScope(signin);
    expect(scope).toEqual(
      expect.arrayContaining([VPN_SCOPE, PROFILE_SCOPE, OLDSYNC_SCOPE])
    );
  });

  // Disabled while we investigate the flaky cached-signin -> WebChannel race.
  test.fixme(
    'SmartWindow flow without scope= via cached sign-in grants smartwindow + profile:uid only (no oldsync)',
    async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const syncCredentials = await testAccountTracker.signUpSync();

      // First, fully complete a Sync sign-in so the browser has a
      // session (mirrors the user being "already signed into Firefox").
      await signin.goto('/authorization', syncDesktopOAuthQueryParamsNoScope);
      await signin.fillOutEmailFirstForm(syncCredentials.email);
      await signin.fillOutPasswordForm(syncCredentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        syncCredentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
      await signin.clearWebChannelEvents();

      // Now navigate to SmartWindow — cached-signin path, no password prompt.
      await signin.goto(
        '/authorization',
        smartWindowDesktopOAuthQueryParamsNoScope
      );
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      const scope = await getOAuthLoginScope(signin);
      expect(scope).toEqual(
        expect.arrayContaining([SMARTWINDOW_SCOPE, PROFILE_UID_SCOPE])
      );
      expect(scope).not.toContain(OLDSYNC_SCOPE);
    }
  );
});
