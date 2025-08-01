/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';
import {
  TargetName,
  getFromEnvWithFallback,
  getPhoneNumber,
  usingRealTestPhoneNumber,
} from '../../lib/targets';

test.describe('severity-1 #smoke', () => {
  test('can reset password with 2FA enabled', async ({
    target,
    pages: { signin, resetPassword, settings, totp },
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
    const { secret } = await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

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
    target,
    pages: { signin, resetPassword, settings, totp },
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
    const { recoveryCodes } =
      await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

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

    await resetPassword.fillOurRecoveryCodeForm(recoveryCodes[0]);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.alertBar).toHaveText('Your password has been reset');

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can reset password with recovery key and 2FA enabled but not prompted', async ({
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
    await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

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
    const { secret } = await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

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

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.totp.status).toHaveText('Disabled');

    await settings.totp.addButton.click();
    await totp.setUp2faAppWithQrCode();
    await page.goto(`${target.contentServerUrl}/settings`);

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

test.describe('reset password with recovery phone', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ target }) => {
    /**
     * Important! Twilio does not allow you to fetch messages when using test
     * credentials. Twilio also does not allow you to send messages to magic
     * test numbers with real credentials.
     *
     * Therefore, if a 'magic' test number is configured, then we need to
     * use redis to peek at codes sent out, and if a 'real' testing phone
     * number is being being used, then we need to check the Twilio API for
     * the message sent out and look at the code within.
     */
    if (
      usingRealTestPhoneNumber(target.name) &&
      !target.smsClient.isTwilioEnabled()
    ) {
      throw new Error('Twilio must be enabled when using a real test number.');
    }
    if (
      !usingRealTestPhoneNumber(target.name) &&
      !target.smsClient.isRedisEnabled()
    ) {
      throw new Error('Redis must be enabled when using a real test number.');
    }
  });

  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(config.featureFlags.recoveryPhonePasswordReset2fa !== true);
  });

  test('can reset password with 2FA enabled using recovery phone', async ({
    page,
    target,
    pages: { signin, resetPassword, settings, totp, recoveryPhone },
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
    await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    await settings.totp.addRecoveryPhoneButton.click();
    await page.waitForURL(/recovery_phone\/setup/);

    await expect(recoveryPhone.addHeader()).toBeVisible();

    await recoveryPhone.enterPhoneNumber(getPhoneNumber(target.name));
    await recoveryPhone.clickSendCode();

    await expect(recoveryPhone.confirmHeader).toBeVisible();

    let smsCode = await target.smsClient.getCode(
      getPhoneNumber(target.name),
      credentials.uid
    );

    await recoveryPhone.enterCode(smsCode);
    await recoveryPhone.clickConfirm();

    await page.waitForURL(/settings/);
    await expect(settings.alertBar).toHaveText('Recovery phone added');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    await page.waitForURL(/confirm_totp_reset_password/);

    await resetPassword.clickTroubleEnteringCode();

    await page.waitForURL(/reset_password_totp_recovery_choice/);

    await resetPassword.clickChoosePhone();
    await resetPassword.clickContinueButton();

    await page.waitForURL(/reset_password_recovery_phone/);

    smsCode = await target.smsClient.getCode(
      getPhoneNumber(target.name),
      credentials.uid
    );

    await resetPassword.fillRecoveryPhoneCodeForm(smsCode);

    await resetPassword.clickConfirmButton();

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.alertBar).toHaveText('Your password has been reset');

    await expect(settings.settingsHeading).toBeVisible();

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  test('can use backup code after failing sms code', async ({
    page,
    target,
    pages: { signin, resetPassword, settings, totp, recoveryPhone },
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
    const { recoveryCodes } =
      await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication has been enabled'
    );
    await expect(settings.totp.status).toHaveText('Enabled');

    await settings.totp.addRecoveryPhoneButton.click();
    await page.waitForURL(/recovery_phone\/setup/);

    await expect(recoveryPhone.addHeader()).toBeVisible();

    await recoveryPhone.enterPhoneNumber(getPhoneNumber(target.name));
    await recoveryPhone.clickSendCode();

    await expect(recoveryPhone.confirmHeader).toBeVisible();

    let smsCode = await target.smsClient.getCode(
      getPhoneNumber(target.name),
      credentials.uid
    );

    await recoveryPhone.enterCode(smsCode);
    await recoveryPhone.clickConfirm();

    await page.waitForURL(/settings/);
    await expect(settings.alertBar).toHaveText('Recovery phone added');

    await settings.signOut();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );
    await resetPassword.fillOutResetPasswordCodeForm(code);

    await page.waitForURL(/confirm_totp_reset_password/);

    await resetPassword.clickTroubleEnteringCode();

    await page.waitForURL(/reset_password_totp_recovery_choice/);

    await resetPassword.clickChoosePhone();
    await resetPassword.clickContinueButton();

    await page.waitForURL(/reset_password_recovery_phone/);

    smsCode = await target.smsClient.getCode(
      getPhoneNumber(target.name),
      credentials.uid
    );

    await resetPassword.fillRecoveryPhoneCodeForm(
      `${Number(smsCode) + 1}`.padStart(smsCode.length, '0')
    );

    await resetPassword.clickConfirmButton();

    await expect(resetPassword.errorBanner).toBeVisible();
    await resetPassword.errorBannerBackupCodeLink.click();
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
});
