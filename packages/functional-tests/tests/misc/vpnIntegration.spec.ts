/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import {
  syncMobileOAuthFenixQueryParams,
  vpnMobileOAuthQueryParams,
  vpnSyncMobileOAuthFenixQueryParams,
} from '../../lib/query-params';
import { PROFILE_SCOPE, VPN_SCOPE } from '../../lib/scopes';

test.describe('vpn integration', () => {
  // Disabled while we investigate the flaky cached-signin -> WebChannel race.
  test.fixme(
    'authorization flow - user already signed into Firefox',
    async ({ syncOAuthBrowserPages: { page, signin }, testAccountTracker }) => {
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
    }
  );

  test('passwordless VPN + Sync signin on Android routes to set password when Sync is not decoupled', async ({
    target,
    syncOAuthBrowserPages: { page, signin, signinPasswordlessCode },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUpPasswordless();
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
  });
});
