/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Passwordless Sync through the browser: a passkey sign-in that needs the
 * password once, opts in, and signs in to Sync without the password after.
 *
 * Decline, no-PRF, no-wrap, mobile, promo-order and reload branches are unit
 * tested in fxa-settings; `passkeyWrapApi.spec.ts` checks the recovered kB.
 */

import {
  Page,
  expect,
  closeSyncBrowser,
  newPagesForSync,
  test,
} from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import {
  gotoSyncSession,
  requestBrowserSignedInUser,
} from '../../lib/sync-helpers';
import { OLDSYNC_SCOPE } from '../../lib/scopes';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SettingsPasskeyAddPage } from '../../pages/settings/passkey';
import { SigninPage } from '../../pages/signin';

/**
 * Create an account and register a passkey on it (non-sync settings flow).
 */
async function setUpAccountWithPasskey({
  target,
  page,
  settings,
  settingsPasskeyAdd,
  signin,
  testAccountTracker,
}: {
  target: BaseTarget;
  page: Page;
  settings: SettingsPage;
  settingsPasskeyAdd: SettingsPasskeyAddPage;
  signin: SigninPage;
  testAccountTracker: TestAccountTracker;
}): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();
  await settingsPasskeyAdd.registerNewPasskey(settings, credentials.email);
  await expect(settings.passkey.status).toHaveText('Enabled');
  return credentials;
}

/**
 * Start a Sync sign-in and submit the passkey. `settled` must resolve once the
 * assertion has been consumed, since the authenticator only answers inside
 * the `assertion` callback.
 */
async function passkeySyncSignIn(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  settingsPasskeyAdd: SettingsPasskeyAddPage,
  email: string,
  settled: () => Promise<unknown>
): Promise<void> {
  await gotoSyncSession(page, target);
  await page.waitForURL(/action=email/, { timeout: 15000 });
  await signin.fillOutEmailFirstForm(email);
  await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
    await signin.clickPasskeySigninAfterEmailFirst();
    await settled();
  });
}

test.describe('severity-1 #smoke', () => {
  test.describe('passwordless Sync sign-in with a passkey', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled ||
          !config.featureFlags?.passkeyAuthenticationEnabled ||
          !config.featureFlags?.passkeyPasswordlessSyncEnabled,
        'Passwordless Sync is not enabled'
      );
    });

    test('opts in after a password sign-in, then signs in to Sync without the password', async ({
      target,
      syncOAuthBrowserPages: { page, signin, settings, settingsPasskeyAdd },
      testAccountTracker,
    }) => {
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      const { email, password } = credentials;
      await settings.signOut();

      // No wrap yet, so the passkey needs the password once.
      await passkeySyncSignIn(
        target,
        page,
        signin,
        settingsPasskeyAdd,
        email,
        () => page.waitForURL(/signin_passkey_fallback/)
      );
      await page
        .getByTestId('signin-passkey-fallback-password-input-field')
        .fill(password);
      await page.getByTestId('continue-button').click();

      await page.waitForURL(/inline_passwordless_sync_setup/);
      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );
      await page.getByRole('button', { name: 'Enable passkey' }).click();
      await page.waitForURL(/settings/);
      await expect(
        page.getByText('This passkey is enabled for sync sign-in')
      ).toBeVisible();

      // Firefox resets its identity.fxaccounts.* prefs to production on
      // sign-out (FxAccountsConfig.resetConfigURLs), which moves its web
      // channel off the local stack. The passwordless sign-in runs in a fresh
      // Sync browser with the same passkey.
      const second = await newPagesForSync(target, 'oauth_webchannel_v1');
      try {
        await second.settingsPasskeyAdd.initPasskeys(
          second.page,
          settingsPasskeyAdd.passkeyAuth.getCredentialObjects()
        );
        const visited: string[] = [];
        second.page.on('framenavigated', (frame) => visited.push(frame.url()));
        // keys_jwe without a fallback visit shows Sync keys were delivered
        // without the password.
        const authorization = second.page.waitForRequest(
          (request) =>
            request.url().endsWith('/oauth/authorization') &&
            request.method() === 'POST'
        );

        await passkeySyncSignIn(
          target,
          second.page,
          second.signin,
          second.settingsPasskeyAdd,
          email,
          () => authorization
        );

        expect((await authorization).postDataJSON()).toHaveProperty('keys_jwe');
        await second.signin.checkWebChannelMessageScope(
          FirefoxCommand.OAuthLogin,
          OLDSYNC_SCOPE
        );
        await expect
          .poll(() => requestBrowserSignedInUser(second.page))
          .toMatchObject({ uid: credentials.uid, verified: true });
        expect(visited).not.toContainEqual(
          expect.stringContaining('signin_passkey_fallback')
        );
      } finally {
        await closeSyncBrowser(second);
      }
    });
  });
});
