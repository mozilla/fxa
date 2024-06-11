/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getCode } from 'fxa-settings/src/lib/totp';

const AGE_21 = '21';

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('severity-2 #smoke', () => {
  type Version = { version: 1 | 2; query: string };
  type TestCase = { signup: Version; signin: Version };
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signup: v1, signin: v2 },
    { signup: v2, signin: v1 },
  ];

  for (const { signup, signin } of TestCases) {
    test(`signs up as v${signup.version}, enable totp, signs in as v${signin.version}`, async ({
      page,
      target,
      pages: { settings, signupReact, signinReact, signinTotpCode, totp },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();

      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password, AGE_21);
      const verifyCode = await target.emailClient.getVerifyShortCode(email);
      await signupReact.fillOutCodeForm(verifyCode);

      await expect(page).toHaveURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();

      await settings.totp.addButton.click();
      const totpCredentials = await totp.fillOutTotpForms();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signin.query}`
      );
      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_totp_code/);

      const code = await getCode(totpCredentials.secret);
      await signinTotpCode.input.fill(code);
      await signinTotpCode.submit.click();

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });
  }
});
