/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth and Fx Desktop handshake', () => {
    test('user signed into browser and OAuth login', async ({
      target,
      syncBrowserPages: {
        page,
        connectAnotherDevice,
        relier,
        settings,
        signin,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        target.contentServerUrl +
          '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/connect_another_device/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
      await relier.signOut();

      // Attempt to sign back in
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);

      // Disconnect sync otherwise we can have flaky tests.
      await settings.disconnectSync(credentials);

      await expect(signin.emailFirstHeading).toBeVisible();
    });
  });
});
