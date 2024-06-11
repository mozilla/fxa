/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change', () => {
    test('navigate to page directly and can change password', async ({
      target,
      pages: { page, login, postVerify },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(target.contentServerUrl);
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await login.fillOutSignInCode(code);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();
      credentials.password = newPassword;

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('force change password on login - oauth', async ({
      target,
      pages: { login, postVerify, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await login.fillOutSignInCode(code);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();
      credentials.password = newPassword;

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
