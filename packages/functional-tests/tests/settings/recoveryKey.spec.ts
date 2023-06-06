import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import fs from 'fs';

let status;
let key;
let hint;

// TODO in FXA-7419 - remove this first describe block that refers to the old account recovery generation flow
test.describe('old recovery key test', () => {
  test.beforeEach(
    async ({ credentials, pages: { login, settings, recoveryKey } }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();

      const config = await login.getConfig();
      test.skip(config.featureFlags.showRecoveryKeyV2 === true);

      await settings.goto();
      let status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Not Set');
      await settings.recoveryKey.clickCreate();
      await recoveryKey.setPassword(credentials.password);
      await recoveryKey.submit();

      // Store key to be used later
      key = await recoveryKey.getKey();
      await recoveryKey.clickClose();

      // Verify status as 'enabled'
      status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Enabled');
    }
  );

  test('revoke recovery key', async ({ pages: { settings } }) => {
    console.log('old test');
    await settings.recoveryKey.clickRemove();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    status = await settings.recoveryKey.statusText();

    // Verify status as 'not set'
    expect(status).toEqual('Not Set');
  });

  test('create new recovery key, use old key and verify cannot change password', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login },
  }) => {
    // Create new recovery key
    await settings.recoveryKey.clickRemove();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();

    // Store new key to be used later
    const secondKey = await recoveryKey.getKey();
    await recoveryKey.clickClose();
    await settings.signOut();

    // Use old key to reset password
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'load' });
    await login.setRecoveryKey(key);
    await recoveryKey.confirmRecoveryKey();

    // Verify the error
    expect(await recoveryKey.invalidRecoveryKeyError()).toContain(
      'Invalid account recovery key'
    );

    // Enter new recovery key
    await login.setRecoveryKey(secondKey);
    await login.submit();

    // Reset password
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Verify login successful
    expect(await login.loginHeader()).toBe(true);
  });

  test('can reset password when forgot recovery key', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login },
  }) => {
    await settings.signOut();

    // Use old key to reset password
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'networkidle' });
    await recoveryKey.clickLostRecoveryKey();

    // Reset password
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Verify login successful
    expect(await login.loginHeader()).toBe(true);
  });

  test('cannot reuse recovery key', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login, resetPassword },
  }) => {
    await settings.signOut();

    // Use old key to reset password
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link);
    await login.setRecoveryKey(key);
    await recoveryKey.confirmRecoveryKey();

    // Reset password
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Attempt to reuse reset link,
    let link2 = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link2 = `${link2}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link2, { waitUntil: 'load' });

    // Verify reset link expired
    expect(await resetPassword.resetPasswordLinkExpiredHeader()).toBe(true);
  });

  test('use account recovery key', async ({
    credentials,
    target,
    pages: { page, login, recoveryKey, settings },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.signOut();
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'networkidle' });
    await login.setRecoveryKey(key);
    await login.submit();
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();
    await login.login(credentials.email, credentials.password);
    let status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
    await recoveryKey.clickClose();
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Enabled');
  });
});

// TODO in FXA-7419 - rename describe block (remove "new")
test.describe('new recovery key test', () => {
  test.beforeEach(
    async ({ credentials, pages: { login, settings, recoveryKey } }) => {
      // Generating and consuming recovery keys is a slow process
      // Mail delivery can also be slow
      test.slow();

      const config = await login.getConfig();
      test.skip(config.featureFlags.showRecoveryKeyV2 !== true);

      await settings.goto();
      let status = await settings.recoveryKey.statusText();
      expect(status).toEqual('Not Set');
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
    }
  );

  test('can copy and download recovery key', async ({
    credentials,
    pages: { recoveryKey, settings },
  }) => {
    // Create new recovery key
    await settings.recoveryKey.clickCreate();
    // View 1/4 info
    await recoveryKey.clickStart();
    // View 2/4 confirm password and generate key
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();

    // View 3/4 key download
    // Store key to be used later
    const newKey = await recoveryKey.getKey();

    // Test copy
    const clipboard = await recoveryKey.clickCopy();
    expect(clipboard).toEqual(newKey);

    // Test download
    const dl = await recoveryKey.clickDownload();
    // Verify filename is as expected
    const date = new Date().toISOString().split('T')[0];
    const suggestedFileName = dl.suggestedFilename();
    expect(suggestedFileName.length).toBeLessThanOrEqual(75);
    expect(suggestedFileName).toBe(
      `Firefox-Recovery-Key_${date}_${credentials.email}.txt`
    );

    // Test uses try/finally to ensure the downloaded file is deleted after tests
    // whether or not the assertions passed
    const filePath = suggestedFileName;
    try {
      // Verify file is downloaded
      await dl.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBeTruthy();
      // Verify downloaded file contains key
      const downloadedContent = fs.readFileSync(filePath, 'utf-8');
      expect(downloadedContent).toContain(newKey);
    } finally {
      // Delete the downloaded file
      await fs.promises.unlink(filePath);
    }

    // After download, navigated to 'hint' page
    const newHint = 'secret key location';
    await recoveryKey.setHint(newHint);
    await recoveryKey.clickFinish();

    // Verify status as 'enabled'
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Enabled');
  });

  test('use account recovery key', async ({
    credentials,
    target,
    pages: { page, login, settings },
  }) => {
    await settings.signOut();
    // Reset password with recovery key
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'networkidle' });
    await login.setRecoveryKey(key);
    await login.submit();
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();

    // Sign out and sign back in to verify new password works
    await settings.signOut();
    expect(credentials.password).toContain('_new');
    await login.login(credentials.email, credentials.password);
    expect(await login.loginHeader()).toBe(true);

    // Verify key revoked after use
    const status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });

  test('change recovery key, and verify cannot change password with old key', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login },
  }) => {
    // Create new recovery key
    await settings.recoveryKey.clickCreate();
    // View 1/4 info
    await recoveryKey.clickStart();
    // View 2/4 confirm password and generate key
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();

    // View 3/4 key download
    // Store key to be used later
    const newKey = await recoveryKey.getKey();
    await recoveryKey.clickNext();

    // View 4/4 hint
    // store hint to be used later
    const newHint = 'new secret key location';
    await recoveryKey.setHint(newHint);
    await recoveryKey.clickFinish();

    // Check that key is enabled
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Enabled');

    await settings.signOut();

    // Attempt to use old key to reset password
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'load' });
    await login.setRecoveryKey(key);
    await recoveryKey.confirmRecoveryKey();

    // Verify the error
    expect(await recoveryKey.invalidRecoveryKeyError()).toContain(
      'Invalid account recovery key'
    );

    // Enter new recovery key
    await login.setRecoveryKey(newKey);
    await login.submit();

    // Reset password
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Verify login successful with password reset with new recovery key
    expect(await login.loginHeader()).toBe(true);

    // Verify that new account recovery key revoked
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });

  test('can reset password when forgot recovery key', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login },
  }) => {
    await settings.signOut();

    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link, { waitUntil: 'networkidle' });
    // Directed to "confirm recovery key" page, but lost the key
    // Click on the lost recovery key link
    await recoveryKey.clickLostRecoveryKey();

    // Reset password without a recovery key
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Verify login successful
    expect(await login.loginHeader()).toBe(true);

    // Verify that account recovery key has been revoked after password reset
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });

  test('cannot reuse link to reset password with account recovery key', async ({
    credentials,
    target,
    page,
    pages: { settings, recoveryKey, login, resetPassword },
  }) => {
    await settings.signOut();

    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&forceExperiment=generalizedReactApp&forceExperimentGroup=control`;
    await page.goto(link);
    await login.setRecoveryKey(key);
    await recoveryKey.confirmRecoveryKey();

    // Reset password
    credentials.password = credentials.password + '_new';
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    await settings.signOut();

    // login
    await login.login(credentials.email, credentials.password);

    // Verify login successful
    expect(await login.loginHeader()).toBe(true);

    // Verify that account recovery key has been revoked after password reset
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');

    // Attempt to reuse reset link
    await page.goto(link, { waitUntil: 'load' });

    // Verify reset link expired
    expect(await resetPassword.resetPasswordLinkExpiredHeader()).toBe(true);
  });

  test('revoke recovery key', async ({ pages: { settings } }) => {
    await settings.recoveryKey.clickDelete();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    status = await settings.recoveryKey.statusText();

    // Verify status as 'not set'
    expect(status).toEqual('Not Set');
  });
});
