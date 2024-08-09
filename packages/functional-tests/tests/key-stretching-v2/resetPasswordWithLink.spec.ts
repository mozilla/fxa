/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

const AGE_21 = '21';

// This test file is copied from resetPassword.spec.ts
// this copy includes the previous version of the reset password flow (reset with link)
// Git history is preserved in the original that we will keep moving forward
// TODO in FXA-9728: remove this file when the reset password with code flow is fully rolled out in production

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
    const response = await client.signIn(email, password, { keys: true });

    expect(response.keyFetchToken).toBeDefined();
    expect(response.unwrapBKey).toBeDefined();

    const keys = client.accountKeys(
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
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signupVersion: v1, resetVersion: v1, signinVersion: v1 },
    { signupVersion: v1, resetVersion: v1, signinVersion: v2 },
    { signupVersion: v1, resetVersion: v2, signinVersion: v1 },
    { signupVersion: v1, resetVersion: v2, signinVersion: v2 },
    { signupVersion: v2, resetVersion: v1, signinVersion: v1 },
    { signupVersion: v2, resetVersion: v1, signinVersion: v2 },
    { signupVersion: v2, resetVersion: v2, signinVersion: v1 },
    { signupVersion: v2, resetVersion: v2, signinVersion: v2 },
  ];

  for (const { signupVersion, resetVersion, signinVersion } of TestCases) {
    test(`signs up as v${signupVersion.version} resets password as v${resetVersion.version} and signs in as v${signinVersion.version}`, async ({
      page,
      target,
      pages: {
        configPage,
        signin,
        signup,
        settings,
        resetPassword,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.resetPasswordWithCode === true,
        'TODO in FXA-9728 - remove this file'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signupVersion.query}`
      );
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, AGE_21);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      const keys = await _getKeys(
        signupVersion.version,
        target,
        email,
        password
      );
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${resetVersion.query}`
      );
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/reset_password?${resetVersion.query}`
      );
      await resetPassword.fillOutEmailForm(email);
      const link =
        (await target.emailClient.getRecoveryLink(email)) +
        `&${resetVersion.version}`;
      await page.goto(link);
      await resetPassword.fillOutNewPasswordForm(password);

      await expect(page).toHaveURL(/reset_password_verified/);

      await settings.goto();
      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signinVersion.query}`
      );
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/settings/);
      const keys2 = await _getKeys(
        signinVersion.version,
        target,
        email,
        password
      );
      expect(keys2.kB).not.toEqual(keys.kB);
    });
  }
});
