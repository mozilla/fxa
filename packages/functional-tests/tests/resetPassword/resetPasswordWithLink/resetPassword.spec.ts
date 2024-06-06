/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';
import { ResetPasswordPage } from '../../../pages/resetPassword';

test.describe('severity-1 #smoke', () => {
  test.describe('reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9728, remove these tests'
      );
    });

    test('can reset password', async ({
      page,
      target,
      context,
      pages: { signin, resetPassword, settings },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);

      // Verify confirm password reset page rendered
      await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();

      const link = await target.emailClient.getRecoveryLink(credentials.email);
      // Open link in a new window
      const diffPage = await context.newPage();
      const diffResetPasswordReact = new ResetPasswordPage(diffPage, target);
      await diffPage.goto(link);

      await expect(
        diffResetPasswordReact.createNewPasswordHeading
      ).toBeVisible();

      // Create and submit new password
      await diffResetPasswordReact.fillOutNewPasswordForm(newPassword);

      // Wait for new page to navigate
      await diffPage.waitForURL(/reset_password_verified/);
      // Verify password reset confirmation page is rendered
      await expect(
        diffResetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();
      await diffPage.close();

      await page.goto(target.contentServerUrl);

      // Verify initial page redirected to sign in and sign in page rendered
      await expect(signin.emailFirstHeading).toBeVisible();

      await signin.fillOutEmailFirstForm(credentials.email);

      await expect(signin.passwordFormHeading).toBeVisible();

      await signin.fillOutPasswordForm(newPassword);
      // Cleanup requires setting this value to correct password
      credentials.password = newPassword;

      await expect(settings.settingsHeading).toBeVisible();
      // Check that connected service name is not empty!
      await expect(settings.connectedServiceName).toContainText('Firefox');
    });

    test('forgot password', async ({
      target,
      page,
      pages: { resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      await page.goto(link);
      await resetPassword.fillOutNewPasswordForm(credentials.password);

      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();
    });

    const testCases = [
      {
        name: 'short password',
        error: 'At least 8 characters',
        password: '2short',
      },
      {
        name: 'common password',
        error: 'Not a commonly used password',
        password: 'password',
      },
      { name: 'email as password', error: 'Not your email' },
    ];
    for (const { name, error, password } of testCases) {
      test(`cannot set an invalid password - ${name}`, async ({
        target,
        context,
        pages: { resetPassword },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();
        // eslint-disable-next-line playwright/no-conditional-in-test
        const passwordValue = password ?? credentials.email;

        await resetPassword.goto();

        await resetPassword.fillOutEmailForm(credentials.email);

        // Verify confirm password reset page rendered
        await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();

        const link = await target.emailClient.getRecoveryLink(
          credentials.email
        );
        // Open link in a new window
        const diffPage = await context.newPage();
        const diffResetPasswordReact = new ResetPasswordPage(diffPage, target);
        await diffPage.goto(link);

        await expect(
          diffResetPasswordReact.createNewPasswordHeading
        ).toBeVisible();

        await diffResetPasswordReact.fillOutNewPasswordForm(passwordValue);

        await expect(diffPage.getByText(error)).toBeVisible();
        await expect(diffResetPasswordReact.newPasswordTextbox).toBeFocused();
      });
    }

    test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
      page,
      pages: { resetPassword },
    }) => {
      await resetPassword.goto('/confirm_reset_password');

      // Verify its redirected to react reset password page
      await expect(page.locator('#root')).toBeEnabled();
      await expect(resetPassword.resetPasswordHeading).toBeVisible();
    });

    test('open /reset_password page from /signin', async ({
      pages: { page, signin, resetPassword },
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await page.goto(target.contentServerUrl);

      await expect(signin.emailFirstHeading).toBeVisible();

      await signin.fillOutEmailFirstForm(credentials.email);

      await signin.forgotPasswordLink.click();

      await expect(resetPassword.resetPasswordHeading).toBeVisible();
    });

    test('open confirm_reset_password page, click resend', async ({
      pages: { resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPassword.goto();

      await resetPassword.fillOutEmailForm(credentials.email);

      await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();

      resetPassword.resendButton.click();

      await expect(resetPassword.statusBar).toHaveText(/Email re-?sent/);
    });

    test('open /reset_password page, enter unknown email, wait for error', async ({
      pages: { resetPassword },
    }) => {
      await resetPassword.goto();

      await resetPassword.fillOutEmailForm('email@restmail.net');

      await expect(resetPassword.statusBar).toHaveText('Unknown account');
    });

    test('browse directly to page with email on query params', async ({
      pages: { resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPassword.goto(undefined, `email=${credentials.email}`);

      //The email shouldn't be pre-filled
      const emailInput = await resetPassword.emailTextbox.inputValue();
      expect(emailInput).toEqual('');

      await resetPassword.fillOutEmailForm(credentials.email);

      await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();
    });
  });
});
