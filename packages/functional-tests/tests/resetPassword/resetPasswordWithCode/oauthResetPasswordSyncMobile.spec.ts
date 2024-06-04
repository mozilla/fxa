/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { syncMobileOAuthQueryParams } from '../../../lib/query-params';
import { ResetPasswordReactPage } from '../../../pages/resetPasswordReact';
import { SigninReactPage } from '../../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password Sync mobile react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('reset password through Sync mobile', async ({
      target,
      page,
      pages: { connectAnotherDevice, resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
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

      // TODO in FXA-9561 - Remove this temporary test of sign in with new password
      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
      );
      // expect user to be signed in to sync and prompted for cached signin
      // old password fails
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(page.getByText('Incorrect password')).toBeVisible();
      // new passwowrd works
      await signinReact.fillOutPasswordForm(newPassword);

      await expect(connectAnotherDevice.header).toBeVisible();

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
