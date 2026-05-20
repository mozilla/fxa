/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Passkey sign-in flow. Requires the same flags as the registration suite
 * (FEATURE_FLAGS_PASSKEYS_ENABLED, FEATURE_FLAGS_PASSKEY_REGISTRATION_ENABLED)
 * plus FEATURE_FLAGS_PASSKEY_AUTHENTICATION_ENABLED on the content server, and
 * passkeys.enabled=true on the auth-server. The suite is skipped at runtime
 * if any of those report as disabled.
 */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SettingsPasskeyAddPage } from '../../pages/settings/passkey';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('passkey sign-in', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled ||
          !config.featureFlags?.passkeyAuthenticationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('signs in with a registered passkey from email-first', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await clearSession(page);
      await page.goto(target.contentServerUrl);

      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/settings/);
      });

      await expect(settings.settingsHeading).toBeVisible();
    });

    test('signs in with a registered passkey from /signin after submitting an email', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
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
      await clearSession(page);
      await page.goto(target.contentServerUrl);

      // Submit the email on email-first to land on /signin's password form,
      // then choose passkey from there instead of typing the password.
      await signin.fillOutEmailFirstForm(email);
      await expect(signin.passwordFormHeading).toBeVisible();

      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/settings/);
      });

      await expect(settings.settingsHeading).toBeVisible();
    });

    test('shows an error banner when the user cancels the WebAuthn prompt', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await clearSession(page);
      await page.goto(target.contentServerUrl);

      const signinUrl = page.url();

      await settingsPasskeyAdd.passkeyAuth.fail(
        async () => {
          await signin.passkeySigninButton.click();
        },
        async () => {
          // Banner renders with role="alert" for error type. Match by role
          // and assert it contains *some* mention of the failed sign-in to
          // avoid coupling to the exact localized string.
          await expect(page.getByRole('alert')).toContainText(
            /Sign-in with passkey failed/i
          );
        }
      );

      // The hook keeps the user on the email-first page after a cancelled
      // ceremony so they can retry or choose another method.
      expect(page.url()).toBe(signinUrl);
    });

    test('shows the "passkey not recognized" banner when the server no longer knows the credential', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
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

      // Delete the passkey server-side; the polyfill keeps the credential in
      // memory so a sign-in attempt still produces an assertion for the now
      // unknown credentialId — exactly the divergence PASSKEY_NOT_FOUND covers
      // (e.g. user deleted from another device, authenticator retained it).
      await settings.deletePasskey(email);
      await expect(settings.passkey.status).toHaveText('Not set');

      await clearSession(page);
      await page.goto(target.contentServerUrl);

      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await expect(page.getByRole('alert')).toContainText(
          /Passkey not recognized/i
        );
      });
    });
  });
});

/**
 * Signs up a fresh account, signs in with password, then registers a passkey
 * via Settings. Leaves the user on the Settings page with a polyfill-minted
 * credential available to subsequent sign-in attempts.
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

  return credentials;
}

/**
 * Drops cookies and localStorage so the next visit to the content server is
 * treated as fully signed-out. The page-level passkey polyfill (installed via
 * `page.addInitScript`) survives the clear, so previously minted credentials
 * remain discoverable in the next ceremony.
 */
async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
}
