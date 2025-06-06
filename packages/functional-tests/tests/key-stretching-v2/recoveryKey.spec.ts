/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

const HINT = 'secret key location';

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('severity-2 #smoke', () => {
  // Helpers
  async function _getKeys(
    version: 1 | 2,
    target: BaseTarget,
    email: string,
    password: string
  ) {
    const client = target.createAuthClient(version);
    const response = await client.signIn(email, password, {
      keys: true,
      skipPasswordUpgrade: true,
    });
    expect(response.keyFetchToken).toBeDefined();
    expect(response.unwrapBKey).toBeDefined();

    const keys = await client.accountKeys(
      response.keyFetchToken as string,
      response.unwrapBKey as string
    );
    return keys;
  }

  type Version = { version: 1 | 2; query: string };
  type TestCase = {
    signupVersion: Version;
    resetVersion: Version;
    signinVersion: Version;
  };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signupVersion: v2, resetVersion: v2, signinVersion: v2 },
  ];

  for (const { signupVersion, resetVersion, signinVersion } of TestCases) {
    test(`signs up as v${signupVersion.version} resets password with recovery key as v${resetVersion.version} and signs in as v${signinVersion.version}`, async ({
      page,
      target,
      pages: {
        signin,
        signup,
        settings,
        recoveryKey,
        resetPassword,
        confirmSignupCode,
        deleteAccount,
      },
      testAccountTracker,
    }) => {
      test.skip(
        signupVersion.version === 1,
        "Skipping v1 signup tests as v1 signup isn't supported. \
        These tests will be removed as part of https://mozilla-hub.atlassian.net/browse/FXA-11426"
      );

      const accountDetails = {
        email: testAccountTracker.generateEmail(),
        password: testAccountTracker.generatePassword(),
      };
      const newPassword = testAccountTracker.generatePassword();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signupVersion.query}`
      );
      await page.waitForURL(/\//);
      await signup.fillOutEmailForm(accountDetails.email);
      await signup.fillOutSignupForm(accountDetails.password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(
        accountDetails.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      await page.waitForURL(/settings/);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      const keys = await _getKeys(
        signupVersion.version,
        target,
        accountDetails.email,
        accountDetails.password
      );
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${resetVersion.query}`
      );
      await page.waitForURL(/\//);
      await signin.fillOutEmailFirstForm(accountDetails.email);
      await signin.fillOutPasswordForm(accountDetails.password);
      await page.waitForURL(/settings/);
      await expect(page).toHaveURL(/settings/);

      await settings.goto(`${resetVersion.query}`);
      await page.waitForURL(/settings/);
      await settings.recoveryKey.createButton.click();
      const key = await recoveryKey.createRecoveryKey(
        accountDetails.password,
        HINT
      );
      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/reset_password?${resetVersion.query}`
      );
      await page.waitForURL(/reset_password/);
      await resetPassword.fillOutEmailForm(accountDetails.email);
      const resetCode = await target.emailClient.getResetPasswordCode(
        accountDetails.email
      );
      await resetPassword.fillOutResetPasswordCodeForm(resetCode);
      await resetPassword.fillOutRecoveryKeyForm(key);

      await expect(page).toHaveURL(
        new RegExp(`account_recovery_reset_password.*${resetVersion.query}`)
      );

      await resetPassword.fillOutNewPasswordForm(newPassword);
      accountDetails.password = newPassword;

      await expect(page).toHaveURL(/reset_password_with_recovery_key_verified/);

      await resetPassword.continueWithoutDownloadingRecoveryKey();
      await resetPassword.recoveryKeyFinishButton.click();

      // a successful password reset means that the user is signed in
      await page.waitForURL(/settings/);
      await settings.signOut();

      // Attempt to signin
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signinVersion.query}`
      );
      await page.waitForURL(/\//);
      await signin.fillOutEmailFirstForm(accountDetails.email);
      await signin.fillOutPasswordForm(accountDetails.password);
      await page.waitForURL(/settings/);

      const keys2 = await _getKeys(
        signinVersion.version,
        target,
        accountDetails.email,
        accountDetails.password
      );
      expect(keys2.kB).toEqual(keys.kB);

      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(accountDetails.password);
    });
  }
});
