import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

let key;
let hint;
let originalEncryptionKeys;

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery key react', () => {
    test.beforeEach(
      async ({
        target,
        credentials,
        pages: { login, configPage, settings, recoveryKey },
      }) => {
        // Generating and consuming recovery keys is a slow process
        test.slow();

        // Ensure that the react reset password route feature flag is enabled
        const config = await configPage.getConfig();
        test.skip(config.showReactApp.resetPasswordRoutes !== true);

        await settings.goto();
        let status = await settings.recoveryKey.statusText();
        expect(status).toEqual('Not Set');

        await settings.goto();
        await settings.recoveryKey.clickCreate();
        // View 1/4 info
        await recoveryKey.clickStart();
        // View 2/4 confirm password and generate key
        await recoveryKey.setPassword(credentials.password);
        await recoveryKey.submit();

        // View 3/4 key download
        // Store key to be used later
        key = await recoveryKey.getKey();
        await recoveryKey.clickNext();

        // View 4/4 hint
        // store hint to be used later
        hint = 'secret key location';
        await recoveryKey.setHint(hint);
        await recoveryKey.clickFinish();

        // Verify status as 'enabled'
        status = await settings.recoveryKey.statusText();
        expect(status).toEqual('Enabled');

        // Ensure password reset occurs with no session token available
        await login.clearCache();
        // Stash original encryption keys to be verified later
        const res = await target.auth.sessionReauth(
          credentials.sessionToken,
          credentials.email,
          credentials.password,
          {
            keys: true,
            reason: 'recovery_key',
          }
        );
        originalEncryptionKeys = await target.auth.accountKeys(
          res.keyFetchToken,
          res.unwrapBKey
        );
      }
    );

    test('can reset password with recovery key', async ({
      credentials,
      target,
      page,
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      // Verify react page is loaded
      await page.waitForSelector('#root');

      await resetPasswordReact.fillEmailToResetPwd(credentials.email);
      await resetPasswordReact.confirmResetPasswordHeadingVisible();

      // We need to append `&showReactApp=true` to reset link in order to enroll in reset password experiment
      let link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      link = `${link}&showReactApp=true`;

      // Loads the React version
      await page.goto(link);
      // Verify react page is loaded
      await page.waitForSelector('#root');

      await resetPasswordReact.confirmRecoveryKeyHeadingVisible();

      await resetPasswordReact.submitRecoveryKey(key);
      await page.waitForURL(/account_recovery_reset_password/);

      await resetPasswordReact.submitNewPassword(NEW_PASSWORD);
      await page.waitForURL(/reset_password_with_recovery_key_verified/);

      // After using a recovery key to reset password, expect to be prompted to create a new one
      await page
        .getByRole('button', { name: 'Generate a new account recovery key' })
        .click();
      await page.waitForURL(/settings\/account_recovery/);

      // Attempt to login with new password
      const { sessionToken } = await target.auth.signIn(
        credentials.email,
        NEW_PASSWORD
      );

      const res = await target.auth.sessionReauth(
        sessionToken,
        credentials.email,
        NEW_PASSWORD,
        {
          keys: true,
          reason: 'recovery_key',
        }
      );
      const newEncryptionKeys = await target.auth.accountKeys(
        res.keyFetchToken,
        res.unwrapBKey
      );
      expect(originalEncryptionKeys).toEqual(newEncryptionKeys);

      // Cleanup requires setting this value to correct password
      credentials.password = NEW_PASSWORD;
    });
  });
});
