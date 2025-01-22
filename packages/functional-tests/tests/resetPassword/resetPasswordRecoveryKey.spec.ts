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

      await settings.signOut();

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

      // After using a recovery key to reset password, a new key is generated
      await expect(resetPassword.passwordResetPasswordSaved).toBeVisible();
      await expect(resetPassword.recoveryKey).toBeVisible();
      const newKey = await resetPassword.recoveryKey.innerText();
      expect(newKey.replaceAll(' ', '')).toMatch(/[A-Z0-9]{32}/);

      const keyDownload = await resetPassword.downloadRecoveryKey();
      const filename = keyDownload.suggestedFilename();
      expect(filename).toMatch(
        new RegExp(`Mozilla-Recovery-Key_[0-9-]{10}_${credentials.email}.pdf`)
      );
      expect(filename.length).toBeGreaterThan(0);

      await expect(resetPassword.recoveryKeyHintHeading).toBeVisible();
      await resetPassword.recoveryKeyHintTextbox.fill('area 51');
      await resetPassword.recoveryKeyFinishButton.click();

      await page.waitForURL(/settings/);
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      // Attempt to sign in with new password
      const { sessionToken } = await target.authClient.signIn(
        credentials.email,
        newPassword
      );

      const newAccountData = await target.authClient.sessionReauth(
        sessionToken,
        credentials.email,
        newPassword,
        {
          keys: true,
          reason: 'recovery_key',
        }
      );
      expect(newAccountData.keyFetchToken).toBeDefined();
      expect(newAccountData.unwrapBKey).toBeDefined();

      const newEncryptionKeys = await target.authClient.accountKeys(
        newAccountData.keyFetchToken as string,
        newAccountData.unwrapBKey as string
      );
      expect(originalEncryptionKeys).toEqual(newEncryptionKeys);

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
      await expect(settings.alertBar).toHaveText(
        'Your password has been reset'
      );

      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('can reset password with recovery key after changing password in settings', async ({
      target,
      pages: { settings, recoveryKey, resetPassword, signin, changePassword },
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

      // Change password
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(
        credentials.password,
        newPassword
      );

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText('Password updated');

      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);
      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      await resetPassword.fillOutRecoveryKeyForm(key);
      await resetPassword.fillOutNewPasswordForm(newPassword);

      await resetPassword.continueWithoutDownloadingRecoveryKey();

      await resetPassword.recoveryKeyHintTextbox.fill('area 51');
      await resetPassword.recoveryKeyFinishButton.click();

      await expect(settings.recoveryKey.status).toHaveText('Enabled');

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
    await settings.page.waitForURL(/settings/);
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

    return key;
  }
});
