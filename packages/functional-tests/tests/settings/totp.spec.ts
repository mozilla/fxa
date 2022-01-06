import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293446
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293452
  test('add and remove totp #1293446 #1293452', async ({
    credentials,
    pages: { settings, totp },
  }) => {
    await settings.goto();
    let status = await settings.totp.statusText();
    expect(status).toEqual('Not Set');
    await settings.totp.clickAdd();
    await totp.enable(credentials);
    await settings.waitForAlertBar();
    status = await settings.totp.statusText();
    expect(status).toEqual('Enabled');
    await settings.totp.clickDisable();
    await settings.clickModalConfirm();
    await settings.waitForAlertBar();
    status = await settings.totp.statusText();
    expect(status).toEqual('Not Set');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293445
  test('totp use QR code #1293445', async ({
    credentials,
    pages: { settings, totp },
  }) => {
    await settings.goto();
    let status = await settings.totp.statusText();
    expect(status).toEqual('Not Set');
    await settings.totp.clickAdd();
    await totp.enable(credentials, 'qr');
    await settings.waitForAlertBar();
    status = await settings.totp.statusText();
    expect(status).toEqual('Enabled');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293459
  test('add TOTP and login #1293459', async ({
    credentials,
    pages: { login, settings, totp },
  }) => {
    await settings.goto();
    await settings.totp.clickAdd();
    await totp.enable(credentials);
    await settings.signOut();
    await login.login(credentials.email, credentials.password);
    await login.setTotp(credentials.secret);
    const status = await settings.totp.statusText();
    expect(status).toEqual('Enabled');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293450
  test('can change recovery codes #1293450', async ({
    credentials,
    page,
    pages: { settings, totp, login },
  }) => {
    await settings.goto();
    await settings.totp.clickAdd();
    const { recoveryCodes } = await totp.enable(credentials);
    await settings.totp.clickChange();
    await settings.clickModalConfirm();
    const newCodes = await totp.getRecoveryCodes();
    for (const code of recoveryCodes) {
      expect(newCodes).not.toContain(code);
    }
    await settings.clickRecoveryCodeAck();
    await totp.setRecoveryCode(newCodes[0]);
    await totp.submit();
    await settings.waitForAlertBar();
    await settings.signOut();
    await login.login(credentials.email, credentials.password, newCodes[0]);
    expect(page.url()).toMatch(settings.url);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293460
  test('can get new recovery codes via email #1293460', async ({
    target,
    credentials,
    pages: { page, login, settings, totp },
  }, { project }) => {
    test.slow(project.name !== 'local', 'non-local use more codes');
    await settings.goto();
    await settings.totp.clickAdd();
    const { recoveryCodes } = await totp.enable(credentials);
    await settings.signOut();
    for (let i = 0; i < recoveryCodes.length - 3; i++) {
      await login.login(
        credentials.email,
        credentials.password,
        recoveryCodes[i]
      );
      await settings.signOut();
    }
    await login.login(
      credentials.email,
      credentials.password,
      recoveryCodes[recoveryCodes.length - 1]
    );
    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.lowRecoveryCodes,
      EmailHeader.link
    );
    await page.goto(link, { waitUntil: 'networkidle' });
    const newCodes = await totp.getRecoveryCodes();
    expect(newCodes.length).toEqual(recoveryCodes.length);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293461
  test('delete account with totp enabled #1293461', async ({
    credentials,
    page,
    pages: { settings, totp, login, deleteAccount },
  }) => {
    await settings.goto();
    await settings.totp.clickAdd();
    const { secret } = await totp.enable(credentials);
    await settings.signOut();
    await login.login(credentials.email, credentials.password);
    await login.setTotp(secret);
    await settings.clickDeleteAccount();
    await deleteAccount.checkAllBoxes();
    await deleteAccount.clickContinue();
    await deleteAccount.setPassword(credentials.password);
    await deleteAccount.submit();
    const success = await page.waitForSelector('.success');
    expect(await success.isVisible()).toBeTruthy();
  });
});
