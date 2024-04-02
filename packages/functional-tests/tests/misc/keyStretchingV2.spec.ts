/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import AuthClient from 'fxa-auth-client/browser';
import { EmailHeader, EmailType } from '../../lib/email';
import crypto from 'crypto';
import { SaltVersion } from 'fxa-auth-client/lib/salt';
import { BaseTarget } from '../../lib/targets/base';
import { Page } from '@playwright/test';
import { SignupReactPage } from '../../pages/signupReact';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { ResetPasswordPage } from '../../pages/resetPassword';
import { ResetPasswordReactPage } from '../../pages/resetPasswordReact';
import { RecoveryKeyPage } from '../../pages/settings/recoveryKey';
import { ChangePasswordPage } from '../../pages/settings/changePassword';

// Disable this check for these tests. We are holding assertion in shared functions due
// to how test permutations work, and these setup falsely trips this rule.
/* eslint-disable playwright/expect-expect */

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('key-stretching-v2', () => {
  const AGE_21 = '21';
  let email = '';
  let password = '';

  function getClient(url: string, version: SaltVersion) {
    return new AuthClient(url, {
      keyStretchVersion: version,
    });
  }

  test.beforeEach(() => {
    test.slow();
    email = `signin${crypto.randomBytes(8).toString('hex')}@restmail.net`;
    password = `${crypto.randomBytes(10).toString('hex')}`;
  });

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
    };

    // Helpers
    async function _checkCredentials(version, opts: Pick<Opts, 'target'>) {
      const { target } = opts;
      const client = getClient(target.authServerUrl, 2);
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

    async function _getKeys(version, opts: Pick<Opts, 'target'>) {
      const client = getClient(opts.target.authServerUrl, version);
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
        'page' | 'target' | 'signupReact' | 'login' | 'settings'
      >,
      signOut: boolean
    ) {
      const { page, target, signupReact, login, settings } = opts;
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
      signOut: boolean
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
        await page.waitForURL(/settings/);
      } else {
        await page.goto(`${target.contentServerUrl}?${stretch}`);
        await login.setEmail(email);
        await login.clickSubmit();
        await login.setPassword(password);
        await login.clickSubmit();
        expect(await login.isUserLoggedIn()).toBe(true);
      }

      if (signOut) {
        await settings.signOut();
      }
    }

    async function _createRecoveryKey(
      version: 1 | 2,
      opts: Pick<Opts, 'settings' | 'recoveryKey'>
    ) {
      const { settings, recoveryKey } = opts;

      await settings.goto(version === 2 ? 'stretch=2' : '');
      await settings.recoveryKey.clickCreate();
      await recoveryKey.clickStart();
      await recoveryKey.setPassword(password);
      await recoveryKey.submit();

      const key = await recoveryKey.getKey();
      await recoveryKey.clickNext();
      await recoveryKey.setHint('secret key location');
      await recoveryKey.clickFinish();

      return key;
    }

    async function _changePassword(
      version: 1 | 2,
      opts: Pick<Opts, 'settings' | 'changePassword'>
    ) {
      const { settings, changePassword } = opts;
      await settings.goto(version === 2 ? 'stretch=2' : '');
      await settings.clickChangePassword();
      await changePassword.fillOutChangePassword(password, 'new' + password);
      await changePassword.setCurrentPassword(password);
      password = 'new' + password;
      await changePassword.setNewPassword(password);
      await changePassword.setConfirmPassword(password);
      await changePassword.submit();
    }

    async function _resetPassword(
      version: 1 | 2,
      key: string | undefined,
      opts: Pick<Opts, 'page' | 'target' | 'settings' | 'resetPasswordReact'>
    ) {
      const { page, target, settings, resetPasswordReact } = opts;
      const stretch = version === 2 ? 'stretch=2' : '';

      if (mode === 'react') {
        await settings.signOut();
        await page.goto(
          `${target.contentServerUrl}/reset_password?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${stretch}`
        );
        await page.waitForSelector('#root');
        await resetPasswordReact.fillOutEmailForm(email);
        const link =
          (await target.email.waitForEmail(
            email,
            EmailType.recovery,
            EmailHeader.link
          )) + `&showReactApp=true&${stretch}`;
        await page.goto(link);
        await page.waitForSelector('#root');

        if (key) {
          await resetPasswordReact.submitRecoveryKey(key);
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
     * Checks singup & login
     */
    async function testSignUpAndLogin(
      p1: 1 | 2,
      p2: 1 | 2,
      credentials: 1 | 2,
      opts: Pick<Opts, 'page' | 'target' | 'signupReact' | 'login' | 'settings'>
    ) {
      await _signUp(p1, opts, true);
      await _checkCredentials(p1, opts);
      await _login(p2, opts, false);
      await _checkCredentials(credentials, opts);
    }
    test(`signs up as v1 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login },
    }) => {
      await testSignUpAndLogin(1, 1, 1, {
        page,
        target,
        signupReact,
        login,
        settings,
      });
    });
    test(`signs up as v1 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login },
    }) => {
      await testSignUpAndLogin(1, 2, 2, {
        page,
        target,
        signupReact,
        login,
        settings,
      });
    });
    test(`signs up as v2 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login },
    }) => {
      await testSignUpAndLogin(2, 1, 2, {
        page,
        target,
        signupReact,
        login,
        settings,
      });
    });
    test(`signs up as v2 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login },
    }) => {
      await testSignUpAndLogin(2, 2, 2, {
        settings,
        page,
        target,
        signupReact,
        login,
      });
    });

    /**
     * Checks password reset from 'forgot password' link on login
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
        | 'login'
        | 'signupReact'
        | 'resetPasswordReact'
      >
    ) {
      // We are on 100% react now for password reset. No need to test.
      if (mode === 'backbone') {
        return;
      }

      await _signUp(p1, opts, true);
      const keys = await _getKeys(p1, opts);
      await _login(p1, opts, false);

      if (useRecoveryKey) {
        await _resetPassword(p2, await _createRecoveryKey(p2, opts), opts);
      } else {
        await _resetPassword(p2, undefined, opts);
      }

      await _login(p3, opts, false);
      const keys2 = await _getKeys(p3, opts);

      if (useRecoveryKey) {
        expect(keys2.kB).toEqual(keys.kB);
      } else {
        expect(keys2.kB).not.toEqual(keys.kB);
      }
    }
    test(`signs up as v1 resets password with recovery key as v1 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 1, 1, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password with recovery key as v1 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 1, 2, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password with recovery key as v2 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 2, 1, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password with recovery key as v2 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 2, 2, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password with recovery key as v1 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 1, 1, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password with recovery key as v1 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 1, 2, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password with recovery key as v2 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 2, 1, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password with recovery key as v2 and logins as v2 ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 2, 2, true, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password without recovery key as v1 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 1, 1, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password without recovery key as v1 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 1, 2, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password without recovery key as v2 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 2, 1, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v1 resets password without recovery key as v2 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(1, 2, 2, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password without recovery key as v1 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 1, 1, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password without recovery key as v1 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 1, 2, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password without recovery key as v2 and logins as v1 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 2, 1, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
    });
    test(`signs up as v2 resets password without recovery key as v2 and logins as v2 for ${mode}`, async ({
      page,
      target,
      pages: { signupReact, settings, login, recoveryKey, resetPasswordReact },
    }) => {
      await testPasswordReset(2, 2, 2, false, {
        page,
        target,
        settings,
        recoveryKey,
        login,
        signupReact,
        resetPasswordReact,
      });
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
        | 'login'
        | 'signupReact'
      >
    ) {
      await _signUp(p1, opts, true);
      await _login(p1, opts, false);
      const keys = await _getKeys(p1, opts);
      await _changePassword(p2, opts);
      const keys2 = await _getKeys(p1, opts);
      expect(keys2.kB).toEqual(keys.kB);
    }
    test(`signs up as v1 changes password from settings as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, login },
    }) => {
      await testChangePasswordFromSettings(1, 1, {
        page,
        target,
        login,
        signupReact,
        settings,
        changePassword,
      });
    });
    test(`signs up as v1 changes password from settings as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, login },
    }) => {
      await testChangePasswordFromSettings(1, 2, {
        page,
        target,
        login,
        signupReact,
        settings,
        changePassword,
      });
    });
    test(`signs up as v2 changes password from settings as v1 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, login },
    }) => {
      await testChangePasswordFromSettings(2, 1, {
        page,
        target,
        login,
        signupReact,
        settings,
        changePassword,
      });
    });
    test(`signs up as v2 changes password from settings as v2 for ${mode}`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, login },
    }) => {
      await testChangePasswordFromSettings(2, 2, {
        page,
        target,
        login,
        signupReact,
        settings,
        changePassword,
      });
    });
  });
});
