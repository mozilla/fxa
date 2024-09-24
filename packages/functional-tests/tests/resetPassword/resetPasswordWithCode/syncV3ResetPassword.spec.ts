/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'see FXA-9728, remove conditional skip when feature flag removed'
      );
    });

    test('reset pw for sync user', async ({
      target,
      syncBrowserPages: { page, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await resetPassword.goto(undefined, 'context=fx_desktop_v3&service=sync');

      await resetPassword.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      await expect(resetPassword.dataLossWarning).toBeVisible();
      await resetPassword.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9561 - Verify that the service name is displayed in the "Continue to ${serviceName}" button
      // This functionality is not yet implemented in the reset password flow

      // Update credentials file so that account can be deleted as part of test cleanup
      credentials.password = newPassword;
    });
  });
});
