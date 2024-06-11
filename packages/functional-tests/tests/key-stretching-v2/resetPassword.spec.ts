/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

const AGE_21 = '21';

// This test file includes the new version of the reset password flow (reset with code)
// TODO in FXA-9728: remove this comment when code flow is fully rolled out in production

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
    const keys = client.accountKeys(
      response.keyFetchToken,
      response.unwrapBKey
    );
    return keys;
  }

  type Version = { version: 1 | 2; query: string };
  type TestCase = { signup: Version; reset: Version; signin: Version };
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signup: v1, reset: v1, signin: v1 },
    { signup: v1, reset: v1, signin: v2 },
    { signup: v1, reset: v2, signin: v1 },
    { signup: v1, reset: v2, signin: v2 },
    { signup: v2, reset: v1, signin: v1 },
    { signup: v2, reset: v1, signin: v2 },
    { signup: v2, reset: v2, signin: v1 },
    { signup: v2, reset: v2, signin: v2 },
  ];

  for (const { signup, reset, signin } of TestCases) {
    test(`signs up as v${signup.version} resets password as v${reset.version} and signs in as v${signin.version}`, async ({
      page,
      target,
      pages: {
        configPage,
        signinReact,
        signupReact,
        settings,
        resetPasswordReact,
      },
      testAccountTracker,
    }, { project }) => {
      const config = await configPage.getConfig();
      test.fixme(
        project.name !== 'local' &&
          signup.version === 1 &&
          reset.version === 2 &&
          signin.version === 2,
        'FXA-9765'
      );
      test.skip(
        config.featureFlags.resetPasswordWithCode !== true,
        'TODO in FXA-9728, remove this config check'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password, AGE_21);
      const verifyCode = await target.emailClient.getVerifyShortCode(email);
      await signupReact.fillOutCodeForm(verifyCode);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      const keys = await _getKeys(signup.version, target, email, password);
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${reset.query}`
      );
      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/reset_password?${reset.query}`
      );
      await resetPasswordReact.fillOutEmailForm(email);

      const resetCode = await target.emailClient.getResetPasswordCode(email);
      await resetPasswordReact.fillOutResetPasswordCodeForm(resetCode);

      await resetPasswordReact.fillOutNewPasswordForm(password);

      await expect(page).toHaveURL(/reset_password_verified/);

      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signin.query}`
      );
      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/settings/);
      const keys2 = await _getKeys(signin.version, target, email, password);
      expect(keys2.kB).not.toEqual(keys.kB);
    });
  }
});
