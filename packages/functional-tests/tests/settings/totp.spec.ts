import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('two step auth', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293446
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293452
  test('add and remove totp', async ({
    credentials,
    pages: { settings, totp, login },
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

    // Login to verify no prompt for code
    await settings.signOut();
    await login.login(credentials.email, credentials.password);
    expect(await login.loginHeader()).toBe(true);
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
  test('add TOTP and login', async ({
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

  test('add TOTP and confirm sync signin', async ({ credentials, target }) => {
    const { login, settings, totp, page, connectAnotherDevice } =
      await newPagesForSync(target);
    await settings.goto();
    await settings.totp.clickAdd();
    await totp.enable(credentials);
    await settings.signOut();

    // Sync sign in
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
      { waitUntil: 'networkidle' }
    );
    await login.login(credentials.email, credentials.password);
    await login.setTotp(credentials.secret);
    expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293450
  test('can change backup authentication codes #1293450', async ({
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
    await login.login(credentials.email, credentials.password);

    // Make sure an invalid code doesn't work
    await login.clickUseRecoveryCode();
    await login.setCode('invalid!!!!');
    await login.submitButton.click();
    await expect(login.tooltip).toContainText('Invalid');

    // Apply the correct code
    await login.setCode(newCodes[0]);
    await login.submit();

    expect(page.url()).toMatch(settings.url);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293460
  test('can get new backup authentication codes via email #1293460', async ({
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
    await page.goto(link, { waitUntil: 'load' });
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
