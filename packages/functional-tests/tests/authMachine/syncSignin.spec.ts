/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';
import { FirefoxCommand } from '../../lib/channels';

/**
 * Auth state machine — Sync (fx_desktop_v3 / web-channel) sign-in E2E.
 *
 * All tests append &authStateMachine=true to the Sync URL so the machine
 * handles the flow, then assert the same destinations the non-machine Sync
 * path reaches (connectAnotherDevice.fxaConnected, /signin_token_code, etc.).
 */

const SYNC_URL = (contentServerUrl: string) =>
  `${contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&authStateMachine=true`;

test.describe('auth-machine: sync sign-in', () => {
  test('verified account reaches connect-another-device and fires fxaLogin web-channel message', async ({
    target,
    syncBrowserPages: { page, signin, connectAnotherDevice },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await signin.listenToWebChannelMessages();
    await page.goto(SYNC_URL(target.contentServerUrl));
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    await signin.checkWebChannelMessage(FirefoxCommand.Login);
  });

  test('unverified session routes to /signin_token_code, then reaches connect-another-device after code entry', async ({
    target,
    syncBrowserPages: { page, signin, connectAnotherDevice, signinTokenCode },
    testAccountTracker,
  }) => {
    // signUpSync with preVerified: 'true' creates an account whose email is
    // verified but whose sessions require email-OTP confirmation on each sign-in.
    const credentials = await testAccountTracker.signUpSync({
      lang: 'en',
      service: 'sync',
      preVerified: 'true',
    });

    await page.goto(SYNC_URL(target.contentServerUrl));
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await signinTokenCode.fillOutCodeForm(code);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();
  });

  test('TOTP-enabled account routes to /signin_totp_code, then reaches connect-another-device', async ({
    target,
    syncBrowserPages: {
      page,
      signin,
      connectAnotherDevice,
      settings,
      totp,
      signinTotpCode,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    // Sign in to settings via the non-Sync flow and enable TOTP.
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
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

    // Now sign in via Sync with the machine flag on.
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&authStateMachine=true`,
      { waitUntil: 'load' }
    );
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_totp_code/);
    const code = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(code);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();
  });

  test('unverified account (email not confirmed) routes to /confirm_signup_code, then reaches signupConfirmedSync', async ({
    target,
    syncBrowserPages: { page, signin, signupConfirmedSync, confirmSignupCode },
    testAccountTracker,
  }) => {
    // preVerified: 'false' creates an account whose email has not been confirmed.
    const credentials = await testAccountTracker.signUpSync({
      lang: 'en',
      service: 'sync',
      preVerified: 'false',
    });

    await page.goto(SYNC_URL(target.contentServerUrl));
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/confirm_signup_code/);
    const code = await target.emailClient.getVerifyLoginCode(credentials.email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();
  });

  test('blocked account routes to /signin_unblock, then reaches connect-another-device after unblock code', async ({
    target,
    syncBrowserPages: {
      page,
      signin,
      signinUnblock,
      connectAnotherDevice,
      settings,
      deleteAccount,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpBlocked({
      lang: 'en',
      service: 'sync',
      preVerified: 'true',
    });

    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&authStateMachine=true`
    );
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(page).toHaveURL(/signin_unblock/);
    const code = await target.emailClient.getUnblockCode(credentials.email);
    await signinUnblock.fillOutCodeForm(code);

    await expect(connectAnotherDevice.fxaConnected).toBeVisible();

    // Blocked accounts must be deleted before teardown can succeed.
    await connectAnotherDevice.clickNotNowPair();
    await page.waitForURL(/settings/);
    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(credentials.password);
    await expect(page.getByText('Account deleted successfully')).toBeVisible();
  });
});
