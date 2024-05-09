/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';

test.describe('severity-1 #smoke', () => {
  test.describe('reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
      test.slow();
    });

    test('can reset password', async ({
      target,
      context,
      pages: { signinReact, resetPasswordReact, settings },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      // Verify confirm password reset page rendered
      await expect(resetPasswordReact.resetEmailSentHeading).toBeVisible();

      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );

      // Open link in a new window
      const diffPage = await context.newPage();
      const diffResetPasswordReact = new ResetPasswordReactPage(
        diffPage,
        target
      );
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

      // Verify initial page redirected to sign in and sign in page rendered
      await expect(signinReact.emailFirstHeading).toBeVisible();

      await signinReact.fillOutEmailFirstForm(credentials.email);

      await expect(signinReact.passwordFormHeading).toBeVisible();

      await signinReact.fillOutPasswordForm(newPassword);

      // Cleanup requires setting this value to correct password
      credentials.password = newPassword;

      await expect(settings.settingsHeading).toBeVisible();
      // Check that connected service name is not empty!
      await expect(settings.connectedServiceName).toContainText('Firefox');
    });

    test('forgot password', async ({
      target,
      page,
      pages: { resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
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
        pages: { resetPasswordReact },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();
        // eslint-disable-next-line playwright/no-conditional-in-test
        const passwordValue = password ?? credentials.email;

        await resetPasswordReact.goto();

        await resetPasswordReact.fillOutEmailForm(credentials.email);

        // Verify confirm password reset page rendered
        await expect(resetPasswordReact.resetEmailSentHeading).toBeVisible();

        const link = await target.emailClient.waitForEmail(
          credentials.email,
          EmailType.recovery,
          EmailHeader.link
        );

        // Open link in a new window
        const diffPage = await context.newPage();
        const diffResetPasswordReact = new ResetPasswordReactPage(
          diffPage,
          target
        );
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
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto('/confirm_reset_password');

      // Verify its redirected to react reset password page
      await expect(page.locator('#root')).toBeEnabled();
      await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
    });

    test('open /reset_password page from /signin', async ({
      pages: { login, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await login.goto();

      await expect(login.emailHeader).toBeVisible();

      await login.setEmail(credentials.email);
      await login.submit();

      await login.clickForgotPassword();

      await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
    });

    test('open confirm_reset_password page, click resend', async ({
      pages: { resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      await expect(resetPasswordReact.resetEmailSentHeading).toBeVisible();

      resetPasswordReact.resendButton.click();

      await expect(resetPasswordReact.statusBar).toHaveText(/Email re-?sent/);
    });

    test('open /reset_password page, enter unknown email, wait for error', async ({
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm('email@restmail.net');

      await expect(resetPasswordReact.statusBar).toHaveText('Unknown account');
    });

    test('browse directly to page with email on query params', async ({
      pages: { resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await resetPasswordReact.goto(undefined, `email=${credentials.email}`);

      //The email shouldn't be pre-filled
      const emailInput = await resetPasswordReact.emailTextbox.inputValue();
      expect(emailInput).toEqual('');

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      await expect(resetPasswordReact.resetEmailSentHeading).toBeVisible();
    });
  });
});
