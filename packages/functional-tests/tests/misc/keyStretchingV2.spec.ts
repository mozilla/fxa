/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { RecoveryKeyPage } from '../../pages/settings/recoveryKey';
import { SignupReactPage } from '../../pages/signupReact';
import { TotpPage } from '../../pages/settings/totp';
import { getCode } from 'fxa-settings/src/lib/totp';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { ConfigPage } from '../../pages/config';

// Disable this check for these tests. We are holding assertion in shared functions due
// to how test permutations work, and these setup falsely trips this rule.
/* eslint-disable playwright/expect-expect */
const AGE_21 = '21';

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('key-stretching-v2', () => {
  /**
   * For full coverage, we have to run many flows on both react, and backbone version.
   * There are differences between how react and backbone use authClient and gql-api
   * for these types of operations.
   */
  ['react', 'backbone'].forEach((mode) => {
    /**
     * Complete set of types used by tests and helper functions.
     */
    type Opts = {
      page: Page;
      target: BaseTarget;
      signupReact: SignupReactPage;
      login: LoginPage;
      settings: SettingsPage;
      resetPassword: ResetPasswordPage;
      resetPasswordReact: ResetPasswordReactPage;
      changePassword: ChangePasswordPage;
      recoveryKey: RecoveryKeyPage;
      totp: TotpPage;
      deleteAccount: DeleteAccountPage;
      configPage: ConfigPage;
    };

    // Helpers
    async function _signUp(
      version: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signupReact' | 'login' | 'settings'
      >,
      signOut: boolean,
      email: string,
      password: string
    ) {
      const { page, target, signupReact, settings } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';

      if (mode === 'react' || mode === 'backbone') {
        // singup is at 100% now
        await page.goto(
          `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${stretch}`
        );

        await signupReact.fillOutEmailForm(email);
        await page.waitForSelector('#root');
        await signupReact.fillOutSignupForm(password, AGE_21);
        await signupReact.fillOutCodeForm(email);
        await page.waitForURL(/settings/);
      }

      if (signOut) {
        await settings.signOut();
      }
    }

    async function _login(
      version: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signupReact' | 'login' | 'settings'
      >,
      signOut: boolean,
      email: string,
      password: string,
      totpCredentials?: { secret: string; recoveryCodes: string[] },
      unblock = false
    ) {
      const { page, target, signupReact, login, settings } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';
      if (mode === 'react') {
        await page.goto(
          `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${stretch}`
        );
        await signupReact.fillOutEmailForm(email);
        await page.fill('[name="password"]', password);
        await page.click('[type="submit"]');

        if (unblock) {
          await page.waitForURL(/signin_unblock/);
          const unblockCode = await target.emailClient.waitForEmail(
            email,
            EmailType.unblockCode,
            EmailHeader.unblockCode
          );
          await page.fill('[name="code"]', unblockCode);
          await page.click('[type="submit"]');
        }

        if (totpCredentials) {
          await page.waitForURL(/signin_totp_code/);
          const code = await getCode(totpCredentials.secret);
          await page.fill('[name="code"]', code);
          await page.click('[type="submit"]');
        }
      } else {
        await page.goto(`${target.contentServerUrl}?${stretch}`);
        await login.setEmail(email);
        await login.clickSubmit();
        await login.setPassword(password);
        await login.clickSubmit();

        if (unblock) {
          await page.waitForURL(/signin_unblock/);
          const unblockCode = await target.emailClient.waitForEmail(
            email,
            EmailType.unblockCode,
            EmailHeader.unblockCode
          );
          await page.fill('[id="unblock_code"]', unblockCode);
          await page.click('[type="submit"]');
        }

        if (totpCredentials) {
          await page.waitForURL(/signin_totp_code/);
          const code = await getCode(totpCredentials.secret);
          await page.fill('[type="number"]', code);
          await page.click('[type="submit"]');
        }
      }

      await page.waitForURL(/settings/);
      expect(await login.isUserLoggedIn()).toBe(true);

      if (signOut) {
        await settings.signOut();
      }
    }

    async function _enabledTotp(opts: Pick<Opts, 'settings' | 'totp'>) {
      const { settings, totp } = opts;

      await expect(settings.settingsHeading).toBeVisible();
      await settings.totp.addButton.click();
      const totpCredentials = await totp.fillOutTotpForms();
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();

      return totpCredentials;
    }

    async function testTotpLogin(
      p1: 1 | 2,
      p2: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signupReact' | 'settings' | 'login' | 'totp'
      >,
      email: string,
      password: string
    ) {
      await _signUp(p1, opts, false, email, password);
      const totpCredentials = await _enabledTotp(opts);
      await _login(p2, opts, false, email, password, totpCredentials);

      // Remove 2fa to allow test cleanup
      await opts.settings.totp.disableButton.click();
      await opts.settings.clickModalConfirm();
    }

    async function testUnblockLogin(
      p1: 1 | 2,
      p2: 1 | 2,
      opts: Pick<
        Opts,
        | 'page'
        | 'target'
        | 'signupReact'
        | 'settings'
        | 'login'
        | 'deleteAccount'
      >,
      email: string,
      password: string
    ) {
      await _signUp(p1, opts, true, email, password);
      await _login(p2, opts, false, email, password, undefined, true);

      // Delete account, required before teardown
      await opts.settings.goto();
      await opts.settings.deleteAccountButton.click();
      await opts.deleteAccount.deleteAccount(password);
      await expect(opts.page).toHaveURL(
        `${opts.target.baseUrl}?delete_account_success=true`
      );
    }

    test(`signs up as v1, enable totp, login as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, totp },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      await testTotpLogin(
        1,
        2,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          totp,
        },
        email,
        password
      );
    });

    test(`signs up as v2, enable totp, login as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, totp },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      await testTotpLogin(
        2,
        1,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          totp,
        },
        email,
        password
      );
    });

    test(`signs up as v1, rate limited, unblocked, login as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, deleteAccount },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
      await testUnblockLogin(
        1,
        1,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          deleteAccount,
        },
        email,
        password
      );
    });

    test(`signs up as v1, rate limited, unblocked, login as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, deleteAccount },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
      await testUnblockLogin(
        1,
        2,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          deleteAccount,
        },
        email,
        password
      );
    });

    test(`signs up as v2, rate limited, unblocked, login as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, deleteAccount },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
      await testUnblockLogin(
        2,
        1,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          deleteAccount,
        },
        email,
        password
      );
    });

    test(`signs up as v2, rate limited, unblocked, login as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, signupReact, login, deleteAccount },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
      await testUnblockLogin(
        2,
        2,
        {
          page,
          target,
          login,
          signupReact,
          settings,
          deleteAccount,
        },
        email,
        password
      );
    });
  });
});
