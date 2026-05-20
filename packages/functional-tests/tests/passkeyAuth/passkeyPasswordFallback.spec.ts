/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Browser-driven Sync passkey signin + password-fallback flow: enroll a
// passkey, simulate a new-device passkey ceremony via auth-client, seed the
// resulting session, then drive /signin_passkey_fallback from a fresh browser.

import { Page } from '@playwright/test';
import { PublicKeyCredentialJSON } from '../../../fxa-auth-client/lib/client';
import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import {
  VirtualAuthenticator,
  VirtualCredential,
} from '../../../../libs/accounts/passkey/src/lib/virtual-authenticator';
import { BaseTarget } from '../../lib/targets/base';

async function seedAccountInLocalStorage(
  page: Page,
  args: { uid: string; sessionToken: string; email: string }
) {
  await page.evaluate(({ uid, sessionToken, email }) => {
    const account = { uid, sessionToken, email, verified: true };
    window.localStorage.setItem(
      '__fxa_storage.accounts',
      JSON.stringify({ [uid]: account })
    );
    window.localStorage.setItem(
      '__fxa_storage.currentAccountUid',
      JSON.stringify(uid)
    );
  }, args);
}

async function simulateNewDevicePasskeyAuth(
  target: BaseTarget,
  credential: VirtualCredential
) {
  const origin = target.contentServerUrl;
  const rpId = new URL(target.contentServerUrl).hostname;
  const authStart = await target.authClient.beginPasskeyAuthentication();
  const assertion = VirtualAuthenticator.createAssertionResponse(credential, {
    challenge: authStart.challenge,
    origin,
    rpId,
  });
  return target.authClient.completePasskeyAuthentication(
    assertion as PublicKeyCredentialJSON,
    authStart.challenge,
    { service: 'sync' }
  );
}

test.describe('severity-1 #smoke', () => {
  test.describe('Sync passkey signin with password fallback', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('full flow: enable passkey → fallback page submit signs into Sync', async ({
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
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.passkey.status).toHaveText('Not set');

      await settingsPasskeyAdd.initPasskeys(page);
      await settingsPasskeyAdd.passkeyAuth.success(async () => {
        await settings.passkey.createButton.click();
        await settings.confirmMfaGuard(email);
      });
      await expect(settings.passkey.status).toHaveText('Enabled');

      const [credential] =
        settingsPasskeyAdd.passkeyAuth.getCredentialObjects();
      const authFinish = await simulateNewDevicePasskeyAuth(target, credential);
      expect(authFinish.requiresPasswordForSync).toBe(true);

      // Simulate a fresh device so the fallback page hydrates from the seeded
      // passkey session, not leftover state from the initial Sync OAuth flow.
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await seedAccountInLocalStorage(page, {
        uid: authFinish.uid,
        sessionToken: authFinish.sessionToken,
        email,
      });

      await page.goto(
        `${target.contentServerUrl}/signin_passkey_fallback?${syncDesktopOAuthQueryParams}`
      );

      await expect(page.getByTestId('passkey-fallback-email')).toHaveText(
        email
      );

      await page.getByTestId('password-input-field').fill(password);
      await page.getByTestId('continue-button').click();

      await signin.checkWebChannelMessageScopes(
        FirefoxCommand.OAuthLogin,
        'https://identity.mozilla.com/apps/oldsync'
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
      await settingsPasskeyAdd.initPasskeys(page);
      await settingsPasskeyAdd.passkeyAuth.success(async () => {
        await settings.passkey.createButton.click();
        await settings.confirmMfaGuard(email);
      });
      await expect(settings.passkey.status).toHaveText('Enabled');

      const [credential] =
        settingsPasskeyAdd.passkeyAuth.getCredentialObjects();
      const authFinish = await simulateNewDevicePasskeyAuth(target, credential);

      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await seedAccountInLocalStorage(page, {
        uid: authFinish.uid,
        sessionToken: authFinish.sessionToken,
        email,
      });

      await page.goto(
        `${target.contentServerUrl}/signin_passkey_fallback?${syncDesktopOAuthQueryParams}`
      );
      await page
        .getByTestId('password-input-field')
        .fill('definitely-the-wrong-password');
      await page.getByTestId('continue-button').click();

      await expect(page.getByText(/password/i).first()).toBeVisible();
    });
  });
});
