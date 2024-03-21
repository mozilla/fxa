/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // Slowing down test, was timing out on credentials teardown
  test.slow();

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293471
  test('signin to sync and disconnect #1293471', async ({
    target,
    credentials,
  }) => {
    const { browser, page, login, settings } = await newPagesForSync(target);

    await page.goto(
      target.contentServerUrl +
        '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email',
      { waitUntil: 'load' }
    );
    await page.waitForTimeout(1000);

    await login.login(credentials.email, credentials.password);

    expect(await login.isSyncConnectedHeader()).toBe(true);

    // Normally we wouldn't need this delay, but because we are
    // disconnecting the sync service, we need to ensure that the device
    // record and web channels have been sent and created.
    await page.waitForTimeout(1000);

    await settings.disconnectSync(credentials);

    expect(page.url()).toContain(login.url);

    await browser.close();
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293475
  test('disconnect RP #1293475', async ({
    credentials,
    pages: { relier, login, settings },
  }) => {
    await relier.goto();
    await relier.clickEmailFirst();

    await login.login(credentials.email, credentials.password);
    expect(await relier.isLoggedIn()).toBe(true);

    // Login to settings with cached creds
    await settings.goto();

    let services = await settings.connectedServices.services();
    expect(services.length).toEqual(3);

    // Sign out of 123Done
    const rp = services.find((service) => service.name.includes('123'));
    if (rp) {
      await rp.signout();
    }

    await settings.waitForAlertBar();
    services = await settings.connectedServices.services();
    expect(services.length).toEqual(2);
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293362
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293469
  test.fixme(
    'can login to addons #1293362 #1293469',
    async ({ credentials, pages: { page, login, settings } }, { project }) => {
      test.skip(project.name !== 'production', 'uses prod addons site');

      await page.goto('https://addons.mozilla.org/en-US/firefox/');
      await page.getByRole('link', { name: 'Log in' }).click();
      await page.waitForURL(/accounts\.firefox\.com/);
      await login.login(credentials.email, credentials.password);
      await page.waitForURL(
        /addons\.mozilla\.org\/en-US\/firefox\/users\/edit/
      );

      // Can create AMO profile
      await page
        .getByRole('textbox', { name: /Display Name/ })
        .fill('Example Name');
      await page.getByRole('button', { name: 'Create my profile' }).click();

      // User menu shows selected display name and user can log out of AMO
      await page.waitForURL('https://addons.mozilla.org/en-US/firefox/');
      await page.getByRole('button', { name: 'Example Name' }).hover();
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page.getByText('You have been logged out.')).toBeVisible();

      // Expect Mozilla Accounts to be signed in and AMO to be in Connected Services
      await settings.goto();
      await expect(page.getByRole('link', { name: 'Add-ons' })).toBeVisible();
      await settings.avatarDropDownMenuToggle.click();
      await settings.avatarMenuSignOut.click();
    }
  );

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
    expect(page.url()).toContain('https://getpocket.com/my-list');
    await page.click('[aria-label="Open Account Menu"]');
    await page.click('a:has-text("Log out")');
  });

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293364
  test.fixme(
    'can login to monitor #1293364',
    async ({ credentials, page, pages: { login } }, { project }) => {
      test.skip(project.name !== 'production', 'uses prod monitor');
      await page.goto('https://monitor.mozilla.org/');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL(/accounts\.firefox\.com/);
      await login.login(credentials.email, credentials.password);
      await page.waitForURL(/monitor\.mozilla\.org\/user\/breaches/);
      await page.getByRole('img', { name: 'User menu' }).click();
      await page.getByRole('button', { name: 'Sign out' }).click();
      await page.waitForURL('https://monitor.mozilla.org/');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    }
  );

  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293360
  test('can login to SUMO #1293360', async ({
    credentials,
    page,
    pages: { login },
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod monitor');

    await page.goto('https://support.mozilla.org/');

    // Sumo support contains two Sign In/Up links (in header nav and footer)
    // let's use the first one
    await page
      .getByRole('link', { name: /Sign In\/Up/ })
      .first()
      .click();
    await page.waitForURL(/users\/auth/);
    await page.getByRole('link', { name: 'Continue' }).click();

    // Mozilla accounts sign in
    await page.waitForURL(/accounts\.firefox\.com/);
    await login.login(credentials.email, credentials.password);

    // return to SUMO
    await page.waitForURL(/support\.mozilla\.org/);
    await page.getByRole('img', { name: 'Avatar for Username' }).hover();
    await page.getByRole('link', { name: 'Sign Out' }).click();
    await expect(
      page.getByRole('link', { name: /Sign In\/Up/ }).first()
    ).toBeVisible();
  });
});
