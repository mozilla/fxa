/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 signin react', () => {
    test('verified, does not need to confirm', async ({
      credentials,
      syncBrowserPages: { configPage, connectAnotherDevice, signinReact },
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      await signinReact.goto(
        undefined,
        new URLSearchParams('context=fx_desktop_v3&service=sync&action=email')
      );
      await expect(await signinReact.syncSignInHeading).toBeVisible();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });
  });
});
