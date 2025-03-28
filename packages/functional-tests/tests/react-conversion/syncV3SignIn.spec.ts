/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 signin react', () => {
    test('verified, does not need to confirm', async ({
      syncBrowserPages: { connectAnotherDevice, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.goto(
        undefined,
        new URLSearchParams('context=fx_desktop_v3&service=sync&action=email')
      );
      await expect(signin.syncSignInHeading).toBeVisible();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });
  });

  test('verified, does need to confirm', async ({
    target,
    syncBrowserPages: { page, signin, signinTokenCode },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();

    const syncParams = new URLSearchParams();
    syncParams.append('context', 'fx_desktop_v3');
    syncParams.append('service', 'sync');
    syncParams.append('action', 'email');
    await signin.goto('/', syncParams);

    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);

    await page.waitForURL(/signin_token_code/);

    const code = await target.emailClient.getVerifyLoginCode(credentials.email);

    await signinTokenCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/pair/);
  });
});
