/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('connect_another_device', () => {
    test('react signin Fx Desktop, load /connect_another_device page', async ({
      credentials,
      syncBrowserPages: { configPage, connectAnotherDevice, page, signinReact },
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'Skip tests if React signInRoutes not enabled'
      );
      await signinReact.goto(
        undefined,
        new URLSearchParams('context=fx_desktop_v3&service=sync&action=email')
      );

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/connect_another_device/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
      await expect(
        connectAnotherDevice.connectAnotherDeviceButton
      ).toBeVisible();
      await expect(connectAnotherDevice.signInButton).toBeHidden();
      await expect(connectAnotherDevice.success).toBeHidden();
    });
  });
});
