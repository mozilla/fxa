/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('connect_another_device', () => {
    test('react signin Fx Desktop, load /pair page', async ({
      syncBrowserPages: { configPage, connectAnotherDevice, page, signin },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'Skip tests if React signInRoutes not enabled'
      );

      const credentials = await testAccountTracker.signUp();

      await signin.goto(
        undefined,
        new URLSearchParams('context=fx_desktop_v3&service=sync&action=email')
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
