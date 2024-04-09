/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, NEW_PASSWORD } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-2 #smoke', () => {
  test.describe('Reset password current', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      test.slow();

      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.resetPasswordRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-8267).'
      );
    });

    test('can reset password', async ({
      page,
      target,
      credentials,
      context,
      pages: { login, resetPassword, settings },
    }) => {
      await page.goto(`${target.contentServerUrl}/reset_password`);

      // Verify backbone page has been loaded
      await page.waitForSelector('#stage');

      await resetPassword.fillOutResetPassword(credentials.email);

      // Verify confirm password reset page has rendered
      await resetPassword.confirmResetPasswordHeader();

      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );

      // Open link in a new window
      const diffPage = await context.newPage();
      await diffPage.goto(link);

      await resetPassword.completeResetPasswordHeader(diffPage);

      await resetPassword.resetNewPassword(NEW_PASSWORD, diffPage);

      await page.getByRole('heading', { name: 'Settings', level: 2 }).waitFor();

      await diffPage
        .getByRole('heading', { name: 'Settings', level: 2 })
        .waitFor();

      await diffPage.close();
      await settings.signOut();

      // Verify that new password can be used to log in
      await login.setEmail(credentials.email);
      await login.submit();
      await login.setPassword(NEW_PASSWORD);
      await login.submit();

      await page.getByRole('heading', { name: 'Settings', level: 2 }).waitFor();

      // Cleanup requires setting this value to correct password
      credentials.password = NEW_PASSWORD;
    });

    test('forgot password', async ({
      target,
      credentials,
      page,
      pages: { login, settings },
    }) => {
      await page.goto(target.contentServerUrl + '/reset_password');
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link, { waitUntil: 'load' });
      await login.setNewPassword(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toBeVisible();
    });

    test('visit confirmation screen without initiating reset_password, user is redirected to /reset_password', async ({
      target,
      page,
      pages: { resetPassword },
    }) => {
      await page.goto(
        `${target.contentServerUrl}/confirm_reset_password?showReactApp=false`
      );

      // Verify its redirected to reset password page
      await resetPassword.resetPasswordHeader();
    });

    test('open /reset_password page from /signin', async ({
      credentials,
      pages: { login },
    }) => {
      await login.goto();
      await login.setEmail(credentials.email);
      await login.submit();
      await login.clickForgotPassword();
    });

    test('enter an email with leading/trailing whitespace', async ({
      credentials,
      target,
      page,
      pages: { login, resetPassword },
    }) => {
      await page.goto(`${target.contentServerUrl}/reset_password`);
      await resetPassword.fillOutResetPassword(' ' + credentials.email);
      await resetPassword.confirmResetPasswordHeader();

      await page.goto(`${target.contentServerUrl}/reset_password`);
      await resetPassword.fillOutResetPassword(credentials.email + ' ');
      await resetPassword.confirmResetPasswordHeader();
    });

    test('open confirm_reset_password page, click resend', async ({
      credentials,
      target,
      page,
      pages: { resetPassword },
    }) => {
      await page.goto(`${target.contentServerUrl}/reset_password`);
      await resetPassword.fillOutResetPassword(credentials.email);
      await resetPassword.clickResend();
      expect(await resetPassword.resendSuccessMessage()).toContain(
        'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      );
    });

    test('open /reset_password page, enter unknown email, wait for error', async ({
      target,
      page,
      pages: { login, resetPassword },
    }) => {
      await page.goto(`${target.contentServerUrl}/reset_password`);
      await login.setEmail('email@restmail.net');
      await resetPassword.clickBeginReset();
      expect(await resetPassword.unknownAccountError()).toContain(
        'Unknown account.'
      );
    });

    test('browse directly to page with email on query params', async ({
      credentials,
      target,
      page,
      pages: { resetPassword },
    }) => {
      const url = `${target.contentServerUrl}/reset_password?email=${credentials.email}`;
      await page.goto(url);

      //The email shouldn't be pre-filled
      await expect(resetPassword.getEmailValue()).toBeEmpty();
      await resetPassword.fillOutResetPassword(credentials.email);
      await resetPassword.confirmResetPasswordHeader();
    });
  });
});
