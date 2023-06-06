/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

test.describe('reset password', () => {
  test.beforeEach(async ({ pages: { login } }) => {
    test.slow();
    // Ensure that the feature flag is enabled
    const config = await login.getConfig();
    test.skip(config.showReactApp.resetPasswordRoutes !== true);
  });

  test('can reset password', async ({
    page,
    target,
    credentials,
    context,
    pages: { login, resetPassword, settings },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page has been loaded
    await page.waitForSelector('#root');

    await resetPassword.fillOutResetPassword(credentials.email);

    // Wait for navigation after email submitted
    await page.waitForURL(
      getReactFeatureFlagUrl(target, '/confirm_reset_password')
    );

    // Verify confirm password reset page rendered
    expect(await resetPassword.confirmResetPasswordHeadingReact()).toBe(true);

    // We need to append `&showReactApp=true` to reset link in order to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    // Open link in a new window
    const diffPage = await context.newPage();
    await diffPage.goto(link);

    // Renders the React version of complete password reset page
    expect(await diffPage.locator('#root').isEnabled()).toBe(true);
    expect(await resetPassword.hasCompleteResetPasswordHeading(diffPage)).toBe(
      true
    );

    // Create and submit new password
    await resetPassword.submitNewPasswordReact(NEW_PASSWORD, diffPage);

    // Wait for new page to navigate
    await diffPage.waitForURL(
      `${target.contentServerUrl}/reset_password_verified`
    );

    // Wait for initial page to automatically redirect once password is reset
    await page.waitForURL(`${target.contentServerUrl}/signin`);

    // Verify password reset confirmation page is rendered
    expect(await resetPassword.resetPasswordConfirmedReact(diffPage)).toBe(
      true
    );

    await diffPage.close();

    // Verify initial page redirected to sign in and sign in page rendered
    expect(await login.emailHeader.isEnabled()).toBe(true);

    await login.setEmail(credentials.email);
    await login.clickSubmit();
    await page.waitForURL(`${target.contentServerUrl}/signin`);

    await login.setPassword(NEW_PASSWORD);
    await login.clickSubmit();
    await page.waitForURL(`${target.contentServerUrl}/settings`);

    expect(
      await page
        .getByRole('heading', { name: 'Settings', level: 2 })
        .isEnabled()
    ).toBe(true);

    // Cleanup requires setting this value to correct password
    credentials.password = NEW_PASSWORD;
  });

  /* TODO test reset pw validation errors
   * - short password (e.g., "pass")
   * - common password (e.g., "password")
   * - user emails (e.g., credentials.email)
   *
   * In these cases, confirm that error feedback is displayed and form is not submitted
   */

  test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/confirm_reset_password'));

    // Verify its redirected to react reset password page
    expect(await page.locator('#root').isEnabled()).toBe(true);
    expect(await resetPassword.beginResetPasswordHeadingReact()).toBe(true);
  });

  test('open /reset_password page from /signin', async ({
    credentials,
    page,
    pages: { login },
  }) => {
    await login.goto();
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();
    // Verify react page has been loaded - to be enabled when link to react page from sign in is active
    // await page.waitForSelector('#root');
  });

  test('enter an email with leading whitespace', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));
    await resetPassword.fillOutResetPassword(' ' + credentials.email);
    await page.waitForURL(
      getReactFeatureFlagUrl(target, '/confirm_reset_password')
    );
    expect(await resetPassword.confirmResetPasswordHeadingReact()).toBe(true);
  });

  test('enter an email with trailing whitespace', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));
    await resetPassword.fillOutResetPassword(credentials.email + ' ');
    await page.waitForURL(
      getReactFeatureFlagUrl(target, '/confirm_reset_password')
    );
    expect(await resetPassword.confirmResetPasswordHeadingReact()).toBe(true);
  });

  test('open confirm_reset_password page, click resend', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page is loaded
    await page.waitForSelector('#root');

    await resetPassword.fillOutResetPassword(credentials.email);
    await page.waitForURL(
      getReactFeatureFlagUrl(target, '/confirm_reset_password')
    );
    expect(await resetPassword.confirmResetPasswordHeadingReact()).toBe(true);

    const resendButton = await page.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    expect(await resendButton.isEnabled()).toBeTruthy();
    expect(await resendButton.isVisible()).toBeTruthy();
    await resendButton.click();
    expect(
      await page
        .getByText(
          'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
        )
        .isEnabled()
    ).toBeTruthy();
  });

  test('open /reset_password page, enter unknown email, wait for error', async ({
    target,
    page,
    pages: { login, resetPassword },
  }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/reset_password'));

    // Verify react page is loaded
    expect(await page.locator('#root').isEnabled()).toBe(true);

    await page
      .getByRole('textbox', { name: 'Email' })
      .fill('email@restmail.net');
    await page.getByRole('button', { name: 'Begin reset' }).click();
    expect(await page.getByText('Unknown account').isEnabled()).toBeTruthy();
  });

  test('browse directly to page with email on query params', async ({
    credentials,
    target,
    page,
    pages: { resetPassword },
  }) => {
    await page.goto(
      getReactFeatureFlagUrl(
        target,
        '/reset_password',
        `email=${credentials.email}`
      )
    );

    // Verify react page is loaded
    expect(await page.locator('#root').isEnabled()).toBe(true);

    //The email shouldn't be pre-filled
    const emailInput = await resetPassword.getEmailValue();
    expect(emailInput).toHaveValue('');
    await resetPassword.fillOutResetPassword(credentials.email);
    await page.waitForURL(
      getReactFeatureFlagUrl(target, '/confirm_reset_password')
    );
    expect(await page.locator('#root').isEnabled()).toBe(true);
    expect(await resetPassword.confirmResetPasswordHeadingReact()).toBe(true);
  });
});
