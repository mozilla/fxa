/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  FORCE_PWD_EMAIL_PREFIX,
  PASSWORD,
  NEW_PASSWORD,
} from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change', () => {
    test.use({
      emailOptions: [
        { prefix: FORCE_PWD_EMAIL_PREFIX, password: NEW_PASSWORD },
      ],
    });
    test.beforeEach(async ({ emails, target, pages: { login } }) => {
      test.slow();
    });

    test('navigate to page directly and can change password', async ({
      target,
      emails,
      pages: { page, login, postVerify },
    }) => {
      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, PASSWORD);
      await login.fillOutSignInCode(email);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(PASSWORD, NEW_PASSWORD);
      await postVerify.submit();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('force change password on login - oauth', async ({
      target,
      emails,
      pages: { login, postVerify, relier },
    }) => {
      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutEmailFirstSignIn(email, PASSWORD);
      await login.fillOutSignInCode(email);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(PASSWORD, NEW_PASSWORD);
      await postVerify.submit();

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
