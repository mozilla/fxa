/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../../lib/fixtures/standard';
import { syncMobileOAuthQueryParams } from '../../../lib/query-params';
import { ResetPasswordPage } from '../../../pages/resetPassword';
import { SigninPage } from '../../../pages/signin';

const SERVICE_NAME_123 = '123';
const SERVICE_NAME_FIREFOX = 'Firefox';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9728, remove these tests'
      );
    });

    test('reset password', async ({
      target,
      page,
      pages: { signin, relier, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        signin,
        resetPassword,
        credentials.email,
        SERVICE_NAME_123
      );

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      await page.goto(link);
      await resetPassword.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      await page.reload();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password through Sync mobile', async ({
      target,
      syncBrowserPages: { page, signin, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
      );

      await beginPasswordReset(
        page,
        signin,
        resetPassword,
        credentials.email,
        SERVICE_NAME_FIREFOX
      );

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      await page.goto(link);
      await resetPassword.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_FIREFOX}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password different tab', async ({
      target,
      page,
      pages: { signin, relier, resetPassword },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        signin,
        resetPassword,
        credentials.email,
        SERVICE_NAME_123
      );

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
      await page.evaluate(() => window.sessionStorage.clear());

      await page.goto(link);
      await resetPassword.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();

      await page.reload();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with PKCE different tab', async ({
      target,
      page,
      pages: { signin, resetPassword },
      testAccountTracker,
    }) => {
      test.fixme(true, 'Fix required as of 2023/07/18 (see FXA-8006).');
      // the PKCE button is broken at the moment, so for now navigate directly to the link.
      // PKCE button doesn't appear to work at the moment locally. Some sort of cors error
      // keeps getting in the way. Just go to link directly for now.
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(
        `http://localhost:3030/authorization?` +
          `&access_type=offline` +
          `&client_id=${target.relierClientID}` +
          `&pkce_client_id=38a6b9b3a65a1871` +
          `&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth` +
          `&scope=profile%20openid` +
          `&action=signin` +
          `&state=12eeaba43cc7548bf1f6b478b9de95328855b46df1e754fe94b21036c41c9cba`
      );

      await beginPasswordReset(
        page,
        signin,
        resetPassword,
        credentials.email,
        SERVICE_NAME_123
      );

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
      await page.evaluate(() => window.sessionStorage.clear());

      await page.goto(link, { waitUntil: 'load' });
      await resetPassword.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with valid totp', async ({
      target,
      pages: { page, signin, resetPassword, relier, totp, settings },
      testAccountTracker,
    }) => {
      test.fixme(true, 'Fix required as of 2024/04/25 FXA-9513');

      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      // Goes to settings and enables totp on user's account.
      await settings.totp.addButton.click();
      await totp.fillOutTotpForms();
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      // Makes sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();
      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        signin,
        resetPassword,
        credentials.email,
        SERVICE_NAME_123
      );

      await resetPassword.fillOutEmailForm(credentials.email);
      const link = await target.emailClient.getRecoveryLink(credentials.email);
      await page.goto(link, { waitUntil: 'load' });
      await resetPassword.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPassword.passwordResetConfirmationHeading
      ).toBeVisible();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });
  });

  async function beginPasswordReset(
    page: Page,
    signin: SigninPage,
    resetPassword: ResetPasswordPage,
    email: string,
    serviceName: string
  ): Promise<void> {
    await signin.fillOutEmailFirstForm(email);
    await signin.forgotPasswordLink.click();

    // Verify reset password header
    // The service name can change based on environments and all of our test RPs from 123done have
    // service names that begin with '123'. This test just ensures that the OAuth service name is rendered,
    // it's OK that it does not exactly match.
    // If the 'relier' page isn't passed, it's a Sync test, and 'serviceName' will display as "Firefox Sync"
    // due to a `scope` param check (see `getServiceName` method on the OAuth integration). When resetting
    // through a link, we do not pass the `scope` param, and the service name is not altered. This means for
    // the iOS client_id, the name displays as "Firefox for iOS" on the "verified" page and also means
    // for now we can check for if the string contains "Firefox", but when we switch to codes, we can determine
    // if we want to and always display "Firefox Sync" on both pages.
    await expect(resetPassword.resetPasswordHeading).toContainText(serviceName);
  }
});
