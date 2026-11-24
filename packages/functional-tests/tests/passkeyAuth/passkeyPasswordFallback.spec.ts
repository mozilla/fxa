/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sync passkey signin via the real /pair handshake: the passkey can't derive
// Sync keys, so Sync routes to /signin_passkey_fallback for the password.

import { Page, expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { gotoSyncSession } from '../../lib/sync-helpers';
import { OLDSYNC_SCOPE } from '../../lib/scopes';
import { EmailType } from '../../lib/email';
import { signUpAndSwapPrimaryEmail } from '../../lib/primaryEmailSwap';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SettingsPasskeyAddPage } from '../../pages/settings/passkey';
import { SigninPage } from '../../pages/signin';

/** Create an account and register a passkey on it (non-sync settings flow). */
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
 * Drive a returning Sync passkey sign-in into /signin_passkey_fallback (the
 * passkey can't derive Sync keys). Left submitted for the caller to assert.
 */
async function reachPasskeyFallback(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  settingsPasskeyAdd: SettingsPasskeyAddPage,
  email: string
): Promise<void> {
  await gotoSyncSession(page, target);
  await page.waitForURL(/action=email/, { timeout: 15000 });
  await signin.fillOutEmailFirstForm(email);
  await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
    await signin.clickPasskeySigninAfterEmailFirst();
    await page.waitForURL(/signin_passkey_fallback/);
  });
  await expect(page.getByTestId('passkey-fallback-email')).toHaveText(email);
}

async function passkeyFallbackSignIn(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  settingsPasskeyAdd: SettingsPasskeyAddPage,
  creds: { email: string; password: string }
): Promise<void> {
  await reachPasskeyFallback(
    target,
    page,
    signin,
    settingsPasskeyAdd,
    creds.email
  );
  await page
    .getByTestId('signin-passkey-fallback-password-input-field')
    .fill(creds.password);
  await page.getByTestId('continue-button').click();
}

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
      syncOAuthBrowserPages: { page, signin, settings, settingsPasskeyAdd },
      testAccountTracker,
    }) => {
      const { email, password } = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });

      await settings.signOut();
      await target.emailClient.clear(email);

      await passkeyFallbackSignIn(target, page, signin, settingsPasskeyAdd, {
        email,
        password,
      });

      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );

      const newDeviceLogin = await target.emailClient.waitForEmail(
        email,
        EmailType.newDeviceLogin
      );
      expect(newDeviceLogin.subject).toMatch(
        /new sign-in to your mozilla account/i
      );
    });

    test('shows an error banner when the password is wrong', async ({
      target,
      syncOAuthBrowserPages: { page, signin, settings, settingsPasskeyAdd },
      testAccountTracker,
    }) => {
      const { email } = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });

      await settings.signOut();
      await target.emailClient.clear(email);

      await reachPasskeyFallback(
        target,
        page,
        signin,
        settingsPasskeyAdd,
        email
      );
      await page
        .getByTestId('signin-passkey-fallback-password-input-field')
        .fill('definitely-the-wrong-password');
      await page.getByTestId('continue-button').click();

      await expect(page.getByText('Incorrect password')).toBeVisible();
    });

    test('v1 account: wrong password in the fallback after a primary email swap shows incorrect password', async ({
      target,
      syncOAuthBrowserPages: { page, signin, settings, settingsPasskeyAdd },
      testAccountTracker,
    }) => {
      const { account, primaryEmail } = await signUpAndSwapPrimaryEmail(
        target,
        testAccountTracker,
        1
      );
      await page.goto(`${target.contentServerUrl}?stretch=1`);
      await signin.fillOutEmailFirstForm(primaryEmail);
      await signin.fillOutPasswordForm(account.password);
      await expect(settings.settingsHeading).toBeVisible();
      await settingsPasskeyAdd.registerNewPasskey(settings, primaryEmail);
      await expect(settings.passkey.status).toHaveText('Enabled');

      await settings.signOut();
      await target.emailClient.clear(primaryEmail);

      await reachPasskeyFallback(
        target,
        page,
        signin,
        settingsPasskeyAdd,
        primaryEmail
      );
      const passwordInput = page.getByTestId(
        'signin-passkey-fallback-password-input-field'
      );
      await passwordInput.fill(testAccountTracker.generatePassword());
      await page.getByTestId('continue-button').click();

      await expect(signin.tooltip).toHaveText('Incorrect password');
      await expect(page.getByText('Incorrect email case')).toBeHidden();

      await passwordInput.fill(account.password);
      await page.getByTestId('continue-button').click();
      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );
    });

    test('skips /signin_totp_code through the passkey fallback for a TOTP-enrolled Sync account', async ({
      target,
      syncOAuthBrowserPages: { page, signin, settings, settingsPasskeyAdd },
      testAccountTracker,
    }) => {
      // Passkey assertion is AAL2; the fallback only derives the Sync keys.
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      const { email, password } = credentials;
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        await testAccountTracker.getMfaJwtForScope(
          '2fa',
          credentials.sessionToken,
          email
        )
      );

      await settings.signOut();
      await target.emailClient.clear(email);

      await passkeyFallbackSignIn(target, page, signin, settingsPasskeyAdd, {
        email,
        password,
      });

      await signin.checkWebChannelMessageScope(
        FirefoxCommand.OAuthLogin,
        OLDSYNC_SCOPE
      );
      expect(page.url()).not.toContain('/signin_totp_code');
      expect(page.url()).not.toContain('/inline_totp_setup');
    });
  });
});
