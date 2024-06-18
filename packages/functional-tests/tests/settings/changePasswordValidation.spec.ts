/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('change password validation tests', () => {
    const testCases = [
      {
        name: 'short password',
        error: 'At least 8 characters',
        password: '2short',
        confirmPassword: '2short',
      },
      {
        name: 'common password',
        error: 'Not a commonly used password',
        password: 'passwords',
        confirmPassword: 'passwords',
      },
      {
        name: 'mismatch confirm password',
        error: 'New password matches confirmation',
        password: 'newPasswordTest',
        confirmPassword: 'newPasswordTest2',
      },
    ];
    for (const { name, error, password, confirmPassword } of testCases) {
      test(`new password validation - ${name}`, async ({
        target,
        pages: { page, changePassword, settings, signin },
        testAccountTracker,
      }) => {
        await signInAccount(target, page, settings, signin, testAccountTracker);

        await settings.goto();
        await settings.password.changeButton.click();

        await expect(changePassword.changePasswordHeading).toBeVisible();

        await changePassword.newPasswordTextbox.fill(password);
        await changePassword.confirmPasswordTextbox.fill(confirmPassword);

        await expect(changePassword.passwordError).toHaveText(error);
      });
    }

    test(`new password validation - email as password`, async ({
      target,
      pages: { page, changePassword, settings, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();
      await settings.password.changeButton.click();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.newPasswordTextbox.fill(email);

      await expect(changePassword.passwordError).toHaveText(
        'Not your email address'
      );
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
