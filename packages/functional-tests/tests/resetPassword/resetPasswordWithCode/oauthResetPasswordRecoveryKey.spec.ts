/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { ResetPasswordReactPage } from '../../../pages/resetPasswordReact';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password with recovery key', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('reset password with account recovery key', async ({
      target,
      pages: {
        page,
        recoveryKey,
        relier,
        resetPasswordReact,
        settings,
        signinReact,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Goes to settings and enables the account recovery key on user's account.
      await settings.recoveryKey.createButton.click();
      const accountRecoveryKey = await recoveryKey.createRecoveryKey(
        credentials.password,
        'hint'
      );
      await settings.signOut();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickEmailFirst();

      await beginPasswordReset(
        credentials.email,
        resetPasswordReact,
        signinReact
      );

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);
      await resetPasswordReact.fillOutRecoveryKeyForm(accountRecoveryKey);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_with_recovery_key_verified/);
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
