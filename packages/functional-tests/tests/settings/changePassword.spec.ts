/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
let newPassword;

test.describe('severity-1 #smoke', () => {
  test.describe('change password tests', () => {
    test.beforeEach(async ({ pages: { settings }, credentials }) => {
      newPassword = credentials.password + '@@2';
      await settings.goto();
      await settings.password.clickChange();
    });

    test('change password with an incorrect old password', async ({
      pages: { changePassword },
    }) => {
      test.slow();
      // Enter incorrect old password and verify the tooltip error
      await changePassword.fillOutChangePassword(
        'Incorrect Password',
        newPassword
      );
      await changePassword.clickSignIn();
      expect(await changePassword.changePasswordTooltip()).toContain(
        'Incorrect password'
      );
    });

    test('change password with a correct password', async ({
      pages: { settings, changePassword, login },
      credentials,
    }) => {
      test.slow();
      // Enter the correct old password and verify that change password is successful
      await changePassword.fillOutChangePassword(
        credentials.password,
        newPassword
      );
      await changePassword.submit();

      // Sign out and login with new password
      await settings.signOut();
      credentials.password = newPassword;
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      await login.setPassword(credentials.password);
      await login.submit();
      const primaryEmail = await settings.primaryEmail.statusText();
      expect(primaryEmail).toEqual(credentials.email);
    });

    test('new password validation', async ({
      pages: { changePassword },
      credentials,
    }) => {
      // Short password
      await changePassword.setNewPassword('short');
      expect(await changePassword.passwordLengthError()).toBe(true);

      // Password same as email
      await changePassword.setNewPassword(credentials.email);
      expect(await changePassword.passwordSameAsEmailError()).toBe(true);

      // Set a common password
      await changePassword.setNewPassword('passwords');
      expect(await changePassword.commonPasswordError()).toBe(true);

      // Confirm password doesn't match the new password
      await changePassword.setNewPassword(credentials.password);
      await changePassword.setConfirmPassword(credentials.password + '2');
      expect(await changePassword.confirmPasswordError()).toBe(true);

      // valid password
      await changePassword.setCurrentPassword(credentials.password);
      await changePassword.setNewPassword(newPassword);
      await changePassword.setConfirmPassword(newPassword);
      expect(await changePassword.submitButton()).toBe(true);
    });

    test('change password with short password tooltip shows, cancel and try to change password again, tooltip is not shown', async ({
      pages: { settings, changePassword },
    }) => {
      // Short password
      await changePassword.setNewPassword('short');
      expect(await changePassword.passwordLengthError()).toBe(true);

      // Click cancel and navigate to change password again
      await changePassword.clickCancelChangePassword();
      await settings.password.clickChange();
      expect(await changePassword.validPasswordLength()).toBe(true);
    });

    test('reset password via settings works', async ({
      pages: { login, resetPassword },
    }, { project }) => {
      test.slow();

      // Click forgot password link
      await login.clickForgotPassword();

      // Verify it navigates to reset password page
      await resetPassword.resetPasswordHeader();
    });
  });
});
