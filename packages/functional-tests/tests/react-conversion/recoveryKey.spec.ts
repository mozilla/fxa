import { test, expect, NEW_PASSWORD } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

const HINT = 'secret key location';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key react', () => {
    test('can reset password with recovery key', async ({
      target,
      page,
      credentials,
      pages: { configPage, settings, recoveryKey, login, resetPasswordReact },
    }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();

      // Ensure that the react reset password route feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.accountRecoveryKeyStatus).toHaveText('Not Set');

      await settings.accountRecoveryKeyCreateButton.click();

      const key = await recoveryKey.fillOutRecoveryKeyForms(
        credentials.password,
        HINT
      );

      // Verify status as 'enabled'
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.accountRecoveryKeyStatus).toHaveText('Enabled');

      // Ensure password reset occurs with no session token available
      await login.clearCache();

      // Stash original encryption keys to be verified later
      const accountData = await target.auth.sessionReauth(
        credentials.sessionToken,
        credentials.email,
        credentials.password,
        {
          keys: true,
          reason: 'recovery_key',
        }
      );
      const originalEncryptionKeys = await target.auth.accountKeys(
        accountData.keyFetchToken,
        accountData.unwrapBKey
      );

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);
      await expect(resetPasswordReact.resetEmailSentHeading).toBeVisible();

      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);

      await expect(resetPasswordReact.confirmRecoveryKeyHeading).toBeVisible();

      await resetPasswordReact.submitRecoveryKey(key);
      await page.waitForURL(/account_recovery_reset_password/);

      await resetPasswordReact.fillOutNewPasswordForm(NEW_PASSWORD);
      await page.waitForURL(/reset_password_with_recovery_key_verified/);

      // After using a recovery key to reset password, expect to be prompted to create a new one
      await resetPasswordReact.generateRecoveryKeyButton.click();
      await page.waitForURL(/settings\/account_recovery/);

      // Attempt to login with new password
      const { sessionToken } = await target.auth.signIn(
        credentials.email,
        NEW_PASSWORD
      );

      const newAccountData = await target.auth.sessionReauth(
        sessionToken,
        credentials.email,
        NEW_PASSWORD,
        {
          keys: true,
          reason: 'recovery_key',
        }
      );
      const newEncryptionKeys = await target.auth.accountKeys(
        newAccountData.keyFetchToken,
        newAccountData.unwrapBKey
      );
      expect(originalEncryptionKeys).toEqual(newEncryptionKeys);

      // Cleanup requires setting this value to correct password
      credentials.password = NEW_PASSWORD;
    });
  });
});
