/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password with recovery key', () => {
    test('reset password with account recovery key', async ({
      target,
      pages: { page, recoveryKey, relier, resetPassword, settings, signin },
      testAccountTracker,
    }) => {
      test.setTimeout(120000);

      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

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

      await beginPasswordReset(credentials.email, resetPassword, signin);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);
      await resetPassword.fillOutRecoveryKeyForm(accountRecoveryKey);
      await resetPassword.fillOutNewPasswordForm(newPassword);

      await expect(page).toHaveURL(/reset_password_with_recovery_key_verified/);
      await expect(resetPassword.passwordResetPasswordSaved).toBeVisible();
      await expect(resetPassword.recoveryKey).toBeVisible();
      const newKey = await resetPassword.recoveryKey.innerText();
      expect(newKey.replaceAll(' ', '')).toMatch(/[A-Z0-9]{32}/);

      const keyDownload = await resetPassword.downloadRecoveryKey();
      const filename = keyDownload.suggestedFilename();
      expect(filename).toMatch(
        new RegExp(`Mozilla-Recovery-Key_[0-9-]{10}_${credentials.email}.pdf`)
      );
      expect(filename.length).toBeGreaterThan(0);

      await expect(resetPassword.recoveryKeyHintHeading).toBeVisible();
      await resetPassword.recoveryKeyHintTextbox.fill('area 51');
      await resetPassword.recoveryKeyFinishButton.click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      // update password for cleanup function
      credentials.password = newPassword;
    });
  });

  async function beginPasswordReset(
    email: string,
    resetPassword: ResetPasswordPage,
    signin: SigninPage
  ): Promise<void> {
    await signin.fillOutEmailFirstForm(email);
    await signin.forgotPasswordLink.click();
    await resetPassword.fillOutEmailForm(email);
  }
});
