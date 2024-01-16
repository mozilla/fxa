/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
let newEmail;

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, secondaryEmail } }) => {
        test.slow();
        await settings.goto();
        await settings.secondaryEmail.clickAdd();
        newEmail = credentials.email.replace(/(\w+)/, '$1_alt');
        await secondaryEmail.addAndVerify(newEmail);
        await settings.waitForAlertBar();
        await settings.secondaryEmail.clickMakePrimary();
      }
    );

    test('change primary email and login', async ({
      credentials,
      page,
      pages: { login, settings },
    }) => {
      await settings.signOut();

      // Sign in with old primary email fails
      await login.setEmail(credentials.email);
      await page.locator('button[type=submit]').click();
      await login.setPassword(credentials.password);
      await page.locator('button[type=submit]').click();
      expect(await login.signInError()).toContain(
        'Primary account email required for sign-in'
      );

      // Success signing in with New email
      await login.useDifferentAccountLink();
      await login.login(newEmail, credentials.password);
      const primary = await settings.primaryEmail.statusText();
      expect(primary).toEqual(newEmail);
    });

    test('change primary email, password and login', async ({
      credentials,
      page,
      pages: { settings, changePassword, login },
    }) => {
      const newPassword = credentials.password + '@@2';
      await settings.password.clickChange();
      await changePassword.setCurrentPassword(credentials.password);
      await changePassword.setNewPassword(newPassword);
      await changePassword.setConfirmPassword(newPassword);
      await changePassword.submit();
      await settings.signOut();

      // Sign in with old password
      await login.setEmail(newEmail);
      await page.locator('button[type=submit]').click();
      await login.setPassword(credentials.password);
      await page.locator('button[type=submit]').click();
      expect(await login.getTooltipError()).toContain('Incorrect password');

      // Sign in with new password
      credentials.password = newPassword;
      await login.setPassword(credentials.password);
      await login.submit();
      const primaryEmail = await settings.primaryEmail.statusText();
      expect(primaryEmail).toEqual(newEmail);
    });

    test('change primary email, change password, login, change email and login', async ({
      credentials,
      pages: { settings, changePassword, login },
    }) => {
      const newPassword = credentials.password + '@@4';
      await settings.password.clickChange();
      await changePassword.setCurrentPassword(credentials.password);
      await changePassword.setNewPassword(newPassword);
      await changePassword.setConfirmPassword(newPassword);
      await changePassword.submit();
      await settings.signOut();

      // Sign in with new password
      credentials.password = newPassword;
      await login.login(newEmail, credentials.password);

      // Change back the primary email again
      await settings.secondaryEmail.clickMakePrimary();
      await settings.signOut();

      // Login with primary email and new password
      await login.login(credentials.email, credentials.password);
      const primaryEmail = await settings.primaryEmail.statusText();
      expect(primaryEmail).toEqual(credentials.email);
    });

    test('can change primary email, delete account', async ({
      credentials,
      page,
      pages: { configPage, deleteAccount, login, signupReact, settings },
    }) => {
      const config = await configPage.getConfig();

      // Click delete account
      await settings.clickDeleteAccount();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.clickContinue();

      // Enter the correct password
      await deleteAccount.setPassword(credentials.password);
      await deleteAccount.submit();

      // // Try creating a new account with the same secondary email as previous account and new password
      if (config.showReactApp.signUpRoutes !== true) {
        await login.fillOutFirstSignUp(newEmail, credentials.password);
      } else {
        await signupReact.fillOutEmailFirst(newEmail);
        await signupReact.fillOutSignupForm(credentials.password);
        await signupReact.fillOutCodeForm(newEmail);
      }

      expect(await settings.alertBarText()).toContain(
        'Account confirmed successfully'
      );
      const primaryEmail = await settings.primaryEmail.statusText();
      expect(primaryEmail).toEqual(newEmail);
    });
  });

  test.describe('change primary - unblock', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, secondaryEmail } }) => {
        test.slow();
        await settings.goto();
        await settings.secondaryEmail.clickAdd();
        const newEmail = `blocked${Math.floor(
          Math.random() * 100000
        )}@restmail.net`;
        await secondaryEmail.addAndVerify(newEmail);
        await settings.secondaryEmail.clickMakePrimary();
        credentials.email = newEmail;
        await settings.signOut();
      }
    );

    test('change primary email, get blocked with invalid password, redirect enter password page', async ({
      credentials,
      pages: { login },
    }) => {
      const invalidPassword = credentials.password + '@@2';
      await login.login(credentials.email, invalidPassword);

      // Fill out unblock
      await login.unblock(credentials.email);

      // Verify the incorrect password error
      expect(await login.signInError()).toContain('Incorrect password');
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
      expect(page.url()).toBe(settings.url);
    });
  });
});
