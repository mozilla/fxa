/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, LinkAccountResponse } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 settings', () => {
    test('sign in, change the password', async ({
      target,
      syncBrowserPages: {
        changePassword,
        connectAnotherDevice,
        settings,
        signin,
        signinTokenCode,
        page,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const newPassword = testAccountTracker.generatePassword();
      const customEventDetail: LinkAccountResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.LinkAccount,
          data: {
            ok: true,
          },
        },
      };

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.respondToWebChannelMessage(customEventDetail);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_token_code/);

      await signin.checkWebChannelMessage(FirefoxCommand.LinkAccount);

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await signin.checkWebChannelMessage(FirefoxCommand.Login);

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
        changePassword,
        connectAnotherDevice,
        settings,
        signin,
        signinTokenCode,
        page,
      },
      testAccountTracker,
      storageState,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const newPassword = testAccountTracker.generatePassword();
      const customEventDetail: LinkAccountResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.LinkAccount,
          data: {
            ok: true,
          },
        },
      };

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.respondToWebChannelMessage(customEventDetail);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_token_code/);

      await signin.checkWebChannelMessage(FirefoxCommand.LinkAccount);

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await signin.checkWebChannelMessage(FirefoxCommand.Login);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

      //Goto settings non-sync url
      await settings.goto();

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
  });

  test.describe('Firefox Desktop Sync v3 settings - delete account', () => {
    test('sign in, delete the account', async ({
      target,
      syncBrowserPages: {
        settings,
        deleteAccount,
        page,
        signin,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      test.skip(
        true,
        'TODO in FXA-10081, functional tests for inline recovery key setup'
      );
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_token_code/);

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);
      await expect(page).toHaveURL(/connect_another_device/);

      await settings.goto();
      //Click Delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
