/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { RecoveryKeyPage } from '../../pages/settings/recoveryKey';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key react', () => {
    test('can reset password with recovery key', async ({
      target,
      page,
      pages: { recoveryKey, resetPassword, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinAccount(
        credentials.email,
        credentials.password,
        settings,
        signin
      );

      const key = await enableRecoveryKey(
        credentials.password,
        recoveryKey,
        settings
      );

      // Stash original encryption keys to be verified later
      const accountData = await target.authClient.sessionReauth(
        credentials.sessionToken,
        credentials.email,
        credentials.password,
        {
          keys: true,
          reason: 'recovery_key',
        }
      );
      expect(accountData.keyFetchToken).toBeDefined();
      expect(accountData.unwrapBKey).toBeDefined();

      const originalEncryptionKeys = await target.authClient.accountKeys(
        accountData.keyFetchToken as string,
        accountData.unwrapBKey as string
      );

      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      await resetPassword.fillOutRecoveryKeyForm(key);
      await resetPassword.fillOutNewPasswordForm(newPassword);

      // After using a recovery key to reset password, expect to be prompted to create a new one
      await expect(page).toHaveURL(/reset_password_with_recovery_key_verified/);
      await expect(resetPassword.passwordResetSuccessMessage).toBeVisible();
      await expect(resetPassword.generateRecoveryKeyButton).toBeVisible();

      // User is shown a prompt to generate a new recovery key
      // and is signed in after the password reset so can click through to create a new key.
      await resetPassword.generateRecoveryKeyButton.click();
      await expect(recoveryKey.accountRecoveryKeyHeading).toBeVisible();
      await recoveryKey.createRecoveryKey(newPassword, 'hint');

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('forgot password has account recovery key but skip using it', async ({
      target,
      pages: { settings, recoveryKey, resetPassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinAccount(
        credentials.email,
        credentials.password,
        settings,
        signin
      );

      await enableRecoveryKey(credentials.password, recoveryKey, settings);

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
      await expect(settings.alertBar).toHaveText(
        'Your password has been reset'
      );

      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      // update password for cleanup function
      credentials.password = newPassword;
    });
  });

  async function signinAccount(
    email: string,
    password: string,
    settings: SettingsPage,
    signin: SigninPage
  ): Promise<void> {
    await signin.goto();
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await expect(settings.settingsHeading).toBeVisible();
  }

  async function enableRecoveryKey(
    password: string,
    recoveryKey: RecoveryKeyPage,
    settings: SettingsPage
  ): Promise<string> {
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

    await settings.recoveryKey.createButton.click();
    const key = await recoveryKey.createRecoveryKey(password, 'hint');

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');

    await settings.signOut();

    return key;
  }
});
