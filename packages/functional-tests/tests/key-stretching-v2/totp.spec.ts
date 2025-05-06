/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('severity-2 #smoke', () => {
  type Version = { version: 1 | 2; query: string };
  type TestCase = { signupVersion: Version; signinVersion: Version };
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signupVersion: v1, signinVersion: v2 },
    { signupVersion: v2, signinVersion: v1 },
  ];

  for (const { signupVersion, signinVersion } of TestCases) {
    test(`signs up as v${signupVersion.version}, enable totp, signs in as v${signinVersion.version}`, async ({
      page,
      target,
      pages: {
        settings,
        signup,
        signin,
        signinTotpCode,
        totp,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();

      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signupVersion.query}`
      );
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const signupCode = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(signupCode);

      await expect(page).toHaveURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();

      await settings.totp.addButton.click();
      const totpCredentials = await totp.fillOutTotpForms();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signinVersion.query}`
      );
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_totp_code/);

      const totpCode = await getCode(totpCredentials.secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      // Make sure upgrade occurred
      if (signinVersion.version === 2) {
        const client = target.createAuthClient(2);
        const status = await client.getCredentialStatusV2(email);
        expect(status.currentVersion).toEqual('v2');
      }

      await settings.disconnectTotp(); // Required before teardown
    });
  }
});
