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
import { enableTotpOnAccount } from '../../lib/pairing-helpers';
import { EmailType } from '../../lib/email';

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
      const { email } = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await clearSession(page);
      // Isolate the sign-in email from setup emails.
      await target.emailClient.clear(email);
      await page.goto(target.contentServerUrl);

      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/settings/);
      });

      await expect(settings.settingsHeading).toBeVisible();

      const newDeviceLogin = await target.emailClient.waitForEmail(
        email,
        EmailType.newDeviceLogin
      );
      expect(newDeviceLogin.subject).toMatch(
        /new sign-in to your mozilla account/i
      );
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

      // Land on /signin's password form, then pick passkey instead of typing.
      await signin.fillOutEmailFirstForm(email);
      await expect(signin.passwordFormHeading).toBeVisible();

      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/settings/);
      });

      await expect(settings.settingsHeading).toBeVisible();
    });

    test('shows a warning banner when the user cancels the WebAuthn prompt', async ({
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
          // A cancelled ceremony now surfaces a warning banner, not the error banner.
          await expect(
            page.getByText(/Couldn’t sign in with a passkey/i)
          ).toBeVisible();
        }
      );

      // Cancelled ceremony keeps the user on email-first so they can retry.
      expect(page.url()).toBe(signinUrl);
    });

    test('signs in via passkey into a non-AAL2 OAuth RP for an account without TOTP', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
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
      await settings.signOut();

      await relier.goto();
      await relier.clickEmailFirst();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL((url) => url.href.startsWith(target.relierUrl));
      });

      expect(page.url()).not.toContain('/signin_token_code');
      expect(page.url()).not.toContain('/signin_totp_code');
      expect(page.url()).not.toContain('/inline_totp_setup');
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('skips /signin_totp_code when an OAuth RP without AAL2 signs the user in via passkey on a TOTP account', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin, relier },
      testAccountTracker,
    }) => {
      // Passkey session is verified with no verificationMethod, so
      // handleNavigation must skip /signin_totp_code and grant directly.
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );
      await settings.signOut();

      await relier.goto();
      await relier.clickEmailFirst();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL((url) => url.href.startsWith(target.relierUrl));
      });

      expect(page.url()).not.toContain('/signin_totp_code');
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('completes sign-in on an AAL2-requiring RP when the passkey account already has TOTP', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin, relier },
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
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );
      await settings.signOut();

      await relier.goto();
      await relier.clickRequire2FA();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL((url) => url.href.startsWith(target.relierUrl));
      });

      expect(page.url()).not.toContain('/signin_totp_code');
      expect(page.url()).not.toContain('/inline_totp_setup');
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('forces /inline_totp_setup when an AAL2-requiring RP signs in a passkey user without TOTP', async ({
      target,
      pages: {
        page,
        inlineTotpSetup,
        relier,
        settings,
        settingsPasskeyAdd,
        signin,
        totp,
      },
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
      await settings.signOut();

      await relier.goto();
      await relier.clickRequire2FA();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/inline_totp_setup/);
      });

      // Force TOTP enrollment so non-passkey sign-ins also satisfy AMR.
      const { available: recoveryPhoneAvailable } =
        await target.authClient.recoveryPhoneAvailable(
          credentials.sessionToken
        );
      await totp.completeInlineSetupWithBackupCodes(
        inlineTotpSetup,
        credentials,
        recoveryPhoneAvailable
      );

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('AMO-style profile AAL2: passkey-only user is diverted to TOTP setup before the RP grant', async ({
      target,
      pages: {
        page,
        inlineTotpSetup,
        relier,
        settings,
        settingsPasskeyAdd,
        signin,
        totp,
      },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'requires the local 123done /api/profile_aal2 toggle'
      );
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await settings.signOut();

      await relier.goto();
      await relier.clickRequireProfileAAL2();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/inline_totp_setup/);
      });

      const { available: recoveryPhoneAvailable } =
        await target.authClient.recoveryPhoneAvailable(
          credentials.sessionToken
        );
      await totp.completeInlineSetupWithBackupCodes(
        inlineTotpSetup,
        credentials,
        recoveryPhoneAvailable
      );

      expect(await relier.isLoggedIn()).toBe(true);
      // Session AAL2 from the passkey signin; account AAL2 from the
      // divert-triggered TOTP enrolment. A divert regression would leave
      // account_aal2 false and trip 123done's bounce loop.
      expect(await relier.hasSessionAAL2Badge()).toBe(true);
      expect(await relier.hasAccountAAL2Badge()).toBe(true);
    });

    test('AMO-style profile AAL2: account already has TOTP completes without the divert', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'requires the local 123done /api/profile_aal2 toggle'
      );
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );
      await settings.signOut();

      await relier.goto();
      await relier.clickRequireProfileAAL2();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL((url) => url.href.startsWith(target.relierUrl));
      });

      expect(page.url()).not.toContain('/inline_totp_setup');
      expect(await relier.isLoggedIn()).toBe(true);
      expect(await relier.hasSessionAAL2Badge()).toBe(true);
      expect(await relier.hasAccountAAL2Badge()).toBe(true);
    });

    test('AMO-style profile AAL2: passwordless account using passkey signin without TOTP is diverted to inline TOTP setup', async ({
      target,
      pages: {
        page,
        signin,
        signinPasswordlessCode,
        settings,
        settingsPasskeyAdd,
        relier,
      },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'requires the local 123done /api/profile_aal2 toggle'
      );

      // A passwordless account that signs in with a passkey provides session
      // AAL2, but an AMO-style RP also requires profile AAL2 (account-level
      // 2FA). With no TOTP, the user must be diverted to inline TOTP setup
      // rather than bounced back to the passwordless code screen in a loop.
      // This test owns the passwordless-path divert and stops at the divert;
      // completing the enrolment and asserting account AAL2 is already covered
      // by the passkey-only divert test above (identical once on the setup
      // page) and is too costly to repeat through the passwordless flow.

      // Create a passwordless account and register a passkey on it.
      const { email } = await testAccountTracker.signUpPasswordless();

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

      // Sign in to the profile-AAL2 RP using the passkey button on the
      // passwordless code screen. No TOTP yet, so the divert must fire instead
      // of looping back to the passwordless code screen.
      await relier.goto();
      await relier.clickRequireProfileAAL2();
      await signin.fillOutEmailFirstForm(email);
      await page.waitForURL(/signin_passwordless_code/);
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL(/inline_totp_setup/);
      });
    });

    test('AMO-style profile AAL2: cached passkey session (no fresh ceremony) without TOTP is diverted to inline TOTP setup, not looped', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'requires the local 123done /api/profile_aal2 toggle'
      );

      // Establish an active session-AAL2 session by signing in WITH the
      // passkey (AMR {pwd, webauthn}). The account has no TOTP.
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await settings.signOut();
      await signInWithRegisteredPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        email: credentials.email,
      });

      // Reuse the existing passkey session (cached-signin path, not a fresh
      // ceremony). The cached grant satisfies session AAL2, so without the
      // divert the RP bounces and the user loops on the cached-signin screen.
      await relier.goto();
      await relier.clickRequireProfileAAL2();
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      // No TOTP on the account, so FxA must divert to inline TOTP setup.
      await page.waitForURL(/inline_totp_setup/);
    });

    test('AMO-style profile AAL2: cached passkey session with TOTP already enabled completes without the divert', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      test.skip(
        target.name !== 'local',
        'requires the local 123done /api/profile_aal2 toggle'
      );

      // Account with a passkey AND TOTP already enrolled.
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      credentials.secret = await enableTotpOnAccount(
        target.authClient,
        credentials.sessionToken
      );
      await settings.signOut();
      await signInWithRegisteredPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        email: credentials.email,
      });

      // Cached signin into the profile-AAL2 RP. Account 2FA is already
      // satisfied (TOTP enrolled), so the user skips enrollment (no divert)
      // and the grant completes.
      await relier.goto();
      await relier.clickRequireProfileAAL2();
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();
      await page.waitForURL((url) => url.href.startsWith(target.relierUrl));

      expect(page.url()).not.toContain('/inline_totp_setup');
      expect(await relier.isLoggedIn()).toBe(true);
      expect(await relier.hasSessionAAL2Badge()).toBe(true);
      expect(await relier.hasAccountAAL2Badge()).toBe(true);
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

      // Server-side delete only; the polyfill still produces an assertion
      // for the now-unknown credentialId, mirroring PASSKEY_NOT_FOUND.
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

    test('shows an error banner when the assertion response has an invalid signature', async ({
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

      await settingsPasskeyAdd.passkeyAuth.corrupt(
        async () => {
          await signin.passkeySigninButton.click();
        },
        async () => {
          // Tampered assertion → passkeyAuthenticationFailed → generic banner.
          await expect(page.getByRole('alert')).toContainText(
            /Something went wrong/i
          );
        }
      );
    });

    test('forces /inline_totp_setup when password sign-in on an account with a passkey enrolled hits an AAL2 RP', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      // Passkey enrolment alone doesn't satisfy AAL2 for a password session,
      // so an AAL2 RP must still divert to /inline_totp_setup.
      const credentials = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await settings.signOut();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);
      await expect(
        page.getByRole('heading', { name: /Set up two-step authentication/i })
      ).toBeVisible();
    });

    test('shows the passkey button on prompt=login re-auth and completes sign-in via passkey', async ({
      target,
      pages: { page, relier, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      // prompt=login forces a fresh auth; the passkey button should still
      // appear so the user can re-authenticate without typing the password.
      const { email } = await setUpAccountWithPasskey({
        target,
        page,
        settings,
        settingsPasskeyAdd,
        signin,
        testAccountTracker,
      });
      await settings.signOut();

      await page.goto(`${target.relierUrl}/api/prompt_login`);
      await signin.fillOutEmailFirstForm(email);
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(signin.passkeySigninButton).toBeVisible();
      await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
        await signin.passkeySigninButton.click();
        await page.waitForURL((url) => url.href.startsWith(target.relierUrl));
      });
      expect(await relier.isLoggedIn()).toBe(true);
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
 * Signs in with a previously registered passkey (assumes the user is signed
 * out but the polyfill credential is still discoverable). Leaves the user on
 * Settings with an active session-AAL2 session (AMR {pwd, webauthn}).
 */
async function signInWithRegisteredPasskey({
  target,
  page,
  settings,
  settingsPasskeyAdd,
  signin,
  email,
}: {
  target: BaseTarget;
  page: Page;
  settings: SettingsPage;
  settingsPasskeyAdd: SettingsPasskeyAddPage;
  signin: SigninPage;
  email: string;
}) {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(email);
  await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
    await signin.passkeySigninButton.click();
    await page.waitForURL(/settings/);
  });
  await expect(settings.settingsHeading).toBeVisible();
}

// Signs out without clearing the polyfill installed via `addInitScript`,
// so previously minted credentials stay discoverable.
async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
