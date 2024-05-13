/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change sync', () => {
    test('force change password on login - sync', async ({
      target,
      syncBrowserPages: { page, login, postVerify, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );
      await login.fillOutSignInCode(credentials.email);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();
      credentials.password = newPassword;

      //Verify logged in on connect another device page
      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });
  });
});
