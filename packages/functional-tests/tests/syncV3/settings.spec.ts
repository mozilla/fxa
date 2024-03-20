/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

const firstPassword = 'password';
const secondPassword = 'new_password';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 settings', () => {
    test.beforeEach(
      async ({
        target,
        syncEmail,
        syncBrowserPages: { login, connectAnotherDevice, page },
      }) => {
        test.slow();
        await target.auth.signUp(syncEmail, firstPassword, {
          lang: 'en',
          preVerified: 'true',
        });
        const customEventDetail = createCustomEventDetail(
          FirefoxCommand.LinkAccount,
          {
            ok: true,
          }
        );
        await page.goto(
          `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
        );
        await login.respondToWebChannelMessage(customEventDetail);
        await login.fillOutEmailFirstSignIn(syncEmail, firstPassword);
        expect(login.signInCodeHeader()).toBeVisible();

        await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
        await login.fillOutSignInCode(syncEmail);
        await login.checkWebChannelMessage(FirefoxCommand.Login);
        await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
      }
    );

    test('sign in, change the password', async ({
      target,
      syncBrowserPages: { changePassword, settings, page },
    }) => {
      //Goto settings sync url
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );

      //Change password
      await settings.password.clickChange();
      await changePassword.fillOutChangePassword(firstPassword, secondPassword);
      await changePassword.submit();

      //Verify success message
      expect(await changePassword.changePasswordSuccess()).toContain(
        'Password updated'
      );
    });

    test('sign in, change the password by browsing directly to settings', async ({
      syncBrowserPages: { login, changePassword, settings },
    }) => {
      //Goto settings non-sync url
      await settings.goto();

      //Change password
      await settings.password.clickChange();
      await login.noSuchWebChannelMessage(FirefoxCommand.ChangePassword);
      await changePassword.fillOutChangePassword(firstPassword, secondPassword);
      await changePassword.submit();

      //Verify success message
      expect(await changePassword.changePasswordSuccess()).toContain(
        'Password updated'
      );
    });
  });

  test.describe('Firefox Desktop Sync v3 settings - delete account', () => {
    test('sign in, delete the account', async ({
      target,
      syncEmail,
      syncBrowserPages: { login, settings, deleteAccount, page },
    }) => {
      test.slow();
      await target.auth.signUp(syncEmail, firstPassword, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.fillOutEmailFirstSignIn(syncEmail, firstPassword);
      await login.fillOutSignInCode(syncEmail);

      //Go to setting page
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );
      //Click Delete account
      await settings.clickDeleteAccount();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.clickContinue();

      //Enter password
      await deleteAccount.setPassword(firstPassword);
      await deleteAccount.submit();

      const success = await page.waitForSelector('.success');
      // "Error: toBeVisible can be only used with Locator object"
      // eslint-disable-next-line playwright/prefer-web-first-assertions
      expect(await success.isVisible()).toBeTruthy();
    });
  });
});
