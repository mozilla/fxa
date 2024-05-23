/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { syncMobileOAuthQueryParams } from '../../lib/query-params';
import { BaseTarget } from '../../lib/targets/base';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { LoginPage } from '../../pages/login';

const SERVICE_NAME_123 = '123';
const SERVICE_NAME_FIREFOX = 'Firefox';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9612'
      );
      test.slow();
    });

    test('reset password', async ({
      target,
      page,
      pages: { login, relier, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        login,
        resetPasswordReact,
        credentials.email,
        SERVICE_NAME_123
      );

      const link = await getConfirmationEmail(
        target,
        resetPasswordReact,
        credentials.email
      );

      await page.goto(link);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9612 page reload should not be required to see the service name
      // verify when updating tests for reset with code if this is still an issue
      // we should be able to remove the reload
      await page.reload();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password through Sync mobile', async ({
      target,
      page,
      pages: { login, resetPasswordReact },
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
        login,
        resetPasswordReact,
        credentials.email,
        SERVICE_NAME_FIREFOX
      );

      const link = await getConfirmationEmail(
        target,
        resetPasswordReact,
        credentials.email
      );

      await page.goto(link);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9612 page reload should not be required to see the service name
      // verify when updating tests for reset with code if this is still an issue
      // we should be able to remove the reload
      await page.reload();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_FIREFOX}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password different tab', async ({
      target,
      page,
      pages: { login, relier, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        login,
        resetPasswordReact,
        credentials.email,
        SERVICE_NAME_123
      );

      const link = await getConfirmationEmail(
        target,
        resetPasswordReact,
        credentials.email
      );

      // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
      await page.evaluate(() => window.sessionStorage.clear());

      await page.goto(link);
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // TODO in FXA-9612 page reload should not be required to see the service name
      // verify when updating tests for reset with code if this is still an issue
      // we should be able to remove the reload
      await page.reload();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with PKCE different tab', async ({
      target,
      page,
      pages: { login, resetPasswordReact },
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
        login,
        resetPasswordReact,
        credentials.email,
        SERVICE_NAME_123
      );

      const link = await getConfirmationEmail(
        target,
        resetPasswordReact,
        credentials.email
      );

      // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
      await page.evaluate(() => window.sessionStorage.clear());

      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with valid totp', async ({
      target,
      pages: {
        page,
        login,
        signinReact,
        resetPasswordReact,
        relier,
        totp,
        settings,
      },
      testAccountTracker,
    }) => {
      test.fixme(true, 'Fix required as of 2024/04/25 FXA-9513');

      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      // Goes to settings and enables totp on user's account.
      await settings.totp.addButton.click();
      await totp.fillOutTotpForms();
      await settings.signOut();

      // Makes sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();
      await relier.clickEmailFirst();

      await beginPasswordReset(
        page,
        login,
        resetPasswordReact,
        credentials.email,
        SERVICE_NAME_123
      );

      const link = await getConfirmationEmail(
        target,
        resetPasswordReact,
        credentials.email
      );

      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.fillOutNewPasswordForm(newPassword);
      credentials.password = newPassword;

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();
      await expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });
  });

  async function beginPasswordReset(
    page: Page,
    login: LoginPage,
    resetPasswordReact: ResetPasswordReactPage,
    email: string,
    serviceName: string
  ): Promise<void> {
    // TODO: FXA-9015 Update once we port signin / signup.
    // param is set, this view is still using backbone.
    await login.setEmail(email);
    await login.submit();
    await login.clickForgotPassword();

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
    await expect(resetPasswordReact.resetPasswordHeading).toContainText(
      serviceName
    );
  }

  async function getConfirmationEmail(
    target: BaseTarget,
    resetPasswordReact: ResetPasswordReactPage,
    email: string
  ) {
    await resetPasswordReact.fillOutEmailForm(email);
    const link = await target.emailClient.waitForEmail(
      email,
      EmailType.recovery,
      EmailHeader.link
    );
    return link;
  }
});
