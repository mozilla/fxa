/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('post verify - account recovery', () => {
    test.beforeEach(async ({ target, pages: { login } }) => {
      // Generating and consuming recovery keys is a slow process
      test.slow();
      await login.clearCache();
    });

    test('create account recovery', async ({
      target,
      credentials,
      pages: { page, login, postVerify },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}/post_verify/account_recovery/add_recovery_key`,
        { waitUntil: 'load' }
      );

      //Verify account recovery header
      expect(await postVerify.isAccountRecoveryHeader()).toBe(true);

      //Add recovery key
      await postVerify.addRecoveryKey(credentials.password);
      await postVerify.submit();

      // Store key to be used later
      const key = await postVerify.getKey();
      await postVerify.clickDone();

      //Enter invalid key
      await postVerify.inputRecoveryKey('invalid key');

      //Verify error message
      expect(await postVerify.getTooltipError()).toContain(
        'Invalid account recovery key'
      );

      //Enter correct key
      await postVerify.inputRecoveryKey(key);

      //Verify post verify account recovery key complete header
      expect(await postVerify.isAccountRecoveryVerifiedHeader()).toBe(true);
    });

    test('abort account recovery at add_recovery_key', async ({
      target,
      credentials,
      pages: { page, login, postVerify },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}/post_verify/account_recovery/add_recovery_key`,
        { waitUntil: 'load' }
      );

      //Verify account recovery header
      expect(await postVerify.isAccountRecoveryHeader()).toBe(true);

      //Add recovery key
      await postVerify.clickMaybeLater();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('abort account recovery at confirm_recovery_key', async ({
      target,
      credentials,
      pages: { page, login, postVerify },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await page.goto(
        `${target.contentServerUrl}/post_verify/account_recovery/add_recovery_key`,
        { waitUntil: 'load' }
      );

      //Verify account recovery header
      expect(await postVerify.isAccountRecoveryHeader()).toBe(true);

      //Add recovery key
      await postVerify.addRecoveryKey(credentials.password);
      await postVerify.clickMaybeLater();

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });
});
