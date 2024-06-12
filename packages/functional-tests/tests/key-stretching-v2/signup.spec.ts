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
  async function _checkCredentialsVersion1(target: BaseTarget, email: string) {
    const client = target.createAuthClient(2);
    const status = await client.getCredentialStatusV2(email);
    expect(status.clientSalt).toBeUndefined();
    expect(status.currentVersion).toEqual('v1');
    expect(status.upgradeNeeded).toBeTruthy();
  }

  async function _checkCredentialsVersion2(target: BaseTarget, email: string) {
    const client = target.createAuthClient(2);
    const status = await client.getCredentialStatusV2(email);
    expect(status?.clientSalt).toMatch(/quickStretchV2:/);
    expect(status?.currentVersion).toEqual('v2');
    expect(status?.upgradeNeeded).toBeFalsy();
  }

  test(`signs up as v1 and signs in as v1 for backbone`, async ({
    page,
    target,
    pages: { signupReact, settings, login },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );
    await signupReact.fillOutEmailForm(email);
    await signupReact.fillOutSignupForm(password, AGE_21);
    const code = await target.emailClient.getVerifyShortCode(email);
    await signupReact.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);

    await settings.signOut();

    await _checkCredentialsVersion1(target, email);

    await page.goto(`${target.contentServerUrl}`);
    await login.setEmail(email);
    await login.clickSubmit();
    await login.setPassword(password);
    await login.clickSubmit();

    expect(await login.isUserLoggedIn()).toBe(true);

    await _checkCredentialsVersion1(target, email);
  });

  test(`signs up as v1 and signs in as v1 for react`, async ({
    page,
    target,
    pages: { signinReact, signupReact, settings },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );
    await signupReact.fillOutEmailForm(email);
    await signupReact.fillOutSignupForm(password, AGE_21);
    const code = await target.emailClient.getVerifyShortCode(email);
    await signupReact.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);

    await settings.signOut();

    await _checkCredentialsVersion1(target, email);

    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );
    await signinReact.fillOutEmailFirstForm(email);
    await signinReact.fillOutPasswordForm(password);

    await expect(page).toHaveURL(/settings/);

    await _checkCredentialsVersion1(target, email);
  });

  test(`signs up as v1 and signs in as v2 for backbone`, async ({
    page,
    target,
    pages: { signupReact, settings, login },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );
    await signupReact.fillOutEmailForm(email);
    await signupReact.fillOutSignupForm(password, AGE_21);
    const code = await target.emailClient.getVerifyShortCode(email);
    await signupReact.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);

    await settings.signOut();

    await _checkCredentialsVersion1(target, email);

    await page.goto(`${target.contentServerUrl}?stretch=2`);
    await login.setEmail(email);
    await login.clickSubmit();
    await login.setPassword(password);
    await login.clickSubmit();

    expect(await login.isUserLoggedIn()).toBe(true);

    await _checkCredentialsVersion2(target, email);
  });

  test(`signs up as v1 and signs in as v2 for react`, async ({
    page,
    target,
    pages: { signinReact, signupReact, settings },
    testAccountTracker,
  }) => {
    const { email, password } = testAccountTracker.generateAccountDetails();
    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react`
    );
    await signupReact.fillOutEmailForm(email);
    await signupReact.fillOutSignupForm(password, AGE_21);
    const code = await target.emailClient.getVerifyShortCode(email);
    await signupReact.fillOutCodeForm(code);

    await expect(page).toHaveURL(/settings/);

    await settings.signOut();

    await _checkCredentialsVersion1(target, email);

    await page.goto(
      `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&stretch=2`
    );
    await signinReact.fillOutEmailFirstForm(email);
    await signinReact.fillOutPasswordForm(password);

    await expect(page).toHaveURL(/settings/);

    await _checkCredentialsVersion2(target, email);
  });
});
