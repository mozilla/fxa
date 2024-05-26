/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
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
        config.featureFlags.resetPasswordWithCode === true,
        'TODO in FXA-9728 - remove this file'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutFirstSignUp(email, password, AGE_21);

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
      const link =
        (await target.emailClient.waitForEmail(
          email,
          EmailType.recovery,
          EmailHeader.link
        )) + `&${reset.version}`;
      target.emailClient.clear(email);
      await page.goto(link);
      await resetPasswordReact.fillOutNewPasswordForm(password);

      await expect(page).toHaveURL(/reset_password_verified/);

      await settings.goto();
      await settings.signOut();
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
