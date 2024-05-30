/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { LoginPage } from '../../pages/login';

const SERVICE_NAME_123 = '123';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password scoped keys react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9612'
      );
    });

    test('reset password scoped keys', async ({
      target,
      page,
      pages: { login, relier, resetPasswordReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const newPassword = testAccountTracker.generatePassword();

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto();

      await relier.clickSignInScopedKeys();

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
