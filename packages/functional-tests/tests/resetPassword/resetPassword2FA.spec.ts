/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';

test.describe('severity-1 #smoke', () => {
  test('can reset password with 2FA enabled', async ({
    page,
    target,
    pages: { signin, resetPassword, settings, totp, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Invalid code
    await resetPassword.fillOutTotpForm('123123');
    resetPassword.page.getByText('Valid code required', {
      exact: true,
    });

    // Fill out the TOTP form
    const totpCode = await getCode(secret);
    await resetPassword.fillOutTotpForm(totpCode);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.alertBar).toHaveText('Your password has been reset');

    await expect(settings.settingsHeading).toBeVisible();

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can reset password with 2FA recovery code', async ({
    page,
    target,
    pages: { signin, resetPassword, settings, totp, signinTotpCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    const { secret, recoveryCodes } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Fill out the Recovery code form
    await resetPassword.clickTroubleEnteringCode();

    // Invalid code
    await resetPassword.fillOurRecoveryCodeForm('37ja610wze');
    await expect(
      resetPassword.page.getByText('Backup authentication code not found')
    ).toBeVisible();

    await resetPassword.fillOurRecoveryCodeForm(recoveryCodes[0]);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.alertBar).toHaveText('Your password has been reset');

    await expect(settings.settingsHeading).toBeVisible();

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can reset password with recovery key and 2FA enabled but not prompted', async ({
    page,
    target,
    pages: {
      signin,
      resetPassword,
      settings,
      totp,
      signinTotpCode,
      recoveryKey,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    // Enable 2FA
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    // Create recovery key
    await settings.recoveryKey.createButton.click();
    const key = await recoveryKey.createRecoveryKey(
      credentials.password,
      'hint'
    );

    // Verify status as 'enabled'
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Not prompted for 2FA during reset password
    await resetPassword.fillOutRecoveryKeyForm(key);
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(resetPassword.passwordResetPasswordSaved).toBeVisible();

    await resetPassword.continueWithoutDownloadingRecoveryKey();
    await resetPassword.recoveryKeyFinishButton.click();

    await expect(settings.settingsHeading).toBeVisible();

    // Recovery key has been consumed and a new one created
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can reset password with 2FA and forgot recovery key', async ({
    page,
    target,
    pages: {
      signin,
      resetPassword,
      settings,
      totp,
      signinTotpCode,
      recoveryKey,
    },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    // Enable 2FA
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    // Create recovery key
    await settings.recoveryKey.createButton.click();
    await recoveryKey.createRecoveryKey(credentials.password, 'hint');

    // Verify status as 'enabled'
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Not prompted for 2FA during reset password
    await expect(resetPassword.confirmRecoveryKeyHeading).toBeVisible();

    // Click forgot recovery key
    await resetPassword.forgotKeyLink.click();

    await page.waitForURL(/confirm_totp_reset_password/);

    // Fill out the TOTP form
    const totpCode = await getCode(secret);
    await resetPassword.fillOutTotpForm(totpCode);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.alertBar).toHaveText('Your password has been reset');

    await expect(settings.settingsHeading).toBeVisible();

    // Recovery key has been removed
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can reset password with unverified 2FA and skip recovery key', async ({
    page,
    target,
    pages: { signin, resetPassword, settings, totp, recoveryKey },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    // Enable 2FA
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    await totp.fillOutStep1FormQR();
    await page.getByTestId('flow-container-back-btn').click();
    await page.getByTestId('flow-container-back-btn').click();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).not.toHaveText('Enabled');

    // Create recovery key
    await settings.recoveryKey.createButton.click();
    await recoveryKey.createRecoveryKey(credentials.password, 'hint');

    // Verify status as 'enabled'
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    await settings.signOut();
    await resetPassword.goto();
    await resetPassword.fillOutEmailForm(credentials.email);
    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    await resetPassword.forgotKeyLink.click();
    await expect(resetPassword.dataLossWarning).toBeVisible();
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText('Your password has been reset');

    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });
});
