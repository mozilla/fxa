import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

let status;
let key;

test.describe('recovery key test', () => {
  test.beforeEach(
    async ({ credentials, page, pages: { settings, recoveryKey } }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();
      
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
    // Generating and consuming recovery keys is a slow process
    test.slow();
    let secondKey;

    // Create new recovery key
    await settings.recoveryKey.clickRemove();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();

    // Store new key to be used later
    secondKey = await recoveryKey.getKey();
    await recoveryKey.clickClose();
    await settings.signOut();

    // Use old key to reset password
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    await login.setEmail(credentials.email);
    await login.submit();
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'load' });
    await login.setRecoveryKey(key);
    await recoveryKey.confirmRecoveryKey();

    // Verify the error
    expect(await recoveryKey.invalidRecoveryKeyError()).toContain('Invalid account recovery key');

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
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
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
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'networkidle' });
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
    const link2 = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link2, { waitUntil: 'load' });

    // Verify reset link expired
    expect(await resetPassword.resetPasswordLinkExpriredHeader()).toBe(true);
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
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
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
