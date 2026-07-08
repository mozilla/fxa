/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getTotpCode } from '../../lib/totp';

const AUTH_MACHINE_QUERY = 'authStateMachine=true';

/** Auth state machine — reset-password E2E. */
test.describe('auth-machine: reset-password', () => {
  test('plain account reset (no recovery key, no TOTP) lands at settings', async ({
    target,
    page,
    pages: { resetPassword, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await page.goto(
      `${target.contentServerUrl}/reset_password?${AUTH_MACHINE_QUERY}`
    );
    await page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Machine routes to /complete_reset_password after OTP for plain account
    await resetPassword.fillOutNewPasswordForm(newPassword);

    // Machine handoff to /settings on success
    await expect(settings.settingsHeading).toBeVisible();

    credentials.password = newPassword;
  });

  test('account with TOTP routes to confirm_totp_reset_password after OTP', async ({
    target,
    page,
    pages: { signin, resetPassword, settings, totp },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    // Sign in and set up TOTP
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
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

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    // Start reset with auth state machine flag
    await page.goto(
      `${target.contentServerUrl}/reset_password?${AUTH_MACHINE_QUERY}`
    );
    await page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Machine's routeAfterResetOtp sends TOTP accounts to confirm_totp_reset_password
    await page.waitForURL(/confirm_totp_reset_password/);
    await expect(page.getByLabel('Enter 6-digit code')).toBeVisible();

    const totpCode = await getTotpCode(secret);
    await resetPassword.fillOutTotpForm(totpCode);

    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText('Your password has been reset');

    testAccountTracker.updateAccountPassword(credentials.email, newPassword);
  });

  test('account with recovery key routes to account_recovery_confirm_key after OTP', async ({
    target,
    page,
    pages: { signin, resetPassword, settings, recoveryKey },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    // Sign in and create a recovery key
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    await settings.recoveryKey.createButton.click();
    await settings.confirmMfaGuard(credentials.email);
    const key = await recoveryKey.createRecoveryKey(
      credentials.password,
      'hint'
    );
    await expect(settings.recoveryKey.status).toHaveText('Enabled');
    await settings.signOut();

    // Start reset with auth state machine flag
    await page.goto(
      `${target.contentServerUrl}/reset_password?${AUTH_MACHINE_QUERY}`
    );
    await page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Machine routes to recovery key confirmation (account_recovery_confirm_key)
    await expect(resetPassword.confirmRecoveryKeyHeading).toBeVisible();

    await resetPassword.fillOutRecoveryKeyForm(key);
    await resetPassword.fillOutNewPasswordForm(newPassword);

    // After using a recovery key, a new one is generated — confirm the save screen
    await expect(resetPassword.passwordResetPasswordSaved).toBeVisible();
    await resetPassword.continueWithoutDownloadingRecoveryKey();
    await resetPassword.recoveryKeyFinishButton.click();

    await expect(settings.settingsHeading).toBeVisible();
    // Recovery key is consumed and automatically regenerated
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    credentials.password = newPassword;
  });

  test('skip recovery key uses forgotKeyLink then completes reset', async ({
    target,
    page,
    pages: { signin, resetPassword, settings, recoveryKey },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    // Sign in and create a recovery key
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();

    await settings.recoveryKey.createButton.click();
    await settings.confirmMfaGuard(credentials.email);
    await recoveryKey.createRecoveryKey(credentials.password, 'hint');
    await expect(settings.recoveryKey.status).toHaveText('Enabled');
    await settings.signOut();

    // Start reset with auth state machine flag
    await page.goto(
      `${target.contentServerUrl}/reset_password?${AUTH_MACHINE_QUERY}`
    );
    await page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Machine routes to recovery key confirmation, but user skips it
    await expect(resetPassword.confirmRecoveryKeyHeading).toBeVisible();
    await resetPassword.forgotKeyLink.click();

    // Data-loss warning should be visible before completing reset without the key
    await expect(resetPassword.dataLossWarning).toBeVisible();
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText('Your password has been reset');
    // Key is deleted when skipped
    await expect(settings.recoveryKey.status).toHaveText('Not set');

    credentials.password = newPassword;
  });
});
