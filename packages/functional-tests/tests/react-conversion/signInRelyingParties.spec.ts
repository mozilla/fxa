/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // Slowing down test, was timing out on credentials teardown
  test.slow();

  test('react signin to sync and disconnect', async ({
    syncBrowserPages: {
      configPage,
      connectAnotherDevice,
      page,
      signinReact,
      settings,
    },
    testAccountTracker,
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signInRoutes !== true,
      'Skip tests if React signInRoutes not enabled'
    );

    const credentials = await testAccountTracker.signUp();

    await signinReact.goto(
      undefined,
      new URLSearchParams(
        'context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
      )
    );

    await signinReact.fillOutEmailFirstForm(credentials.email);
    await signinReact.fillOutPasswordForm(credentials.password);

    await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    await connectAnotherDevice.notNowButton.click();
    await expect(page).toHaveURL(/settings/, { timeout: 1000 });

    await settings.disconnectSync(credentials);

    // confirm left settings and back at sign in
    await page.waitForURL('**/signin', { timeout: 1000 });
  });

  test('react disconnect RP #1293475', async ({
    pages: { configPage, page, relier, signinReact, settings },
    testAccountTracker,
  }, { project }) => {
    const config = await configPage.getConfig();
    test.fixme(
      project.name !== 'local',
      'Fix required as of 2024/04/26 (see FXA-9518).'
    );
    test.skip(
      config.showReactApp.signInRoutes !== true,
      'Skip tests if React signInRoutes not enabled'
    );

    const credentials = await testAccountTracker.signUp();

    await relier.goto();
    await relier.clickEmailFirst();

    // wait for navigation
    await expect(page).toHaveURL(/oauth\//);

    // reload page with React experiment params
    await page.goto(
      `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );

    await signinReact.fillOutEmailFirstForm(credentials.email);
    await signinReact.fillOutPasswordForm(credentials.password);
    expect(await relier.isLoggedIn()).toBe(true);

    // Login to settings with cached creds
    await settings.goto();

    let services = await settings.connectedServices.services();
    expect(services.length).toEqual(3);

    // Sign out of 123Done
    const rp = services.find((service) => service.name.includes('123'));
    await expect(rp).toBeDefined();
    await rp?.signout();

    await expect(settings.alertBar).toHaveText(/Logged out/);
    services = await settings.connectedServices.services();
    expect(services.length).toEqual(2);
  });
});
