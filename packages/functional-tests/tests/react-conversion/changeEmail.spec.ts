/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // We should either remove the `/settings/changeChange.ts` playwright test or update them
      // once react is fully rolled out. This only contains a subset of the tests to verify the functionality
      // Fixed in https://mozilla-hub.atlassian.net/browse/FXA-9519
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
    });

    test('change primary email and login', async ({
      target,
      pages: { page, signinReact, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newEmail = testAccountTracker.generateEmail();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);
      const previousEmail = credentials.email;
      credentials.email = newEmail;

      await settings.signOut();

      await signinReact.goto();

      await expect(signinReact.emailFirstHeading).toBeVisible();
      // Sign in with old primary email fails
      await signinReact.fillOutEmailFirstForm(previousEmail);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(
        page.getByText('Primary account email required for sign-in')
      ).toBeVisible();

      await signinReact.useDifferentAccountLink.click();

      // Success signing in with New email
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, password and login', async ({
      target,
      pages: { page, changePassword, signinReact, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      await setNewPassword(
        settings,
        changePassword,
        credentials.password,
        newPassword
      );
      const oldPassword = credentials.password;
      credentials.password = newPassword;

      await settings.signOut();

      await signinReact.goto();

      await expect(signinReact.emailFirstHeading).toBeVisible();

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(oldPassword);

      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Success signing in with New email
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, delete account', async ({
      target,
      pages: {
        page,
        signupReact,
        changePassword,
        signinReact,
        settings,
        deleteAccount,
        secondaryEmail,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newEmail = testAccountTracker.generateEmail();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      // Click delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.continueButton.click();

      // Enter the correct password
      await deleteAccount.passwordTextbox.fill(credentials.password);
      await deleteAccount.deleteButton.click();

      // Attempt to create a new account
      await expect(signinReact.emailFirstHeading).toBeVisible();
      await signupReact.fillOutEmailForm(credentials.email);

      await expect(signupReact.signupFormHeading).toBeVisible();
    });
  });
});

async function changePrimaryEmail(
  target: BaseTarget,
  settings: SettingsPage,
  secondaryEmail: SecondaryEmailPage,
  email: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await secondaryEmail.fillOutEmail(email);
  const code: string = await target.emailClient.getVerifySecondCode(email);
  await secondaryEmail.fillOutVerificationCode(code);
  await settings.secondaryEmail.makePrimaryButton.click();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    new RegExp(`${email}.*is now your primary email`)
  );
}

async function setNewPassword(
  settings: SettingsPage,
  changePassword: ChangePasswordPage,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await settings.password.changeButton.click();
  await changePassword.fillOutChangePassword(oldPassword, newPassword);

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText('Password updated');
}
