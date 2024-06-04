/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.featureFlags.resetPasswordWithCode !== true,
      'see FXA-9728, remove conditional skip when feature flag removed'
    );
  });

  test('can reset password', async ({
    page,
    target,
    pages: { signinReact, resetPasswordReact, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const newPassword = testAccountTracker.generatePassword();

    await resetPasswordReact.goto();

    await resetPasswordReact.fillOutEmailForm(credentials.email);

    const code = await target.emailClient.getResetPasswordCode(
      credentials.email
    );

    await resetPasswordReact.fillOutResetPasswordCodeForm(code);

    // Create and submit new password
    await resetPasswordReact.fillOutNewPasswordForm(newPassword);

    // Wait for new page to navigate
    await expect(page).toHaveURL(/reset_password_verified/);

    await page.goto(target.contentServerUrl);

    await signinReact.fillOutEmailFirstForm(credentials.email);

    await signinReact.fillOutPasswordForm(newPassword);

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
      pages: { page, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const passwordValue = password ?? credentials.email;

      await resetPasswordReact.goto();

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      const code = await target.emailClient.getResetPasswordCode(
        credentials.email
      );

      await resetPasswordReact.fillOutResetPasswordCodeForm(code);

      await resetPasswordReact.fillOutNewPasswordForm(passwordValue);

      await expect(page.getByText(error)).toBeVisible();
      await expect(resetPasswordReact.newPasswordTextbox).toBeFocused();
    });
  }

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    pages: { resetPasswordReact },
  }) => {
    await resetPasswordReact.goto('/confirm_reset_password');

    // Verify its redirected to reset password page
    await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
  });

  test('open /reset_password page from /signin', async ({
    pages: { signinReact, resetPasswordReact },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signinReact.goto();
    await signinReact.fillOutEmailFirstForm(credentials.email);
    await signinReact.forgotPasswordLink.click();

    await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
  });

  test('open confirm_reset_password page, click resend', async ({
    pages: { resetPasswordReact },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await resetPasswordReact.goto();

    await resetPasswordReact.fillOutEmailForm(credentials.email);

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

    await expect(resetPasswordReact.confirmResetPasswordHeading).toBeVisible();
  });
});
