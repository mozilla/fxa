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
        changePassword,
        connectAnotherDevice,
        page,
        settings,
        signinReact,
        signinTokenCode,
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
      await signinReact.respondToWebChannelMessage(customEventDetail);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);

      await signinReact.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      await expect(signinTokenCode.heading).toBeVisible();
      const signinCode = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(signinCode);
      await signinReact.checkWebChannelMessage(FirefoxCommand.Login);
      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

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
        signinReact,
        changePassword,
        connectAnotherDevice,
        settings,
        signinTokenCode,
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
      await signinReact.respondToWebChannelMessage(customEventDetail);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);

      await expect(signinTokenCode.heading).toBeVisible();

      await signinReact.checkWebChannelMessage(FirefoxCommand.LinkAccount);
      const signinCode = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(signinCode);
      await signinReact.checkWebChannelMessage(FirefoxCommand.Login);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

      //Goto settings non-sync url
      await settings.goto();

      //Change password
      await settings.password.changeButton.click();
      await signinReact.noSuchWebChannelMessage(FirefoxCommand.ChangePassword);
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
        signinReact,
        settings,
        deleteAccount,
        page,
        signinTokenCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await expect(signinReact.syncSignInHeading).toBeVisible();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);

      await expect(signinTokenCode.heading).toBeVisible();
      const signinCode = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(signinCode);
      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

      //Go to setting page
      await page.goto(`${target.contentServerUrl}/settings`);
      //Click Delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
