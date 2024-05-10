/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 settings', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('sign in, change the password', async ({
      target,
      syncBrowserPages: {
        login,
        changePassword,
        connectAnotherDevice,
        settings,
        page,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const newPassword = testAccountTracker.generatePassword();
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
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      await expect(login.signInCodeHeader).toBeVisible();

      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      await login.fillOutSignInCode(credentials.email);
      await login.checkWebChannelMessage(FirefoxCommand.Login);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

      //Goto settings sync url
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );

      //Change password
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(
        credentials.password,
        newPassword
      );
      credentials.password = newPassword;

      //Verify success message
      await expect(settings.alertBar).toHaveText('Password updated');
    });

    test('sign in, change the password by browsing directly to settings', async ({
      target,
      syncBrowserPages: {
        login,
        changePassword,
        connectAnotherDevice,
        settings,
        page,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const newPassword = testAccountTracker.generatePassword();
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
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      await expect(login.signInCodeHeader).toBeVisible();

      await login.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      await login.fillOutSignInCode(credentials.email);
      await login.checkWebChannelMessage(FirefoxCommand.Login);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

      //Goto settings non-sync url
      await settings.goto();

      //Change password
      await settings.password.changeButton.click();
      await login.noSuchWebChannelMessage(FirefoxCommand.ChangePassword);
      await changePassword.fillOutChangePassword(
        credentials.password,
        newPassword
      );
      credentials.password = newPassword;

      //Verify success message
      await expect(settings.alertBar).toHaveText('Password updated');
    });
  });

  test.describe('Firefox Desktop Sync v3 settings - delete account', () => {
    test('sign in, delete the account', async ({
      target,
      syncBrowserPages: { login, settings, deleteAccount, page },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );
      await login.fillOutSignInCode(credentials.email);

      //Go to setting page
      await page.goto(
        `${target.contentServerUrl}/settings?context=fx_desktop_v3&service=sync`
      );
      //Click Delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
