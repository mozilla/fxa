import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293385
  test('change password #1293385', async ({
    pages: { settings, changePassword, login },
    credentials,
  }) => {
    const newPassword = credentials.password + '2';
    await settings.goto();
    await settings.password.clickChange();
    await changePassword.setCurrentPassword(credentials.password);
    await changePassword.setNewPassword(newPassword);
    await changePassword.setConfirmPassword(newPassword);
    await changePassword.submit();
    await settings.signOut();
    credentials.password = newPassword;
    await login.login(credentials.email, credentials.password);
    const primaryEmail = await settings.primaryEmail.statusText();
    expect(primaryEmail).toEqual(credentials.email);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293389
  test('forgot password #1293389', async ({
    target,
    credentials,
    page,
    pages: { settings, login },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
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
    await login.setNewPassword(credentials.password);
    expect(page.url()).toMatch(settings.url);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293431
  test('forgot password has recovery key but skip using it #1293431', async ({
    target,
    credentials,
    page,
    pages: { settings, login, recoveryKey },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
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
    await login.clickDontHaveRecoveryKey();
    await login.setNewPassword(credentials.password);
    await settings.waitForAlertBar();
    const status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });
});
