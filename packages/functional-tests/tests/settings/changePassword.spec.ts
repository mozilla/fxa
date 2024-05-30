/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';

test.describe('severity-1 #smoke', () => {
  test.describe('change password tests', () => {
    test('change password with an incorrect old password', async ({
      target,
      pages: { page, login, settings, changePassword },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, login, testAccountTracker);
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

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
      pages: { page, settings, changePassword, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      // Enter the correct old password and verify that change password is successful
      await settings.password.changeButton.click();
      await changePassword.fillOutChangePassword(
        credentials.password,
        newPassword
      );
      credentials.password = newPassword;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText('Password updated');

      // Sign out and login with new password
      await settings.signOut();
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change password with short password tooltip shows, cancel and try to change password again, tooltip is not shown', async ({
      target,
      pages: { page, login, settings, changePassword },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, login, testAccountTracker);

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
      pages: {
        configPage,
        page,
        login,
        settings,
        changePassword,
        resetPasswordReact,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9612'
      );
      await signInAccount(target, page, login, testAccountTracker);

      await settings.goto();

      await settings.password.changeButton.click();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.forgotPasswordLink.click();

      await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
