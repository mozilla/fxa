/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { ResetPasswordReactPage } from '../../../pages/resetPasswordReact';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password scoped keys react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('reset password scoped keys', async ({
      target,
      page,
      pages: { relier, resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickSignInScopedKeys();

      await beginPasswordReset(
        credentials.email,
        resetPasswordReact,
        signinReact
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
  });

  async function beginPasswordReset(
    email: string,
    resetPasswordReact: ResetPasswordReactPage,
    signinReact: SigninReactPage
  ): Promise<void> {
    await signinReact.fillOutEmailFirstForm(email);
    await signinReact.forgotPasswordLink.click();
    await resetPasswordReact.fillOutEmailForm(email);
  }
});
