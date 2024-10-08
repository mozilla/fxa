/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { expect, test } from '../../lib/fixtures/standard';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password', () => {
    test('reset password', async ({
      target,
      page,
      pages: { relier, resetPassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await relier.goto();
      await relier.clickEmailFirst();

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

      // TODO in FXA-9561 - Verify that the service name is displayed in the "Continue to ${serviceName}" button
      // This functionality is not yet implemented in the reset password flow

      // TODO in FXA-9561 - Remove this temporary test of sign in with new password
      // user should be signed in and able to navigate to the relying party

      await relier.goto();
      await relier.clickEmailFirst();

      // a successful password reset means that the user is signed in
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      await expect(page).toHaveURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('reset password with PKCE', async ({
      target,
      page,
      pages: { resetPassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // TODO in FXA-8006 - Update this test to use the 123Done PKCE button once fixed
      // For now navigate directly to the link.
      await page.goto(
        `${target.contentServerUrl}/authorization?` +
          `access_type=offline` +
          `&client_id=${target.relierClientID}` +
          `&pkce_client_id=38a6b9b3a65a1871` +
          `&redirect_uri=${encodeURIComponent(
            target.relierUrl + '/api/oauth'
          )}` +
          `&scope=profile%20openid` +
          `&action=signin` +
          `&state=12eeaba43cc7548bf1f6b478b9de95328855b46df1e754fe94b21036c41c9cba`
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

      // TODO in FXA-9561 - Verify that the service name is displayed in the "Continue to ${serviceName}" button
      // This functionality is not yet implemented in the reset password flow

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('reset password with valid totp', async ({
      target,
      pages: {
        page,
        relier,
        resetPassword,
        settings,
        signin,
        signinTotpCode,
        totp,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      // Goes to settings and enables totp on user's account.
      await expect(settings.settingsHeading).toBeVisible();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      // Makes sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();
      await relier.clickEmailFirst();

      await beginPasswordReset(resetPassword, signin, credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      // Fill out the TOTP form
      let totpCode = await getCode(secret);
      await resetPassword.fillOutTotpForm(totpCode);

      await resetPassword.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      // Goes to settings and disables totp on user's account (required for cleanup)
      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(newPassword);

      await expect(page).toHaveURL(/signin_totp_code/);

      totpCode = await getCode(secret);
      await expect(page).toHaveURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp();
      await settings.signOut();

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
