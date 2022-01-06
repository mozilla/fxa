import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
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
    const services = await settings.connectedServices.services();
    const sync = services.find((s) => s.name !== 'playwright');
    await sync.signout();
    await page.click('text=Rather not say >> input[name="reason"]');
    // FIXME
    // Playwright isn't behaving like a vanilla browser when
    // sync is disconnected. It's logging out of the web context
    // but not the browser like it should. This could be due
    // to a missing pref to handle the broadcast logout message???
    // In the meantime we have this hack copied from
    // settings/src/lib/firefox.ts to blast a direct command
    await page.evaluate((uid) => {
      window.dispatchEvent(
        new CustomEvent('WebChannelMessageToChrome', {
          detail: JSON.stringify({
            id: 'account_updates',
            message: {
              command: 'fxaccounts:logout',
              data: { uid },
            },
          }),
        })
      );
    }, credentials.uid);

    // The clickModalConfirm needs to follow the above event. If
    // it does not, a race condition can occur.
    await settings.clickModalConfirm();
    await login.setEmail(credentials.email);
    expect(page.url()).toMatch(login.url);
  });
});

test.describe('severity-3 #smoke', () => {
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
