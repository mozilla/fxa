import { test, expect, newPages } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293402
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293406
  test('change email and login #1293402 #1293406', async ({
    credentials,
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

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293493
  test('delete account #1293493', async ({
    credentials,
    pages: { settings, deleteAccount, page },
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
});

test.describe('severity-2 #smoke', () => {
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

test.describe('severity-3 #smoke', () => {
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
});
