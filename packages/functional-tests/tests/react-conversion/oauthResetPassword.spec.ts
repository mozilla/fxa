/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { syncMobileOAuthQueryParams } from '../../lib/query-params';
import { LoginPage } from '../../pages/login';
import { RelierPage } from '../../pages/relier';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { Page } from '@playwright/test';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password react', () => {
    let resetPasswordReactFlag = false;

    test.beforeEach(async ({ pages: { configPage, resetPassword } }) => {
      resetPasswordReactFlag = resetPassword.react;
      resetPassword.react = true;
      test.slow();

      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
    });

    test.afterEach(async ({ pages: { resetPassword } }) => {
      resetPassword.react = resetPasswordReactFlag;
    });

    test('reset password', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword, settings },
    }) => {
      await openRelier({ pages: { settings, relier } });
      await passwordResetFlow(
        {
          target,
          page,
          credentials,
          pages: { login, relier, resetPassword },
        },
        {}
      );
    });

    test('reset password through Sync mobile', async ({
      target,
      page,
      credentials,
      pages: { login, resetPassword, settings },
    }) => {
      await page.goto(
        `${
          target.contentServerUrl
        }/authorization/?${syncMobileOAuthQueryParams.toString()}`
      );
      await passwordResetFlow(
        {
          target,
          page,
          credentials,
          pages: { login, resetPassword },
        },
        {}
      );
    });

    test('reset password different tab', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword, settings },
    }) => {
      await openRelier({ pages: { relier, settings } });
      await passwordResetFlow(
        {
          target,
          page,
          credentials,
          pages: { login, relier, resetPassword },
        },
        {
          newTab: true,
        }
      );
    });

    test('reset password scoped keys', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword, settings },
    }) => {
      await openRelier({ pages: { relier, settings } });
      await passwordResetFlow(
        {
          target,
          page,
          credentials,
          pages: { login, relier, resetPassword },
        },
        {
          action: 'scopedKeys',
        }
      );
    });

    /* Disabling this until FXA-8006 is fixed
    test('reset password with PKCE different tab', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword },
    }) => {
      await passwordResetFlow(
        {
          target,
          page,
          credentials,
          pages: { login, relier, resetPassword },
        },
        {
          action: 'pkce',
          newTab: true,
        }
      );
    });*/

    test('reset password with account recovery key', async ({
      target,
      credentials,
      page,
      pages: { login, resetPassword, relier, settings, recoveryKey },
    }) => {
      const accountRecoveryKey = await addAccountRecoveryKeyFlow({
        credentials,
        pages: { settings, recoveryKey },
      });
      await openRelier({ pages: { relier, settings } });
      await passwordResetFlow(
        {
          target,
          credentials,
          page,
          pages: { login, resetPassword, relier },
        },
        {
          action: 'emailFirst',
          accountRecoveryKey,
        }
      );
    });

    test('reset password with valid totp', async ({
      target,
      credentials,
      page,
      pages: { login, resetPassword, relier, totp, settings },
    }) => {
      await addTotpFlow({ credentials, pages: { totp, settings } });
      await openRelier({ pages: { relier, settings } });
      await passwordResetFlow(
        {
          target,
          credentials,
          page,
          pages: { login, resetPassword, relier },
        },
        {
          action: 'emailFirst',
        }
      );
    });
  });

  /**
   * Makes sure user is not signed in, and goes to the relier (ie 123done)
   */
  async function openRelier({ pages: { settings, relier } }) {
    await relier.goto('showReactApp=true');
  }

  /**
   * Goes to settings and enables totp on user's account.
   */
  async function addTotpFlow({ credentials, pages: { totp, settings } }) {
    await settings.goto();
    await settings.totp.clickAdd();
    const { secret } = await totp.fillTwoStepAuthenticationForm();
    credentials.secret = secret;
  }

  /**
   * Goes to settings and enables the account recovery key on user's account.
   */
  async function addAccountRecoveryKeyFlow({
    credentials,
    pages: { settings, recoveryKey },
  }) {
    await settings.goto();
    await settings.recoveryKey.clickCreate();
    await recoveryKey.clickStart();
    await recoveryKey.setPassword(credentials.password);
    await recoveryKey.clickCreateAccountRecoveryKey();
    const accountRecoveryKey = await recoveryKey.getKey();
    await recoveryKey.clickNext();
    await recoveryKey.clickFinish();

    return accountRecoveryKey;
  }

  /**
   * Primary function for running various permutations on reset password flows
   * @param param0
   * @param opts {
   *  action - The button to click on the relier 123done
   *  newTab - Whether or not the flow is conducted in a single tab, or if the processes is carried out
   *           in one tab, and then another after the confirmation email is received.
   *  accountRecoveryKey - If account recovery keys were enabled, then supply the key and activate that
   *                       part of the flow.
   *  totp - If 2 factor auth is enabled, then activate that part of the flow.
   * }
   */
  async function passwordResetFlow(
    {
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword },
    }: {
      target: BaseTarget;
      page: Page;
      credentials: Credentials;
      pages: {
        login: LoginPage;
        relier?: RelierPage;
        resetPassword: ResetPasswordPage;
      };
    },
    opts: {
      action?: 'emailFirst' | 'scopedKeys' | 'pkce';
      newTab?: boolean;
      accountRecoveryKey?: string;
    }
  ) {
    const { action, newTab, accountRecoveryKey } = opts;

    // Decide which flow to start from 123done
    if (relier) {
      if (action == null || action === 'emailFirst') {
        await relier.clickEmailFirst();
      } else if (action === 'scopedKeys') {
        await relier.clickSignInScopedKeys();
      } else if (action === 'pkce') {
        // TODO, the PKCE button is broken at the moment, so for now navigate directly to the link.
        // TODO: PKCE button doesn't appear to work at the moment locally. Some sort of cors error keeps getting in the way. Just go to link directly for now.
        await page.goto(
          'http://localhost:3030/authorization?showReactApp=true&access_type=offline&client_id=dcdb5ae7add825d2&pkce_client_id=38a6b9b3a65a1871&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth&scope=profile%20openid&action=signin&state=12eeaba43cc7548bf1f6b478b9de95328855b46df1e754fe94b21036c41c9cba',
          {
            waitUntil: 'load',
          }
        );
      }
    }

    // Step 1 - Begin the password reset.
    // - Go to the login page
    // - Enter current email
    // - Select the forgot password link

    // TODO: Update once we port signin / signup.
    // param is set, this view is still using backbone.
    await login.setEmail(credentials.email);
    await login.submit();
    await login.clickForgotPassword();

    // TODO: Once the full flow is implemented in react, we can remove this. For now, we must 'refresh'
    // the page so that the 'showReactApp' param takes effect. Once conversion is complete this can be removed
    await page.reload();
    await checkForReactApp({ page });

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
    const serviceName = relier ? '123' : 'Firefox';
    expect(
      await resetPassword.resetPasswordHeader(
        `Reset password to continue to ${serviceName}`
      )
    ).toBe(true);

    await resetPassword.fillOutResetPassword(credentials.email);

    // Step 2 - Get the confirmation email
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    // Make sure showReactApp is appended to link
    link = link.includes('showReactApp=true')
      ? link
      : link.includes('?')
      ? `${link}&showReactApp=true`
      : `${link}?showReactApp=true`;

    // Clearing session state simulates a 'new' tab, and changes the navigation at the end of the flow.
    if (newTab) {
      await page.evaluate(() => window.sessionStorage.clear());
    }

    // Step 3 (optional) - Reset the password!
    await page.goto(link, { waitUntil: 'load' });
    await checkForReactApp({ page });

    // This is an alternate flow for accounts with recovery keys
    if (accountRecoveryKey) {
      await login.setRecoveryKey(accountRecoveryKey);
      await login.submit();
    }
    await resetPassword.resetNewPassword(credentials.password);

    // Step 4 - Verify the end state. The user should see a nice success message in fxa.
    // Note: We used to redirect the user back to the relier in some cases
    // but we've decided to just show the success message for now
    // and let the user re-authenticate with the relier.
    await isSuccessMessageDisplayed({ page, serviceName });
  }

  /** Checks that the reset password success screen is being displayed. */
  async function isSuccessMessageDisplayed({
    page,
    serviceName,
  }: {
    page: Page;
    serviceName: string;
  }) {
    // The user should get a verification message and the originating
    // service's name should be displayed.
    await page.waitForURL(
      /(reset_password_verified|reset_password_with_recovery_key_verified)/
    );
    await page.getByText('Your password has been reset').waitFor();
    await page.getByText(new RegExp(`.*${serviceName}.*`, 'i')).waitFor();
  }

  /** Checks that the version of the app being used is the React Version. */
  async function checkForReactApp({ page }) {
    await page.waitForSelector('#root');
  }
});
