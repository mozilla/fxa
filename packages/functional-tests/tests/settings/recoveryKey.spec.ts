import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293421
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293429
  test('add and remove recovery key #1293421 #1293429', async ({
    credentials,
    pages: { settings, recoveryKey },
  }) => {
    await settings.goto();
    let status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
    await recoveryKey.clickClose();
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Enabled');
    await settings.recoveryKey.clickRemove();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    status = await settings.recoveryKey.statusText();
    expect(status).toEqual('Not Set');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293432
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293433
  test('use recovery key #1293432 #1293433', async ({
    credentials,
    target,
    pages: { page, login, recoveryKey, settings },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
    const key = await recoveryKey.getKey();
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
