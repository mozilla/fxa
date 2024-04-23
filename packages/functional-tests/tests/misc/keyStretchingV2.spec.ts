/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, PASSWORD } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { BaseTarget } from '../../lib/targets/base';
import { Page } from '@playwright/test';
import { SignupReactPage } from '../../pages/signupReact';
import { SettingsPage } from '../../pages/settings';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { RecoveryKeyPage } from '../../pages/settings/recoveryKey';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { SigninReactPage } from '../../pages/signinReact';

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
      signinReact: SigninReactPage;
      signupReact: SignupReactPage;
      settings: SettingsPage;
      resetPassword: ResetPasswordPage;
      resetPasswordReact: ResetPasswordReactPage;
      changePassword: ChangePasswordPage;
      recoveryKey: RecoveryKeyPage;
    };

    // Helpers
    async function _checkCredentials(
      version,
      opts: Pick<Opts, 'target'>,
      email: string
    ) {
      const { target } = opts;
      const client = target.createAuthClient(2);
      if (version === 1) {
        const status = await client.getCredentialStatusV2(email);
        expect(status.clientSalt).toBeUndefined();
        expect(status.currentVersion).toEqual('v1');
        expect(status.upgradeNeeded).toBeTruthy();
      } else if (version === 2) {
        const status = await client.getCredentialStatusV2(email);
        expect(status?.clientSalt).toMatch(/quickStretchV2:/);
        expect(status?.currentVersion).toEqual('v2');
        expect(status?.upgradeNeeded).toBeFalsy();
      }
    }

    async function _getKeys(
      version,
      opts: Pick<Opts, 'target'>,
      email: string,
      password: string
    ) {
      const client = opts.target.createAuthClient(version);
      const response = await client.signIn(email, password, { keys: true });
      const keys = client.accountKeys(
        response.keyFetchToken,
        response.unwrapBKey
      );
      return keys;
    }

    async function _signUp(
      version: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signupReact' | 'signinReact' | 'settings'
      >,
      signOut: boolean,
      email: string,
      password: string
    ) {
      const { page, target, signupReact, settings } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';

      // signup is at 100% now
      await page.goto(`${target.contentServerUrl}/?${stretch}`);

      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password, AGE_21);
      await signupReact.fillOutCodeForm(email);
      await page.waitForURL(/settings/);

      if (signOut) {
        await settings.signOut();
      }
    }

    async function _signin(
      version: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signinReact' | 'signupReact' | 'settings'
      >,
      signOut: boolean,
      email: string,
      password: string
    ) {
      const { page, target, signinReact, signupReact, settings } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';
      if (mode === 'react') {
        await page.goto(
          `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${stretch}`
        );
      } else {
        await page.goto(`${target.contentServerUrl}/?${stretch}`);
      }
      await signupReact.fillOutEmailForm(email);
      await signinReact.fillOutPasswordForm(password);
      await page.waitForURL(/settings/);

      if (signOut) {
        await settings.signOut();
      }
    }

    async function _createRecoveryKey(
      version: 1 | 2,
      opts: Pick<Opts, 'settings' | 'recoveryKey'>,
      password: string
    ) {
      const hint = 'secret key location';
      const { settings, recoveryKey } = opts;

      await settings.goto(version === 2 ? 'stretch=2' : '');
      await settings.recoveryKey.createButton.click();
      return await recoveryKey.createRecoveryKey(password, hint);
    }

    async function _changePassword(
      version: 1 | 2,
      opts: Pick<Opts, 'settings' | 'changePassword'>,
      password: string
    ) {
      const { settings, changePassword } = opts;
      const newPassword = 'new' + password; //TODO maybe fix fixture to use new password
      await settings.goto(version === 2 ? 'stretch=2' : '');
      await settings.clickChangePassword();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.currentPasswordTextbox.fill(password);
      await changePassword.newPasswordTextbox.fill(newPassword);
      await changePassword.confirmPasswordTextbox.fill(newPassword);
    }

    async function _resetPassword(
      version: 1 | 2,
      key: string | undefined,
      opts: Pick<Opts, 'page' | 'target' | 'settings' | 'resetPasswordReact'>,
      email: string,
      password: string
    ) {
      const { page, target, settings, resetPasswordReact } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';

      if (mode === 'react') {
        await settings.signOut();
        await page.goto(`${target.contentServerUrl}/reset_password?${stretch}`);
        await resetPasswordReact.fillOutEmailForm(email);
        const link =
          (await target.emailClient.waitForEmail(
            email,
            EmailType.recovery,
            EmailHeader.link
          )) + `&showReactApp=true&${stretch}`;
        await page.goto(link);

        if (key) {
          await resetPasswordReact.fillOutRecoveryKeyForm(key);
          if (stretch) {
            await page.waitForURL(/account_recovery_reset_password.*stretch=2/);
          } else {
            await page.waitForURL(/account_recovery_reset_password/);
          }
        }
        await resetPasswordReact.fillOutNewPasswordForm(password);

        if (key) {
          await page.waitForURL(/reset_password_with_recovery_key_verified/);
          await settings.goto();
        } else {
          await page.waitForURL(/reset_password_verified/);
          await settings.goto();
        }
      }
      await settings.signOut();
    }

    /**
     * Checks signup & signin
     */
    async function testSignUpAndLogin(
      p1: 1 | 2,
      p2: 1 | 2,
      credentials: 1 | 2,
      opts: Pick<
        Opts,
        'page' | 'target' | 'signupReact' | 'signinReact' | 'settings'
      >,
      email,
      password
    ) {
      await _signUp(p1, opts, true, email, password);
      await _checkCredentials(p1, opts, email);
      await _signin(p2, opts, false, email, password);
      await _checkCredentials(credentials, opts, email);
    }
    test(`signs up as v1 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testSignUpAndLogin(
        1,
        1,
        1,
        {
          page,
          target,
          signupReact,
          signinReact,
          settings,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testSignUpAndLogin(
        1,
        2,
        2,
        {
          page,
          target,
          signupReact,
          signinReact,
          settings,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testSignUpAndLogin(
        2,
        1,
        2,
        {
          page,
          target,
          signupReact,
          signinReact,
          settings,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testSignUpAndLogin(
        2,
        2,
        2,
        {
          settings,
          page,
          target,
          signupReact,
          signinReact,
        },
        email,
        PASSWORD
      );
    });

    /**
     * Checks password reset from 'forgot password' link on signin
     */
    async function testPasswordReset(
      p1: 1 | 2,
      p2: 1 | 2,
      p3: 1 | 2,
      useRecoveryKey: boolean,
      opts: Pick<
        Opts,
        | 'page'
        | 'target'
        | 'settings'
        | 'recoveryKey'
        | 'signinReact'
        | 'signupReact'
        | 'resetPasswordReact'
      >,
      email: string,
      password: string
    ) {
      // We are on 100% react now for password reset. No need to test.
      if (mode === 'backbone') {
        test.skip(true);
      }

      await _signUp(p1, opts, true, email, password);
      const keys = await _getKeys(p1, opts, email, password);
      await _signin(p1, opts, false, email, password);

      if (useRecoveryKey) {
        await _resetPassword(
          p2,
          await _createRecoveryKey(p2, opts, password),
          opts,
          email,
          password
        );
      } else {
        await _resetPassword(p2, undefined, opts, email, password);
      }

      await _signin(p3, opts, false, email, password);
      const keys2 = await _getKeys(p3, opts, email, password);

      if (useRecoveryKey) {
        expect(keys2.kB).toEqual(keys.kB);
      } else {
        expect(keys2.kB).not.toEqual(keys.kB);
      }
    }
    test(`signs up as v1 resets password with recovery key as v1 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        1,
        1,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password with recovery key as v1 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        1,
        2,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password with recovery key as v2 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        2,
        1,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password with recovery key as v2 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        2,
        2,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password with recovery key as v1 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        1,
        1,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password with recovery key as v1 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        1,
        2,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password with recovery key as v2 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        2,
        1,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password with recovery key as v2 and signs in as v2 ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        2,
        2,
        true,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password without recovery key as v1 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        1,
        1,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password without recovery key as v1 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        1,
        2,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password without recovery key as v2 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        2,
        1,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 resets password without recovery key as v2 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        1,
        2,
        2,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password without recovery key as v1 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        1,
        1,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password without recovery key as v1 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        1,
        2,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password without recovery key as v2 and signs in as v1 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        2,
        1,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 resets password without recovery key as v2 and signs in as v2 for ${mode}`, async ({
      page,
      target,
      pages: {
        signupReact,
        settings,
        signinReact,
        recoveryKey,
        resetPasswordReact,
      },
      emails,
    }) => {
      const [email] = emails;
      await testPasswordReset(
        2,
        2,
        2,
        false,
        {
          page,
          target,
          settings,
          recoveryKey,
          signinReact,
          signupReact,
          resetPasswordReact,
        },
        email,
        PASSWORD
      );
    });

    /**
     * Checks password change from settings page
     */
    async function testChangePasswordFromSettings(
      p1: 1 | 2,
      p2: 1 | 2,
      opts: Pick<
        Opts,
        | 'target'
        | 'page'
        | 'settings'
        | 'changePassword'
        | 'signinReact'
        | 'signupReact'
      >,
      email,
      password
    ) {
      await _signUp(p1, opts, true, email, password);
      await _signin(p1, opts, false, email, password);
      const keys = await _getKeys(p1, opts, email, password);
      await _changePassword(p2, opts, password);
      const keys2 = await _getKeys(p1, opts, email, password);
      expect(keys2.kB).toEqual(keys.kB);
    }
    test(`signs up as v1 changes password from settings as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testChangePasswordFromSettings(
        1,
        1,
        {
          page,
          target,
          signinReact,
          signupReact,
          settings,
          changePassword,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v1 changes password from settings as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testChangePasswordFromSettings(
        1,
        2,
        {
          page,
          target,
          signinReact,
          signupReact,
          settings,
          changePassword,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 changes password from settings as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testChangePasswordFromSettings(
        2,
        1,
        {
          page,
          target,
          signinReact,
          signupReact,
          settings,
          changePassword,
        },
        email,
        PASSWORD
      );
    });
    test(`signs up as v2 changes password from settings as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, signinReact },
      emails,
    }) => {
      const [email] = emails;
      await testChangePasswordFromSettings(
        2,
        2,
        {
          page,
          target,
          signinReact,
          signupReact,
          settings,
          changePassword,
        },
        email,
        PASSWORD
      );
    });
  });
});
