/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';

const AGE_21 = '21';

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
  type TestCase = { signup: Version; change: Version };
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signup: v1, change: v1 },
    { signup: v1, change: v2 },
    { signup: v2, change: v1 },
    { signup: v2, change: v2 },
  ];

  for (const { signup, change } of TestCases) {
    test(`signs up as v${signup.version} changes password from settings as v${change.version} for backbone`, async ({
      page,
      target,
      pages: { settings, changePassword, signupReact, login },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      const newPassword = testAccountTracker.generatePassword();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutFirstSignUp(email, password, AGE_21);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      await page.goto(`${target.contentServerUrl}?${signup.query}`);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.clickSubmit();

      expect(await login.isUserLoggedIn()).toBe(true);

      const keys = await _getKeys(signup.version, target, email, password);
      await settings.goto(change.query);
      await settings.clickChangePassword();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.currentPasswordTextbox.fill(password);
      await changePassword.newPasswordTextbox.fill(newPassword);
      await changePassword.confirmPasswordTextbox.fill(newPassword);
      const keys2 = await _getKeys(signup.version, target, email, password);

      expect(keys2.kB).toEqual(keys.kB);
    });
  }

  for (const { signup, change } of TestCases) {
    test(`signs up as v${signup.version} changes password from settings as v${change.version} for react`, async ({
      page,
      target,
      pages: { settings, changePassword, signinReact, signupReact },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      const newPassword = testAccountTracker.generatePassword();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutFirstSignUp(email, password, AGE_21);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?showReactApp=true&forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/settings/);

      const keys = await _getKeys(signup.version, target, email, password);
      await settings.goto(change.query);
      await settings.clickChangePassword();

      await expect(changePassword.changePasswordHeading).toBeVisible();

      await changePassword.currentPasswordTextbox.fill(password);
      await changePassword.newPasswordTextbox.fill(newPassword);
      await changePassword.confirmPasswordTextbox.fill(newPassword);

      const keys2 = await _getKeys(signup.version, target, email, password);
      expect(keys2.kB).toEqual(keys.kB);
    });
  }
});
