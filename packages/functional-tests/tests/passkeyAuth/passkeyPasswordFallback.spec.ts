/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sync passkey signin + password-fallback flow, driven through the UI via the
// Sync OAuth URL (context=oauth_webchannel_v1, service=sync) so the auth-server
// sets requiresPasswordForSync=true and the SPA routes to
// /signin_passkey_fallback (the production trigger).

import { expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { OLDSYNC_SCOPE } from '../../lib/scopes';

test.describe('severity-1 #smoke', () => {
  test.describe('Sync passkey signin with password fallback', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled ||
          !config.featureFlags?.passkeyAuthenticationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('full flow: passkey sign-in into Sync routes through /signin_passkey_fallback', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinTokenCode,
        settings,
        settingsPasskeyAdd,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const { email, password } = await testAccountTracker.signUpSync();

      // Initial Sync OAuth password sign-in so we can register a passkey.
      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);
      await page.waitForURL(/signin_token_code/);
      const tokenCode = await target.emailClient.getVerifyLoginCode(email);
      await signinTokenCode.fillOutCodeForm(tokenCode);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await settings.goto();
      await expect(settings.passkey.status).toHaveText('Not set');
      await settingsPasskeyAdd.registerNewPasskey(settings, email);
      await expect(settings.passkey.status).toHaveText('Enabled');

      // The polyfill credential survives signOut via page.addInitScript.
      await settings.signOut();

      // Returning user picks passkey; service=sync routes to the fallback.
      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/signin_passkey_fallback/);
      });

      await expect(page.getByTestId('passkey-fallback-email')).toHaveText(
        email
      );

      // Password gate derives the Sync keys and emits fxaccounts:oauth_login.
      await page.getByTestId('password-input-field').fill(password);
      await page.getByTestId('continue-button').click();

      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );
    });

    test('shows an error banner when the password is wrong', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinTokenCode,
        settings,
        settingsPasskeyAdd,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const { email, password } = await testAccountTracker.signUpSync();

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);
      await page.waitForURL(/signin_token_code/);
      const tokenCode = await target.emailClient.getVerifyLoginCode(email);
      await signinTokenCode.fillOutCodeForm(tokenCode);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await settings.goto();
      await settingsPasskeyAdd.registerNewPasskey(settings, email);
      await expect(settings.passkey.status).toHaveText('Enabled');

      await settings.signOut();

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/signin_passkey_fallback/);
      });

      await page
        .getByTestId('password-input-field')
        .fill('definitely-the-wrong-password');
      await page.getByTestId('continue-button').click();

      await expect(page.getByText(/password/i).first()).toBeVisible();
    });

    test('skips /signin_totp_code through the passkey fallback for a TOTP-enrolled Sync account', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinTokenCode,
        settings,
        settingsPasskeyAdd,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      // Passkey assertion is AAL2; the fallback only derives the Sync keys.
      const credentials = await testAccountTracker.signUpSync();
      const { email, password } = credentials;

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);
      await page.waitForURL(/signin_token_code/);
      const tokenCode = await target.emailClient.getVerifyLoginCode(email);
      await signinTokenCode.fillOutCodeForm(tokenCode);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await settings.goto();
      await settingsPasskeyAdd.registerNewPasskey(settings, email);
      await expect(settings.passkey.status).toHaveText('Enabled');
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );

      await settings.signOut();

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/signin_passkey_fallback/);
      });

      await page.getByTestId('password-input-field').fill(password);
      await page.getByTestId('continue-button').click();

      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );
      expect(page.url()).not.toContain('/signin_totp_code');
      expect(page.url()).not.toContain('/inline_totp_setup');
    });
  });
});
