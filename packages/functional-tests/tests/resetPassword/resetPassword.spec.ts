/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('can reset password', async ({
    target,
    pages: { resetPassword, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await resetPassword.goto();

    await resetPassword.page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );

    await resetPassword.fillOutResetPasswordCodeForm(code);

    // Create and submit new password
    await resetPassword.fillOutNewPasswordForm(newPassword);

    await expect(settings.settingsHeading).toBeVisible();

    // Cleanup requires setting this value to correct password
    credentials.password = newPassword;
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
      pages: { page, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const passwordValue = password ?? credentials.email;

      await resetPassword.goto();

      await resetPassword.page.waitForURL(/reset_password/);

      await resetPassword.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPassword.fillOutResetPasswordCodeForm(code);

      await resetPassword.fillOutNewPasswordForm(passwordValue, false);

      await expect(page.getByText(error)).toBeVisible();
      await expect(resetPassword.resetPasswordButton).toBeDisabled();
      await expect(resetPassword.newPasswordInput).toHaveClass(
        /border-red-700/
      );
    });
  }

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    pages: { resetPassword },
  }) => {
    await resetPassword.goto('/confirm_reset_password');

    await resetPassword.page.waitForURL(/reset_password/);

    // Verify its redirected to reset password page
    await expect(resetPassword.resetPasswordHeading).toBeVisible();
  });

  test('open /reset_password page from /signin', async ({
    pages: { signin, resetPassword },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signin.goto();
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

    resetPassword.resendButton.click();

    await expect(resetPassword.successBanner).toHaveText(
      /A new code was sent to your email./
    );
  });

  test('open /reset_password page, enter unknown email, wait for error', async ({
    pages: { resetPassword },
  }) => {
    await resetPassword.goto();

    await resetPassword.page.waitForURL(/reset_password/);

    await resetPassword.fillOutEmailForm('email@restmail.net');

    await expect(resetPassword.errorBanner).toHaveText('Unknown account');
  });

  test('browse directly to page with email on query params', async ({
    pages: { resetPassword },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await resetPassword.goto(undefined, `email=${credentials.email}`);

    await resetPassword.page.waitForURL(/reset_password/);

    //The email shouldn't be pre-filled
    const emailInput = await resetPassword.emailTextbox.inputValue();
    expect(emailInput).toEqual('');

    await resetPassword.fillOutEmailForm(credentials.email);

    await expect(resetPassword.confirmResetPasswordHeading).toBeVisible();
  });
});
