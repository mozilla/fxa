/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { syncMobileOAuthQueryParams } from '../../lib/query-params';
import { LoginPage } from '../../pages/login';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { BaseTarget } from '../../lib/targets/base';
import { Page } from '@playwright/test';

const SERVICE_NAME_123 = '123';
const SERVICE_NAME_FIREFOX = 'Firefox';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      test.slow();

      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
    });

    test('reset password', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPasswordReact },
    }) => {
      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto('showReactApp=true');

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
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password through Sync mobile', async ({
      target,
      page,
      credentials,
      pages: { login, resetPasswordReact },
    }) => {
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

      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_FIREFOX}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password different tab', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPasswordReact },
    }) => {
      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto('showReactApp=true');

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

      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password scoped keys', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPasswordReact },
    }) => {
      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto('showReactApp=true');

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

      await page.goto(link, { waitUntil: 'load' });
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with PKCE different tab', async ({
      target,
      page,
      credentials,
      pages: { login, resetPasswordReact },
    }) => {
      test.fixme(true, 'Fix required as of 2023/07/18 (see FXA-8006).');
      // the PKCE button is broken at the moment, so for now navigate directly to the link.
      // PKCE button doesn't appear to work at the moment locally. Some sort of cors error
      // keeps getting in the way. Just go to link directly for now.
      await page.goto(
        'http://localhost:3030/authorization?showReactApp=true&access_type=offline&client_id=dcdb5ae7add825d2&pkce_client_id=38a6b9b3a65a1871&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth&scope=profile%20openid&action=signin&state=12eeaba43cc7548bf1f6b478b9de95328855b46df1e754fe94b21036c41c9cba',
        {
          waitUntil: 'load',
        }
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
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with account recovery key', async ({
      target,
      credentials,
      page,
      pages: { login, resetPasswordReact, relier, settings, recoveryKey },
    }) => {
      // Goes to settings and enables the account recovery key on user's account.
      await settings.goto();
      await settings.accountRecoveryKeyCreateButton.click();
      const accountRecoveryKey = await recoveryKey.fillOutRecoveryKeyForms(
        credentials.password,
        'hint'
      );

      // Make sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto('showReactApp=true');

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
      await login.setRecoveryKey(accountRecoveryKey);
      await login.submit();
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_with_recovery_key_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
        page.getByText(new RegExp(`.*${SERVICE_NAME_123}.*`, 'i'))
      ).toBeVisible();
    });

    test('reset password with valid totp', async ({
      target,
      credentials,
      page,
      pages: { login, resetPasswordReact, relier, totp, settings },
    }) => {
      // Goes to settings and enables totp on user's account.
      await settings.goto();
      await settings.addTwoStepAuthenticationButton.click();
      const { secret } = await totp.fillOutTwoStepAuthenticationForm();
      credentials.secret = secret;

      // Makes sure user is not signed in, and goes to the relier (ie 123done)
      await relier.goto('showReactApp=true');
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
      await resetPasswordReact.fillOutNewPasswordForm(credentials.password);

      // Note: We used to redirect the user back to the relier in some cases
      // but we've decided to just show the success message for now
      // and let the user re-authenticate with the relier.
      await page.waitForURL(/reset_password_verified/);
      expect(resetPasswordReact.passwordResetConfirmationHeading).toBeVisible();
      expect(
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

    // TODO: FXA-9015 Once the full flow is implemented in react, we can remove this. For now, we must 'refresh'
    // the page so that the 'showReactApp' param takes effect. Once conversion is complete this can be removed
    await page.reload();

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
    let link = await target.email.waitForEmail(
      email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;
    return link;
  }
});
