/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('react signin to sync and disconnect', async ({
    syncBrowserPages: { connectAnotherDevice, page, signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await signin.goto(
      undefined,
      new URLSearchParams(
        'context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
      )
    );

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    await connectAnotherDevice.clickNotNowPair();
    await expect(page).toHaveURL(/settings/);

    await settings.disconnectSync(credentials);

    // confirm left settings and back at sign in
    await page.waitForURL('**/signin');
  });

  test('react disconnect RP', async ({
    pages: { relier, signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickEmailFirst();

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    expect(await relier.isLoggedIn()).toBe(true);

    // Login to settings with cached creds
    await settings.goto();

    let services = await settings.connectedServices.services();
    expect(services.length).toEqual(3);

    // Sign out of 123Done
    const rp = services.find((service) => service.name.includes('123'));
    expect(rp).toBeDefined();

    await rp?.signout();

    await expect(settings.alertBar).toHaveText(/Logged out/);
    services = await settings.connectedServices.services();
    expect(services.length).toEqual(2);
  });
});
