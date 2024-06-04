/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../../lib/email';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that the react reset password route feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9728, remove these tests'
      );
    });

    test('can reset password with recovery key', async ({
      target,
      page,
      pages: { settings, recoveryKey, signinReact, login, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();

      const key = await recoveryKey.createRecoveryKey(
        credentials.password,
        HINT
      );

      // Verify status as 'enabled'
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      // Ensure password reset occurs with no session token available
      await login.clearCache();

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
      await expect(
        resetPasswordReact.confirmResetPasswordHeading
      ).toBeVisible();

      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);
      await resetPasswordReact.fillOutRecoveryKeyForm(key);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;
      // After using a recovery key to reset password, expect to be prompted to create a new one
      await resetPasswordReact.generateRecoveryKeyButton.click();
      await page.waitForURL(/settings\/account_recovery/);

      // Attempt to login with new password
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
    });

    test('forgot password has account recovery key but skip using it', async ({
      target,
      page,
      pages: { settings, recoveryKey, resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.recoveryKey.createButton.click();
      await recoveryKey.createRecoveryKey(credentials.password, 'hint');

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);
      await resetPasswordReact.forgotKeyLink.click();
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');
    });
  });
});
