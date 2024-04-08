/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('change primary email and login', async ({
      credentials,
      page,
      pages: { login, settings, secondaryEmail },
    }) => {
      await settings.goto();

      const oldEmail = credentials.email;
      const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
      await changePrimaryEmail(settings, secondaryEmail, newEmail);
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
      credentials,
      page,
      pages: { settings, changePassword, login, secondaryEmail },
    }) => {
      await settings.goto();

      const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      const oldPassword = credentials.password;
      const newPassword = credentials.password + '@@2';
      await setNewPassword(settings, changePassword, oldPassword, newPassword);
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
      credentials,
      pages: { settings, changePassword, login, secondaryEmail },
    }) => {
      await settings.goto();

      const oldEmail = credentials.email;
      const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      const oldPassword = credentials.password;
      const newPassword = credentials.password + '@@4';
      await setNewPassword(settings, changePassword, oldPassword, newPassword);
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
      credentials,
      pages: { configPage, deleteAccount, login, settings, secondaryEmail },
    }) => {
      const config = await configPage.getConfig();
      // NOTE: This passes for React when `fullProdRollout` for React Signup is set
      // to `true`, but when we're only at 15% and the flag is "on", flows would need to
      // be accessed with the force experiment params. Since we'll be porting these over
      // for React, for now, skip these tests if the flag is on.
      test.skip(config.showReactApp.signUpRoutes === true);

      await settings.goto();

      const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
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
      credentials,
      pages: { settings, secondaryEmail },
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      const newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
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

  test.describe('change primary - unblock', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, secondaryEmail } }) => {
        test.slow();
        await settings.goto();

        const newEmail = `blocked${Math.floor(
          Math.random() * 100000
        )}@restmail.net`;
        await changePrimaryEmail(settings, secondaryEmail, newEmail);
        credentials.email = newEmail;
        await settings.signOut();
      }
    );

    test('change primary email, get blocked with invalid password, redirect enter password page', async ({
      credentials,
      page,
      pages: { login },
    }) => {
      const invalidPassword = credentials.password + '@@2';
      await login.login(credentials.email, invalidPassword);

      // Fill out unblock
      await login.unblock(credentials.email);

      // Verify the incorrect password error
      await expect(page.getByText('Incorrect password')).toBeVisible();
    });

    test('can change primary email, get blocked with valid password, redirect settings page', async ({
      credentials,
      page,
      pages: { settings, login },
    }) => {
      await login.login(credentials.email, credentials.password);

      // Fill out unblock
      await login.unblock(credentials.email);

      // Verify settings url redirected
      await expect(page).toHaveURL(settings.url);
    });
  });
});

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
