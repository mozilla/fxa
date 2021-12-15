import { test, expect, newPages } from '../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../lib/email';

test.describe('severity-1', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293471
  test('signin to sync and disconnect #1293471', async ({
    target,
    page,
    credentials,
    pages: { login, settings },
  }) => {
    await page.goto(
      target.contentServerUrl +
        '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
    );
    await login.login(credentials.email, credentials.password);
    await settings.goto();
    let services = await settings.connectedServices.services();
    const sync = services.find((s) => s.name !== 'playwright');
    await sync.signout();
    await page.click('text=Rather not say >> input[name="reason"]');
    await settings.clickModalConfirm();
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    expect(page.locator('input[type=email]')).toBeVisible();
  });

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

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293402
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293406
  test('change email and login #1293402 #1293406', async ({
    credentials,
    target,
    pages: { login, settings, secondaryEmail },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.secondaryEmail.clickAdd();
    const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
    await secondaryEmail.addAndVerify(newEmail);
    await settings.waitForAlertBar();
    await settings.secondaryEmail.clickMakePrimary();
    credentials.email = newEmail;
    await settings.signOut();
    await login.login(credentials.email, credentials.password);
    const primary = await settings.primaryEmail.statusText();
    expect(primary).toEqual(newEmail);
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

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293493
  test('delete account #1293493', async ({
    credentials,
    pages: { login, settings, deleteAccount, page },
  }) => {
    await settings.goto();
    await settings.clickDeleteAccount();
    await deleteAccount.checkAllBoxes();
    await deleteAccount.clickContinue();
    await deleteAccount.setPassword(credentials.password);
    await deleteAccount.submit();
    const success = await page.waitForSelector('.success');
    expect(await success.isVisible()).toBeTruthy();
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

test.describe('severity-2', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293371
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293373
  test('set/unset the display name #1293371 #1293373', async ({
    pages: { settings, displayName },
  }) => {
    await settings.goto();
    expect(await settings.displayName.statusText()).toEqual('None');
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('me');
    await displayName.submit();
    expect(await settings.displayName.statusText()).toEqual('me');
    await settings.displayName.clickAdd();
    await displayName.setDisplayName('');
    await displayName.submit();
    expect(await settings.displayName.statusText()).toEqual('None');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293475
  test('disconnect RP #1293475', async ({
    browser,
    credentials,
    pages,
    target,
  }, { project }) => {
    test.skip(project.name === 'production', 'no 123done in production');
    const [a, b] = [pages, await newPages(browser, target)];
    await b.relier.goto();
    await b.relier.clickEmailFirst();
    await b.login.login(credentials.email, credentials.password);

    await a.settings.goto();

    let services = await a.settings.connectedServices.services();
    expect(services.length).toEqual(3);
    const relier = services[2];
    await relier.signout();
    await a.settings.waitForAlertBar();
    services = await a.settings.connectedServices.services();
    expect(services.length).toEqual(2);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293504
  test('settings help link #1293504', async ({ pages: { settings } }) => {
    await settings.goto();
    const helpPage = await settings.clickHelp();
    expect(helpPage.url()).toMatch('https://support.mozilla.org');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293498
  test('settings avatar drop-down #1293498', async ({
    target,
    credentials,
    page,
    pages: { settings },
  }) => {
    await settings.goto();
    await settings.clickAvatarIcon();
    await expect(settings.avatarMenu).toBeVisible();
    await expect(settings.avatarMenu).toContainText(credentials.email);
    await page.keyboard.press('Escape');
    await expect(settings.avatarMenu).toBeHidden();
    await settings.signOut();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293407
  test('removing secondary emails #1293407', async ({
    credentials,
    pages: { settings, secondaryEmail },
  }, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
    await settings.goto();
    await settings.secondaryEmail.clickAdd();
    const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
    await secondaryEmail.addAndVerify(newEmail);
    await settings.waitForAlertBar();
    await settings.closeAlertBar();
    await settings.secondaryEmail.clickDelete();
    await settings.waitForAlertBar();
    expect(await settings.alertBarText()).toMatch('successfully deleted');
    await settings.secondaryEmail.clickAdd();
    await secondaryEmail.setEmail(newEmail);
    await secondaryEmail.submit();
    // skip verification
    await settings.goto();
    expect(await settings.secondaryEmail.statusText()).toMatch('UNVERIFIED');
    await settings.secondaryEmail.clickDelete();
    await settings.waitForAlertBar();
    expect(await settings.alertBarText()).toMatch('successfully deleted');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293513
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293517
  test('upload avatar #1293513 #1293517', async ({
    pages: { settings, avatar },
  }) => {
    await settings.goto();
    await settings.avatar.clickAdd();
    const filechooser = await avatar.clickAddPhoto();
    await filechooser.setFiles('./pages/settings/avatar.png');
    await avatar.clickSave();
    expect(await settings.avatar.isDefault()).toBeFalsy();
    await settings.avatar.clickChange();
    await avatar.clickRemove();
    expect(await settings.avatar.isDefault()).toBeTruthy();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293480
  test('edit email communication preferences #1293480', async ({
    credentials,
    pages: { settings, login },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod email prefs');

    await settings.goto();
    const emailPage = await settings.clickEmailPreferences();
    login.page = emailPage;
    await login.setPassword(credentials.password);
    await login.submit();
    expect(emailPage.url()).toMatch('https://www.mozilla.org/en-US/newsletter');
    // TODO change prefs and save
  });
});

test.describe('severity-3', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293501
  test('settings bento menu #1293501', async ({
    page,
    pages: { settings },
  }) => {
    await settings.goto();
    await settings.clickBentoIcon();
    await expect(settings.bentoMenu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(settings.bentoMenu).toBeHidden();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293423
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293440
  test('settings data-trio component works #1293423 #1293440', async ({
    credentials,
    pages: { settings, recoveryKey },
  }) => {
    await settings.goto();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.submit();
    const dl = await recoveryKey.dataTrio.clickDownload();
    expect(dl.suggestedFilename()).toBe(`${credentials.email} Firefox.txt`);
    const clipboard = await recoveryKey.dataTrio.clickCopy();
    expect(clipboard).toEqual(await recoveryKey.getKey());
    const printed = await recoveryKey.dataTrio.clickPrint();
    expect(printed).toBe(true);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293362
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293469
  test('can login to addons #1293362 #1293469', async ({
    credentials,
    page,
    pages: { login, settings },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod addons site');
    await page.goto('https://addons.mozilla.org/en-US/firefox/');
    await Promise.all([page.click('text=Log in'), page.waitForNavigation()]);
    await login.login(credentials.email, credentials.password);
    expect(page.url()).toMatch(
      'https://addons.mozilla.org/en-US/firefox/users/edit'
    );
    await page.click('text=Delete My Profile');
    await page.click('button.Button--alert[type=submit]');
    await page.waitForURL('https://addons.mozilla.org/en-US/firefox');
    await settings.goto();
    const services = await settings.connectedServices.services();
    const names = services.map((s) => s.name);
    expect(names).toContainEqual('Add-ons');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293352
  test('can login to pocket #1293352', async ({
    credentials,
    page,
    pages: { login },
  }, { project }) => {
    test.fixme(true, 'pocket logout hangs after link clicked');
    test.skip(project.name !== 'production', 'uses prod pocket');
    await page.goto('https://getpocket.com/login');
    await Promise.all([
      page.click('a:has-text("Continue with Firefox")'),
      page.waitForNavigation(),
    ]);
    await login.login(credentials.email, credentials.password);
    expect(page.url()).toMatch('https://getpocket.com/my-list');
    await page.click('[aria-label="Open Account Menu"]');
    await page.click('a:has-text("Log out")');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293364
  test('can login to monitor #1293364', async ({
    credentials,
    page,
    pages: { login },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod monitor');
    await page.goto('https://monitor.firefox.com');
    await Promise.all([
      page.click('text=Sign Up for Alerts'),
      page.waitForNavigation(),
    ]);
    await login.login(credentials.email, credentials.password);
    expect(page.url()).toMatch('https://monitor.firefox.com/user/dashboard');
    await page.click('[aria-label="Open Firefox Account navigation"]');
    await Promise.all([
      page.click('text=Sign Out'),
      page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);
    await expect(page.locator('#sign-in-btn')).toBeVisible();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293360
  test('can login to SUMO #1293360', async ({
    credentials,
    page,
    pages: { login },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod monitor');
    test.slow();

    await page.goto('https://support.mozilla.org/en-US/');

    await Promise.all([
      page.click('text=Sign In/Up'),
      page.waitForNavigation(),
    ]);
    await Promise.all([
      page.click('text=Continue with Firefox Accounts'),
      page.waitForNavigation(),
    ]);
    await login.login(credentials.email, credentials.password);

    await page.hover('a[href="/en-US/users/auth"]');
    await page.click('text=Sign Out');
    await expect(page.locator('text=Sign In/Up').first()).toBeVisible();
  });
});
