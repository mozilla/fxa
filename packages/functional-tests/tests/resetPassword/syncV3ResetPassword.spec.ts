/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 reset password react', () => {
    test('reset pw for sync user', async ({
      target,
      syncBrowserPages: { resetPassword, settings },
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

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Your password has been reset'
      );

      // Update credentials file so that account can be deleted as part of test cleanup
      credentials.password = newPassword;
    });
  });
});
