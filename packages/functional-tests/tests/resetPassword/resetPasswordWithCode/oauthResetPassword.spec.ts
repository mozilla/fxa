/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { expect, test } from '../../../lib/fixtures/standard';
import { ResetPasswordReactPage } from '../../../pages/resetPasswordReact';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('reset password', async ({
      target,
      page,
      pages: { relier, resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await relier.goto();
      await relier.clickEmailFirst();

      await beginPasswordReset(
        resetPasswordReact,
        signinReact,
        credentials.email
      );

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9561 - Verify that the service name is displayed in the "Continue to ${serviceName}" button
      // This functionality is not yet implemented in the reset password flow

      // TODO in FXA-9561 - Remove this temporary test of sign in with new password
      // user should be signed in and able to navigate to the relying party

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      // old password fails
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(page.getByText('Incorrect password')).toBeVisible();
      // new passwowrd works
      await signinReact.fillOutPasswordForm(newPassword);
      await expect(page).toHaveURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);

      // update password for cleanup function
      credentials.password = newPassword;
    });

    test('reset password with PKCE', async ({
      target,
      page,
      pages: { resetPasswordReact, signinReact },
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

      await beginPasswordReset(
        resetPasswordReact,
        signinReact,
        credentials.email
      );

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
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
        resetPasswordReact,
        settings,
        signinReact,
        signinTotpCode,
        totp,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      // Goes to settings and enables totp on user's account.
      await expect(settings.settingsHeading).toBeVisible();
      await settings.totp.addButton.click();
      const totpCredentials = await totp.fillOutTotpForms();
      await settings.signOut();

      // Makes sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();
      await relier.clickEmailFirst();

      await beginPasswordReset(
        resetPasswordReact,
        signinReact,
        credentials.email
      );

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);

      // TODO in FXA-9352 - update test to include 2FA steps before a new password can be set

      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // Goes to settings and disables totp on user's account (required for cleanup)
      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(newPassword);

      await expect(page).toHaveURL(/signin_totp_code/);

      const totpCode = await getCode(totpCredentials.secret);
      await signinTotpCode.input.fill(totpCode);
      await signinTotpCode.submit.click();

      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp();
      await settings.signOut();

      // update password for cleanup function
      credentials.password = newPassword;
    });
  });

  async function beginPasswordReset(
    resetPasswordReact: ResetPasswordReactPage,
    signinReact: SigninReactPage,
    email: string
  ): Promise<void> {
    await signinReact.fillOutEmailFirstForm(email);
    await signinReact.forgotPasswordLink.click();
    await resetPasswordReact.fillOutEmailForm(email);
  }
});
