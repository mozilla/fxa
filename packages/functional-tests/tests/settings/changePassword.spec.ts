/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('change password tests', () => {
    test('change password with an incorrect old password', async ({
      target,
      pages: { page, changePassword, settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);
      const newPassword = testAccountTracker.generatePassword();

      // Enter incorrect old password and verify the tooltip error
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(
        'Incorrect Password',
        newPassword
      );

      await expect(changePassword.tooltip).toHaveText('Incorrect password');
    });

    test('change password with a correct password', async ({
      target,
      pages: { page, changePassword, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const initialPassword = credentials.password;
      const newPassword = testAccountTracker.generatePassword();

      // Enter the correct old password and verify that change password is successful
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(initialPassword, newPassword);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText('Password updated');

      // Sign out and login with new password
      await settings.signOut();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(newPassword);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);

      // Update credentials for account cleanup
      credentials.password = newPassword;
    });

    test('change password with short password tooltip shows, cancel and try to change password again, tooltip is not shown', async ({
      target,
      pages: { page, changePassword, settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);

      await settings.goto();
      await settings.password.changeButton.click();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.newPasswordTextbox.fill('short');

      await expect(changePassword.passwordLengthInvalidIcon).toBeVisible();

      await changePassword.cancelButton.click();

      await expect(settings.settingsHeading).toBeVisible();

      await settings.password.changeButton.click();

      await expect(changePassword.passwordLengthUnsetIcon).toBeVisible();
    });

    test('reset password via settings works', async ({
      target,
      pages: { page, changePassword, resetPassword, settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);

      await settings.goto();

      await settings.password.changeButton.click();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.forgotPasswordLink.click();

      await expect(resetPassword.resetPasswordHeading).toBeVisible();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
