/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // Slowing down test, was timing out on credentials teardown
  test.slow();

  test('signin to sync and disconnect', async ({
    target,
    syncBrowserPages: { page, login, settings },
    testAccountTracker,
  }) => {
    test.fixme(true, 'Fix required as of 2024/04/19 (see FXA-9490)');

    const credentials = await testAccountTracker.signUp();

    await page.goto(
      target.contentServerUrl +
        '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
    );
    await login.login(credentials.email, credentials.password);

    expect(await login.isSyncConnectedHeader()).toBe(true);

    // Normally we wouldn't need this delay, but because we will be
    // disconnecting the sync service, we need to ensure that the device
    // record and web channels have been sent and created (FXA-9490).
    await page.waitForTimeout(1000);
    await settings.disconnectSync(credentials);
    // See above, we need to wait for disconnect to complete (FXA-9490).
    await page.waitForTimeout(1000);

    // confirm left settings and back at sign in
    expect(page.url()).toBe(login.url);
  });

  test('disconnect RP', async ({
    pages: { relier, login, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

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
    await rp?.signout();

    await expect(settings.alertBar).toBeVisible();

    services = await settings.connectedServices.services();

    expect(services.length).toEqual(2);
  });

  test('can login to addons', async ({
    pages: { page, login, settings },
    testAccountTracker,
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod addons site');

    const credentials = await testAccountTracker.signUp();
    await page.goto('https://addons.mozilla.org/en-US/firefox/');
    await page.getByRole('link', { name: 'Log in' }).click();
    await page.waitForURL(/accounts\.firefox\.com/);
    await login.login(credentials.email, credentials.password);
    await page.waitForURL(/addons\.mozilla\.org\/en-US\/firefox\/users\/edit/);

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
  });

  test('can login to monitor', async ({
    page,
    pages: { login },
    testAccountTracker,
  }, { project }) => {
    // This test has a history of breaking (see FXA-9140).
    test.skip(project.name !== 'production', 'uses prod monitor');

    const credentials = await testAccountTracker.signUp();

    await page.goto('https://monitor.mozilla.org/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/accounts\.firefox\.com/);
    await login.login(credentials.email, credentials.password);

    await expect(page).toHaveURL('https://monitor.mozilla.org/user/dashboard');

    await page.getByRole('button', { name: 'Open user menu' }).first().click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page).toHaveURL('https://monitor.mozilla.org/');
  });

  test('can login to SUMO', async ({
    page,
    pages: { login },
    testAccountTracker,
  }, { project }) => {
    test.skip(project.name !== 'production', 'uses prod monitor');

    const credentials = await testAccountTracker.signUp();

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
