/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

const NEW_PASSWORD = 'notYourAveragePassW0Rd';

test.describe('severity-1 #smoke', () => {
  test.describe('reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      test.slow();
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
    });

    test('can reset password', async ({
      page,
      target,
      credentials,
      context,
      pages: { login, resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      // Verify react page has been loaded
      await page.waitForSelector('#root');

      await resetPasswordReact.fillEmailToResetPwd(credentials.email);

      // Wait for navigation after email submitted
      await page.waitForURL(
        getReactFeatureFlagUrl(target, '/confirm_reset_password')
      );

      // Verify confirm password reset page rendered
      await resetPasswordReact.confirmResetPasswordHeadingVisible();

      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );

      // Open link in a new window
      const diffPage = await context.newPage();
      await diffPage.goto(link);

      // Renders the React version of complete password reset page
      await page.waitForSelector('#root');

      await resetPasswordReact.completeResetPwdHeadingVisible(diffPage);

      // Create and submit new password
      await resetPasswordReact.submitNewPassword(NEW_PASSWORD, diffPage);

      // Wait for new page to navigate
      await diffPage.waitForURL(/reset_password_verified/);

      // Wait for initial page to automatically redirect once password is reset
      // without an account in local storage (state in this test), the initial navigation
      // to /signin is expected to redirect to the root
      await page.waitForURL(target.contentServerUrl);

      // Verify password reset confirmation page is rendered
      await resetPasswordReact.resetPwdConfirmedHeadingVisible(diffPage);

      await diffPage.close();

      // Verify initial page redirected to sign in and sign in page rendered
      await login.emailHeader.waitFor();

      await login.setEmail(credentials.email);
      await login.clickSubmit();
      await page.waitForURL(`${target.contentServerUrl}/signin`);

      await login.setPassword(NEW_PASSWORD);
      await login.clickSubmit();
      await page.waitForURL(`${target.contentServerUrl}/settings`);

      await page.getByRole('heading', { name: 'Settings', level: 2 }).waitFor();

      // Check that connected service name is not empty!
      expect(await page.getByTestId('service-name').innerText()).toContain(
        'Firefox'
      );

      // Cleanup requires setting this value to correct password
      credentials.password = NEW_PASSWORD;
    });

    test('cannot set an invalid password', async ({
      page,
      target,
      credentials,
      context,
      pages: { login, resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      // Verify react page has been loaded
      await page.waitForSelector('#root');

      await resetPasswordReact.fillEmailToResetPwd(credentials.email);

      // Wait for navigation after email submitted
      await page.waitForURL(
        getReactFeatureFlagUrl(target, '/confirm_reset_password')
      );

      // Verify confirm password reset page rendered
      await resetPasswordReact.confirmResetPasswordHeadingVisible();

      // We need to append `&showReactApp=true` to reset link in order to enroll in reset password experiment
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );

      // Open link in a new window
      const diffPage = await context.newPage();
      await diffPage.goto(link);

      // Renders the React version of complete password reset page
      await page.waitForSelector('#root');
      await resetPasswordReact.completeResetPwdHeadingVisible(diffPage);

      // Attempt to submit short password
      await resetPasswordReact.submitNewPassword('2short', diffPage);

      await diffPage.getByText('At least 8 characters').waitFor();
      await expect(
        diffPage.getByRole('textbox', { name: 'New password' })
      ).toBeFocused();

      // Attempt to submit email as password
      await resetPasswordReact.submitNewPassword(credentials.email, diffPage);

      await diffPage.getByText('Not your email').waitFor();
      await expect(
        diffPage.getByRole('textbox', { name: 'New password' })
      ).toBeFocused();

      // Attempt to submit a common password
      await resetPasswordReact.submitNewPassword('password', diffPage);

      await diffPage.getByText('Not a commonly used password').waitFor();
      await expect(
        diffPage.getByRole('textbox', { name: 'New password' })
      ).toBeFocused();
    });

    test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
      target,
      page,
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto('/confirm_reset_password');

      // Verify its redirected to react reset password page
      await expect(page.locator('#root')).toBeEnabled();
      await resetPasswordReact.resetPasswordHeadingVisible();
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

    // tests for submission success with leading/trailing whitespace in email has been moved to unit tests

    test('open confirm_reset_password page, click resend', async ({
      credentials,
      target,
      page,
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      // Verify react page is loaded
      await page.waitForSelector('#root');

      await resetPasswordReact.fillEmailToResetPwd(credentials.email);
      await page.waitForURL(
        getReactFeatureFlagUrl(target, '/confirm_reset_password')
      );
      await resetPasswordReact.confirmResetPasswordHeadingVisible();

      const resendButton = page.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      await resendButton.waitFor();
      await resendButton.click();
      await page.getByText(/Email re-sent/).waitFor();
    });

    test('open /reset_password page, enter unknown email, wait for error', async ({
      target,
      page,
      pages: { login, resetPasswordReact },
    }) => {
      await resetPasswordReact.goto();

      // Verify react page is loaded
      await page.waitForSelector('#root');
      await resetPasswordReact.fillEmailToResetPwd('email@restmail.net');
      await page.getByText('Unknown account').waitFor();
    });

    test('browse directly to page with email on query params', async ({
      credentials,
      target,
      page,
      pages: { resetPasswordReact },
    }) => {
      await resetPasswordReact.goto(undefined, `email=${credentials.email}`);

      // Verify react page is loaded
      await page.waitForSelector('#root');

      //The email shouldn't be pre-filled
      const emailInput = await resetPasswordReact.getEmailValue();
      expect(emailInput).toEqual('');
      await resetPasswordReact.fillEmailToResetPwd(credentials.email);
      await page.waitForURL(
        getReactFeatureFlagUrl(
          target,
          '/confirm_reset_password',
          `email=${encodeURIComponent(credentials.email)}`
        )
      );
      await page.waitForSelector('#root');
      await resetPasswordReact.confirmResetPasswordHeadingVisible();
    });
  });
});
