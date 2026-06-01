/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sync needs a password to derive its keys, even when the account has a passkey.

import { expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { getTotpCode } from '../../lib/totp';
import { TestAccountTracker } from '../../lib/testAccountTracker';

test.describe('severity-1 #smoke', () => {
  test.describe('Sync passkey signin with set-password', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled ||
          !config.featureFlags?.passkeyAuthenticationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('passwordless+passkey signin into Sync routes through /post_verify/set_password', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinPasswordlessCode,
        settings,
        settingsPasskeyAdd,
      },
      testAccountTracker,
    }) => {
      const { email, password } = await testAccountTracker.signUpPasswordless();

      await page.goto(
        `${target.contentServerUrl}/signin?email=${encodeURIComponent(email)}`
      );
      await page.waitForURL(/signin_passwordless_code/);
      const otp = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(otp);
      await expect(settings.settingsHeading).toBeVisible();

      await settingsPasskeyAdd.registerNewPasskey(settings, email);
      await expect(settings.passkey.status).toHaveText('Enabled');

      await settings.signOut();

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/post_verify\/set_password/);
      });

      await expect(
        page.getByRole('heading', { name: 'Create password to sync' })
      ).toBeVisible();
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Repeat password').fill(password);
      await page.getByRole('button', { name: 'Start syncing' }).click();

      await signin.checkWebChannelMessageScopes(
        FirefoxCommand.OAuthLogin,
        'https://identity.mozilla.com/apps/oldsync'
      );
    });

    test('passwordless+passkey+TOTP into Sync routes through set_password without re-prompting TOTP', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        signin,
        signinPasswordlessCode,
        signinTotpCode,
        settings,
        settingsPasskeyAdd,
      },
      testAccountTracker,
    }) => {
      // Passkey assertion is AAL2; TOTP must not re-prompt before Sync OAuth.
      const { email, sessionToken, password } =
        await testAccountTracker.signUpPasswordless();

      // Enrol TOTP and mirror onto the tracker so cleanup can elevate AAL.
      const secret = await enableTotpOnAccount(target.authClient, sessionToken);
      const account = findPasswordlessAccount(testAccountTracker, email);
      account.secret = secret;
      account.sessionToken = sessionToken;

      await page.goto(
        `${target.contentServerUrl}/signin?email=${encodeURIComponent(email)}`
      );
      await page.waitForURL(/signin_passwordless_code/);
      const otp = await target.emailClient.getPasswordlessSigninCode(email);
      await signinPasswordlessCode.fillOutCodeForm(otp);
      await page.waitForURL(/signin_totp_code/);
      const totpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);
      await expect(settings.settingsHeading).toBeVisible();

      await settingsPasskeyAdd.registerNewPasskey(settings, email);
      await expect(settings.passkey.status).toHaveText('Enabled');
      await settings.signOut();

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);
      await signin.fillOutEmailFirstForm(email);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/post_verify\/set_password/);
      });

      await expect(
        page.getByRole('heading', { name: 'Create password to sync' })
      ).toBeVisible();
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Repeat password').fill(password);
      await page.getByRole('button', { name: 'Start syncing' }).click();

      await signin.checkWebChannelMessageScopes(
        FirefoxCommand.OAuthLogin,
        'https://identity.mozilla.com/apps/oldsync'
      );
      expect(page.url()).not.toContain('/signin_totp_code');
      expect(page.url()).not.toContain('/inline_totp_setup');
    });
  });
});

function findPasswordlessAccount(tracker: TestAccountTracker, email: string) {
  const account = tracker.accounts.find((a) => a.email === email);
  if (!account) {
    throw new Error(
      `signUpPasswordless did not record an account for ${email}`
    );
  }
  return account;
}
