import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

let key;
let hint;
let originalEncryptionKeys;

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

test.describe('recovery key react', () => {
  test.beforeEach(
    async ({
      target,
      credentials,
      pages: { login, settings, recoveryKey },
    }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();

      // Ensure that the react reset password route feature flag is enabled
      const config = await login.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);

      await settings.goto();
      let status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Not Set');
      await settings.recoveryKey.clickCreate();

      // Check which account recovery key generation flow to use (based on feature flag)
      // TODO in FXA-7419 - remove the condition and else block that goes through the old key generation flow
      if (config.featureFlags.showRecoveryKeyV2 === true) {
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
      } else {
        await recoveryKey.setPassword(credentials.password);
        await recoveryKey.submit();

        // Store key to be used later
        key = await recoveryKey.getKey();
        await recoveryKey.clickClose();
      }

      // Verify status as 'enabled'
      status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Enabled');

      // Ensure password reset occurs with no session token available
      login.clearCache();
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
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page has been loaded
    expect(await page.locator('#root').isEnabled()).toBeTruthy();

    await page.locator('input').fill(credentials.email);
    await page.locator('text="Begin reset"').click();
    await page.waitForURL(/confirm_reset_password/);

    // We need to append `&showReactApp=true` to reset link inorder to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    // Loads the React version
    await page.goto(link);
    expect(await page.locator('#root').isEnabled()).toBeTruthy();

    expect(
      await page.locator('text="Enter account recovery key"').isEnabled()
    ).toBeTruthy();
    await page.locator('input').fill(key);
    await page.locator('text="Confirm account recovery key"').click();
    await page.waitForURL(/account_recovery_reset_password/);

    await page.locator('input[name="newPassword"]').fill(NEW_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(NEW_PASSWORD);

    await page.locator('text="Reset password"').click();
    await page.waitForURL(/reset_password_with_recovery_key_verified/);

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

    await page.locator('text="Generate a new account recovery key"').click();
    await page.waitForURL(/settings\/account_recovery/);
  });
});
