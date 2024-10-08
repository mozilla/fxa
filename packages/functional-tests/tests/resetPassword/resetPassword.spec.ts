/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';

test.describe('severity-1 #smoke', () => {
  test('can reset password', async ({
    page,
    target,
    pages: { signin, resetPassword, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );

    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.settingsHeading).toBeVisible();

    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });

  const testCases = [
    {
      name: 'short password',
      error: 'At least 8 characters',
      password: '2short',
    },
    {
      name: 'common password',
      error: 'Not a commonly used password',
      password: 'password',
    },
    { name: 'email as password', error: 'Not your email' },
  ];
  for (const { name, error, password } of testCases) {
    test(`cannot set an invalid password - ${name}`, async ({
      target,
      pages: { page, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const passwordValue = password ?? credentials.email;

      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      await resetPassword.fillOutNewPasswordForm(passwordValue, false);

      await expect(page.getByText(error)).toBeVisible();
      await expect(resetPassword.resetPasswordButton).toBeDisabled();
      await expect(resetPassword.newPasswordInput).toHaveClass(
        /border-red-700/
      );
    });
  }

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    pages: { resetPassword },
  }) => {
    await resetPassword.goto('/confirm_reset_password');

    // Verify its redirected to reset password page
    await expect(resetPassword.resetPasswordHeading).toBeVisible();
  });

  test('open /reset_password page from /signin', async ({
    pages: { signin, resetPassword },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signin.goto();
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.forgotPasswordLink.click();

    await expect(resetPassword.resetPasswordHeading).toBeVisible();
  });

  test('open confirm_reset_password page, click resend', async ({
    pages: { resetPassword },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await resetPassword.goto();

    await resetPassword.fillOutEmailForm(credentials.email);

    resetPassword.resendButton.click();

    await expect(resetPassword.statusBar).toHaveText(/Email re-?sent/);
  });

  test('open /reset_password page, enter unknown email, wait for error', async ({
    pages: { resetPassword },
  }) => {
    await resetPassword.goto();

    await resetPassword.fillOutEmailForm('email@restmail.net');

    await expect(resetPassword.statusBar).toHaveText('Unknown account');
  });

  test('browse directly to page with email on query params', async ({
    pages: { resetPassword },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await resetPassword.goto(undefined, `email=${credentials.email}`);

    //The email shouldn't be pre-filled
    const emailInput = await resetPassword.emailTextbox.inputValue();
    expect(emailInput).toEqual('');

    await resetPassword.fillOutEmailForm(credentials.email);

    await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();
  });

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
    await expect(settings.totp.status).toHaveText('Not Set');

    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication enabled'
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
    let totpCode = await getCode(secret);
    await resetPassword.fillOutTotpForm(totpCode);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(page).toHaveURL(/signin/);
    await expect(resetPassword.passwordResetSuccessMessage).toBeVisible();
    await signin.fillOutPasswordForm(newPassword);

    totpCode = await getCode(secret);
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(totpCode);

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
    await expect(settings.totp.status).toHaveText('Not Set');

    await settings.totp.addButton.click();
    const { secret, recoveryCodes } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication enabled'
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

    await expect(page).toHaveURL(/signin/);
    await expect(resetPassword.passwordResetSuccessMessage).toBeVisible();
    await signin.fillOutPasswordForm(newPassword);

    const totpCode = await getCode(secret);
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(totpCode);

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
    await expect(settings.totp.status).toHaveText('Not Set');

    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication enabled'
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

    await expect(page).toHaveURL(/signin/);
    await expect(
      resetPassword.passwordResetSuccessRecovyerKeyReminderHeading
    ).toBeVisible();
    await expect(
      resetPassword.passwordResetSuccessRecovyerKeyReminderMessage
    ).toBeVisible();

    await signin.fillOutPasswordForm(newPassword);

    // Prompted for 2FA on new login
    const totpCode = await getCode(secret);
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(totpCode);

    await expect(settings.settingsHeading).toBeVisible();

    // Recovery key has been consumed
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

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
    await expect(settings.totp.status).toHaveText('Not Set');

    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText(
      'Two-step authentication enabled'
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
    let totpCode = await getCode(secret);
    await resetPassword.fillOutTotpForm(totpCode);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(page).toHaveURL(/signin/);
    await expect(resetPassword.passwordResetSuccessMessage).toBeVisible();
    await signin.fillOutPasswordForm(newPassword);

    // Prompted for 2FA on new login
    totpCode = await getCode(secret);
    await page.waitForURL(/signin_totp_code/);
    await signinTotpCode.fillOutCodeForm(totpCode);

    await expect(settings.settingsHeading).toBeVisible();

    // Recovery key has been removed
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

    // Remove TOTP before teardown
    await settings.disconnectTotp();
    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
  });
});
