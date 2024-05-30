/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests', () => {
    test('change primary email and login', async ({
      target,
      pages: { page, login, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      const oldEmail = credentials.email;
      credentials.email = newEmail;

      await settings.signOut();

      // Sign in with old primary email fails
      await login.setEmail(oldEmail);
      await page.locator('button[type=submit]').click();
      await login.setPassword(credentials.password);
      await page.locator('button[type=submit]').click();

      await expect(
        page.getByText('Primary account email required for sign-in')
      ).toBeVisible();

      // Success signing in with New email
      await login.useDifferentAccountLink();
      await login.login(credentials.email, credentials.password);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, password and login', async ({
      target,
      pages: { page, settings, changePassword, login, secondaryEmail },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
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

      // Sign in with old password
      await login.setEmail(credentials.email);
      await page.locator('button[type=submit]').click();
      await login.setPassword(oldPassword);
      await page.locator('button[type=submit]').click();

      await expect(login.tooltip).toHaveText('Incorrect password');

      // Sign in with new password
      await login.setPassword(credentials.password);
      await login.submit();

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, change password, login, change email and login', async ({
      target,
      pages: { page, settings, changePassword, login, secondaryEmail },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      const oldEmail = credentials.email;
      credentials.email = newEmail;

      await setNewPassword(
        settings,
        changePassword,
        credentials.password,
        newPassword
      );
      credentials.password = newPassword;

      await settings.signOut();

      // Sign in with new password
      await login.login(credentials.email, credentials.password);

      // Change back the primary email again
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = oldEmail;
      await settings.signOut();

      // Login with primary email and new password
      await login.login(credentials.email, credentials.password);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('can change primary email, delete account', async ({
      target,
      pages: {
        page,
        configPage,
        deleteAccount,
        login,
        settings,
        secondaryEmail,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      // NOTE: This passes for React when `fullProdRollout` for React Signup is set
      // to `true`, but when we're only at 15% and the flag is "on", flows would need to
      // be accessed with the force experiment params. Since we'll be porting these over
      // for React, for now, skip these tests if the flag is on.
      test.skip(config.showReactApp.signUpRoutes === true);

      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      // Click delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.continueButton.click();

      // Enter the correct password
      await deleteAccount.passwordTextbox.fill(credentials.password);
      await deleteAccount.deleteButton.click();

      // Try creating a new account with the same secondary email as previous account and new password
      await login.fillOutFirstSignUp(credentials.email, credentials.password);

      await expect(settings.alertBar).toHaveText(
        'Account confirmed successfully'
      );
      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('removing secondary emails', async ({
      target,
      pages: { page, login, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, login, testAccountTracker);
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.addSecondaryEmail(newEmail);

      await expect(settings.alertBar).toHaveText(/successfully added/);

      await settings.alertBarDismissButton.click();
      await settings.secondaryEmail.deleteButton.click();

      await expect(settings.alertBar).toHaveText(/successfully deleted/);

      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.emailTextbox.fill(newEmail);
      await secondaryEmail.submit();

      // skip verification
      await settings.goto();

      await expect(settings.secondaryEmail.unverifiedText).toHaveText(
        'unconfirmed'
      );

      await settings.secondaryEmail.deleteButton.click();

      await expect(settings.alertBar).toHaveText(/successfully deleted/);
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

async function changePrimaryEmail(
  settings: SettingsPage,
  secondaryEmail: SecondaryEmailPage,
  email: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await secondaryEmail.addSecondaryEmail(email);
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
