/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FirefoxCommand,
  FF_OAUTH_CLIENT_ID,
  FxAStatusResponse,
} from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import {
  syncMobileOAuthFenixQueryParams,
  vpnSyncMobileOAuthFenixQueryParams,
  vpnMobileOAuthQueryParamsNoScope,
} from '../../lib/query-params';
import { PROFILE_SCOPE, VPN_SCOPE } from '../../lib/scopes';

test.describe('vpn integration', () => {
  test('authorization flow - user already signed into Firefox', async ({
    syncOAuthBrowserPages: { page, signin },
    testAccountTracker
  }) => {
    const { email, password } = await testAccountTracker.signUp();

    // First, sign into Sync with Fenix (Android) client ID
    await signin.goto('/authorization', syncMobileOAuthFenixQueryParams);
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    // Wait for Sync sign-in to complete, then clear events for the
    // VPN scope check later in the test
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.clearWebChannelEvents();

    // Now navigate to VPN authorization — user is already signed into Firefox
    await signin.goto('/authorization', vpnMobileOAuthQueryParamsNoScope);

    // User is already signed in — cached signin view, no password required
    await expect(signin.cachedSigninHeading).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // "Use a different account" link is hidden when signed into Firefox with
    // a Firefox client + service requested on cached sign-in
    await expect(
      page.getByRole('link', { name: /use a different account/i })
    ).toBeHidden();

    await signin.signInButton.click();

    await signin.checkWebChannelMessageScope(
      FirefoxCommand.OAuthLogin,
      `${VPN_SCOPE} ${PROFILE_SCOPE}`
    );

    // Verify services data includes vpn
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      vpn: {},
    });
  });

  test('passwordless VPN + Sync signin on Android routes to set password when Sync is not decoupled', async ({
    target,
    pages: { page, signin, signinPasswordlessCode },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUpPasswordless();
    // Android (Fenix) has no keys_optional (Sync not decoupled), so signin needs
    // a password and routes to /set_password; fxa_status repeats, so answer all.
    const syncNotDecoupledStatus: FxAStatusResponse = {
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
    await signin.respondToWebChannelMessageAlways(syncNotDecoupledStatus);
    await signin.goto('/authorization', vpnSyncMobileOAuthFenixQueryParams);
    await signin.fillOutEmailFirstForm(email);

    await page.waitForURL(/signin_passwordless_code/);
    const code = await target.emailClient.getPasswordlessSigninCode(email);
    await signinPasswordlessCode.fillOutCodeForm(code);

    await page.waitForURL(/set_password/);
    await expect(
      page.getByRole('heading', { name: 'Create password to sync' })
    ).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Repeat password').fill(password);
    await page.getByRole('button', { name: 'Start syncing' }).click();

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);

    // Verify services data includes vpn
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      vpn: {},
    });
  });

  // Same as the test above, but with a v1 key-stretching account. This
  // exercises the v1→v2 upgrade path during the first sign-in
  // (password/change/start + password/change/finish), which used to
  // contribute to flakiness here. The underlying race that broke this
  // test (firefox.fxaLogin webchannel event fired BEFORE the
  // /oauth/authorization HTTP call, letting the browser's async
  // handler invalidate the session mid-flight) is fixed in
  // packages/fxa-settings/src/pages/Signin/utils.ts by reordering so
  // the OAuth code is fetched before any webchannel events fire.
  test('authorization flow - v1 account, exercises v1→v2 upgrade path', async ({
    target,
    syncOAuthBrowserPages: { page, signin },
    testAccountTracker,
  }) => {
    // Force a v1 account. testAccountTracker.signUp uses the target's
    // shared auth client which now defaults to v2; build a fresh v1
    // client just for this signup. generateEmail/generatePassword don't
    // auto-push to accounts; we push the credentials manually below.
    const v1Client = target.createAuthClient(1);
    const email = testAccountTracker.generateEmail();
    const password = testAccountTracker.generatePassword();
    const credentials = await v1Client.signUp(
      email,
      password,
      { keys: true, lang: 'en', preVerified: 'true' },
      target.ciHeader
    );
    await v1Client.deviceRegister(
      credentials.sessionToken as string,
      'playwright',
      'tester'
    );
    // Track for cleanup so the testAccountTracker fixture's auto-destroy
    // removes this account at the end of the test.
    testAccountTracker.accounts.push({
      ...credentials,
      email,
      password,
    });

    // Sync OAuth signin — triggers the v1→v2 upgrade in-band on the
    // first sign-in.
    await signin.goto('/authorization', syncMobileOAuthFenixQueryParams);
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.clearWebChannelEvents();

    // VPN authorization — cached signin view.
    await signin.goto('/authorization', vpnMobileOAuthQueryParamsNoScope);
    await expect(signin.cachedSigninHeading).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    await signin.signInButton.click();

    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      vpn: {},
    });
  });
});
