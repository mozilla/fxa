/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import {
  syncMobileOAuthFenixQueryParams,
  vpnMobileOAuthQueryParams,
} from '../../lib/query-params';

test.describe('vpn integration', () => {
  test('authorization flow - user already signed into Firefox', async ({
    syncOAuthBrowserPages: { page, signin },
    testAccountTracker,
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
    await signin.goto('/authorization', vpnMobileOAuthQueryParams);

    // User is already signed in — cached signin view, no password required
    await expect(signin.cachedSigninHeading).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // Install listeners before the click so the dispatched events can't be
    // missed by a slow polling cycle.
    const oauthLoginPromise = signin.waitForWebChannelMessage(
      FirefoxCommand.OAuthLogin
    );
    const loginPromise = signin.waitForWebChannelMessage(FirefoxCommand.Login);

    await signin.signInButton.click();

    const oauthLogin = await oauthLoginPromise;
    expect(oauthLogin.scopes).toEqual(
      expect.stringContaining('https://identity.mozilla.com/apps/vpn')
    );

    const login = await loginPromise;
    expect(login.services).toEqual({ vpn: {} });
  });
});
