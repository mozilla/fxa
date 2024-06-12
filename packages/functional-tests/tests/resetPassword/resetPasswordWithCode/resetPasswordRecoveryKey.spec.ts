/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { SettingsPage } from '../../../pages/settings';
import { SigninReactPage } from '../../../pages/signinReact';
import { RecoveryKeyPage } from '../../../pages/settings/recoveryKey';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that the react reset password route feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('can reset password with recovery key', async ({
      target,
      page,
      pages: { recoveryKey, resetPasswordReact, settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signin(
        credentials.email,
        credentials.password,
        settings,
        signinReact
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
      const originalEncryptionKeys = await target.authClient.accountKeys(
        accountData.keyFetchToken,
        accountData.unwrapBKey
      );

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);

      await resetPasswordReact.fillOutRecoveryKeyForm(key);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      // After using a recovery key to reset password, expect to be prompted to create a new one
      await expect(resetPasswordReact.generateRecoveryKeyButton).toBeVisible();
      await resetPasswordReact.generateRecoveryKeyButton.click();

      // TODO in FXA-7904 - Verify that a new recovery key is generated without needing to sign in again
      // not currently implemented
      await page.waitForURL(/settings\/account_recovery/);

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
      const newEncryptionKeys = await target.authClient.accountKeys(
        newAccountData.keyFetchToken,
        newAccountData.unwrapBKey
      );
      expect(originalEncryptionKeys).toEqual(newEncryptionKeys);

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('forgot password has account recovery key but skip using it', async ({
      target,
      pages: { settings, recoveryKey, resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signin(
        credentials.email,
        credentials.password,
        settings,
        signinReact
      );

      await enableRecoveryKey(credentials.password, recoveryKey, settings);

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);
      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);
      await resetPasswordReact.forgotKeyLink.click();
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      await signin(credentials.email, newPassword, settings, signinReact);

      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      // update password for cleanup function
      credentials.password = newPassword;
    });
  });

  async function signin(
    email: string,
    password: string,
    settings: SettingsPage,
    signinReact: SigninReactPage
  ): Promise<void> {
    await signinReact.goto();
    await signinReact.fillOutEmailFirstForm(email);
    await signinReact.fillOutPasswordForm(password);

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
