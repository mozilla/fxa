/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';
import {
  syncDesktopOAuthQueryParams,
  syncMobileOAuthQueryParams,
} from '../../lib/query-params';

/**
 * Auth state machine — OAuth native (Sync desktop/mobile via oauth_webchannel_v1) sign-in E2E.
 *
 * Flag delivery: authStateMachine=true is appended to the syncDesktopOAuthQueryParams /
 * syncMobileOAuthQueryParams set and passed to signin.goto('/authorization', params),
 * matching the pattern used in tests/oauth/syncSignIn.spec.ts for the same fixture.
 *
 * These tests mirror the coverage in tests/oauth/syncSignIn.spec.ts but with the
 * authStateMachine flag on, and additionally assert the fxaOAuthLogin and fxaLogin
 * web-channel messages fired by the native path.
 */

// Base params with the machine flag set — derived from syncDesktopOAuthQueryParams.
const desktopParams = (() => {
  const p = new URLSearchParams(syncDesktopOAuthQueryParams);
  p.set('authStateMachine', 'true');
  return p;
})();

const mobileParams = (() => {
  const p = new URLSearchParams(syncMobileOAuthQueryParams);
  p.set('authStateMachine', 'true');
  return p;
})();

test.describe('auth-machine: OAuth native (oauth_webchannel_v1) sign-in', () => {
  test('verified Sync-Desktop account reaches connect-another-device and fires fxaOAuthLogin + fxaLogin web-channel messages', async ({
    target,
    syncOAuthBrowserPages: {
      page,
      signin,
      signinTokenCode,
      connectAnotherDevice,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();

    // Confirm the flag is present in the URL that reaches FxA.
    await signin.listenToWebChannelMessages();
    await signin.goto('/authorization', desktopParams);
    await expect(page).toHaveURL(/authStateMachine=true/);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    // signUpSync uses a restmail address so a session token code is always required.
    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();

    // Key native-path assertions: both web-channel messages must fire.
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('unverified-session Sync-Desktop account routes to /signin_token_code, then reaches Sync destination + fires web-channel messages', async ({
    target,
    syncOAuthBrowserPages: {
      page,
      signin,
      signinTokenCode,
      connectAnotherDevice,
    },
    testAccountTracker,
  }) => {
    // preVerified: 'true' — email verified but every session requires OTP confirmation.
    const credentials = await testAccountTracker.signUpSync({
      lang: 'en',
      service: 'sync',
      preVerified: 'true',
    });

    await signin.listenToWebChannelMessages();
    await signin.goto('/authorization', desktopParams);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('unverified-email account routes to /confirm_signup_code, then reaches signup_confirmed_sync', async ({
    target,
    syncOAuthBrowserPages: {
      page,
      signin,
      confirmSignupCode,
      signupConfirmedSync,
    },
    testAccountTracker,
  }) => {
    // preVerified: 'false' — email not confirmed; sign-in routes to confirm_signup_code.
    // After code entry the destination is signup_confirmed_sync (not connectAnotherDevice),
    // matching the syncSignin.spec.ts pattern for new unverified accounts.
    const credentials = await testAccountTracker.signUpSync({
      lang: 'en',
      service: 'sync',
      preVerified: 'false',
    });

    await signin.listenToWebChannelMessages();
    await signin.goto('/authorization', desktopParams);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/confirm_signup_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('TOTP-enabled Sync-Desktop account routes to /signin_totp_code then reaches Sync destination', async ({
    target,
    syncOAuthBrowserPages: {
      page,
      signin,
      signinTokenCode,
      signinTotpCode,
      connectAnotherDevice,
      settings,
      totp,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();

    // Enable TOTP via a non-Sync settings session first.
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await page.waitForURL(/signin_token_code/);
    const setupCode = await target.emailClient.getVerifyLoginCode(
      credentials.email
    );
    await signinTokenCode.fillOutCodeForm(setupCode);
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();

    await settings.totp.addButton.click();
    await settings.confirmMfaGuard(credentials.email);
    // Read recovery-phone availability so TOTP setup skips the chooser when it's unavailable.
    const { available: recoveryPhoneAvailable } =
      await target.authClient.recoveryPhoneAvailable(credentials.sessionToken);
    const { secret } = await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(
      credentials,
      recoveryPhoneAvailable
    );
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    // Now sign in via native OAuth with the machine flag.
    await signin.listenToWebChannelMessages();
    await signin.goto('/authorization', desktopParams);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_totp_code/);
    const totpCode = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(totpCode);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('verified Sync-Mobile (iOS) account signs in and fires fxaOAuthLogin web-channel message', async ({
    target,
    syncOAuthBrowserPages: { page, signin, signinTokenCode },
    testAccountTracker,
  }) => {
    // syncMobileOAuthQueryParams (iOS client 1b1a3e44c54fbb58) omits service=sync,
    // so the post-auth destination is not connectAnotherDevice — the flow sends
    // OAuthLogin and Login web-channel events via the native webchannel path.
    const credentials = await testAccountTracker.signUpSync();

    await signin.listenToWebChannelMessages();
    await signin.goto('/authorization', mobileParams);
    await expect(page).toHaveURL(/authStateMachine=true/);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);

    // The mobile client fires OAuthLogin (and Login) via web-channel on success.
    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });
});
