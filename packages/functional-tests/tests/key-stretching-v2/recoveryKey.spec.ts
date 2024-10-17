/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

const AGE_21 = '21';
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
      },
      testAccountTracker,
    }) => {
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

      await settings.goto(`${resetVersion.version}`);
      await settings.recoveryKey.createButton.click();
      const key = await recoveryKey.createRecoveryKey(password, HINT);
      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/reset_password?${resetVersion.query}`
      );
      await resetPassword.fillOutEmailForm(email);
      const resetCode = await target.emailClient.getResetPasswordCode(email);
      await resetPassword.fillOutResetPasswordCodeForm(resetCode);
      await resetPassword.fillOutRecoveryKeyForm(key);

      await expect(page).toHaveURL(
        new RegExp(`account_recovery_reset_password.*${resetVersion.query}`)
      );

      await resetPassword.fillOutNewPasswordForm(password);

      await expect(page).toHaveURL(/reset_password_with_recovery_key_verified/);

      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signinVersion.query}`
      );
      // a successful password reset means that the user is signed in
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      await expect(page).toHaveURL(/settings/);
      const keys2 = await _getKeys(
        signinVersion.version,
        target,
        email,
        password
      );
      expect(keys2.kB).toEqual(keys.kB);
    });
  }

  test(`recovery key is preserved upon upgrade`, async ({
    page,
    target,
    pages: { signin, signup, settings, recoveryKey, confirmSignupCode },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&stretch=1`
    );
    await signup.fillOutEmailForm(email);
    await signup.fillOutSignupForm(password, AGE_21);
    await expect(page).toHaveURL(/confirm_signup_code/);
    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);
    await expect(settings.recoveryKey.status).toHaveText('Not Set');

    await settings.recoveryKey.createButton.click();
    await recoveryKey.createRecoveryKey(password, HINT);
    await expect(settings.recoveryKey.status).toHaveText('Enabled');
    await settings.signOut();

    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&stretch=2`
    );
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await expect(page).toHaveURL(/settings/);

    await expect(page).toHaveURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.recoveryKey.status).toHaveText('Enabled');
  });
});
