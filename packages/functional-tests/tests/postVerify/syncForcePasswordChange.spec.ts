/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
let email;
const password = 'password';
const newPassword = 'new_password';
let syncBrowserPages;

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change sync', () => {
    test.beforeEach(async ({ target }) => {
      syncBrowserPages = await newPagesForSync(target);
      const { login } = syncBrowserPages;
      email = login.createEmail('forcepwdchange{id}');
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
    });

    test.afterEach(async ({ target }) => {
      await syncBrowserPages.browser?.close();
      if (email) {
        // Cleanup any accounts created during the test
        try {
          await target.auth.accountDestroy(email, newPassword);
        } catch (e) {
          // Handle the error here
          console.error('An error occurred during account cleanup:', e);
          // Optionally, rethrow the error to propagate it further
          throw e;
        }
      }
    });

    test('force change password on login - sync', async ({ target }) => {
      const { page, login, postVerify, connectAnotherDevice } =
        syncBrowserPages;
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        {
          waitUntil: 'load',
        }
      );
      await login.fillOutEmailFirstSignIn(email, password);
      await login.fillOutSignInCode(email);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(password, newPassword);
      await postVerify.submit();

      //Verify logged in on connect another device page
      expect(await connectAnotherDevice.fxaConnected.isEnabled()).toBeTruthy();
    });
  });
});
