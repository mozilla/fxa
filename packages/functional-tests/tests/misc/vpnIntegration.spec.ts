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

    await signin.signInButton.click();

    // Verify fxaOAuthLogin was sent with VPN scopes
    await signin.checkWebChannelMessageScopes(
      FirefoxCommand.OAuthLogin,
      'https://identity.mozilla.com/apps/vpn'
    );

    // Verify services data includes vpn
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      vpn: {},
    });
  });
});
