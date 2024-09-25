/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { syncMobileOAuthQueryParams } from '../../lib/query-params';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password Sync mobile react', () => {
    test('reset password through Sync mobile', async ({
      target,
      syncBrowserPages: { page, connectAnotherDevice, resetPassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
      );

      await beginPasswordReset(resetPassword, signin, credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);
      await resetPassword.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9561 - Remove this temporary test of sign in with new password
      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
      );
      // expect user to be signed in to sync and prompted for cached signin
      // old password fails
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page.getByText('Incorrect password')).toBeVisible();
      // new passwowrd works
      await signin.fillOutPasswordForm(newPassword);

      await expect(connectAnotherDevice.header).toBeVisible();

      // update password for cleanup function
      credentials.password = newPassword;
    });
  });

  async function beginPasswordReset(
    resetPassword: ResetPasswordPage,
    signin: SigninPage,
    email: string
  ): Promise<void> {
    await signin.fillOutEmailFirstForm(email);
    await signin.forgotPasswordLink.click();
    await resetPassword.fillOutEmailForm(email);
  }
});
