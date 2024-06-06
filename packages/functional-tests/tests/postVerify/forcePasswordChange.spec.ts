/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change', () => {
    test('navigate to page directly and can change password', async ({
      target,
      pages: {
        deleteAccount,
        page,
        settings,
        signin,
        signinTokenCode,
        postVerify,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(newPassword);
      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });

    test('force change password on signin - oauth', async ({
      target,
      pages: {
        page,
        deleteAccount,
        settings,
        signin,
        signinTokenCode,
        postVerify,
        relier,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      //Verify force password change header
      expect(await postVerify.isForcePasswordChangeHeader()).toBe(true);

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await expect(settings.settingsHeading).toBeVisible();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(newPassword);
      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
