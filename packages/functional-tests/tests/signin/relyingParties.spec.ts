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
    pages: { relier, settings, signinReact },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickEmailFirst();
    await signinReact.fillOutEmailFirstForm(credentials.email);
    await signinReact.fillOutPasswordForm(credentials.password);

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
});
