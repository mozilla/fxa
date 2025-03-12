/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

const AGE_21 = '21';

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
    { signupVersion: v1, signinVersion: v1 },
    { signupVersion: v1, signinVersion: v2 },
    { signupVersion: v2, signinVersion: v1 },
    { signupVersion: v2, signinVersion: v2 },
  ];

  for (const { signupVersion, signinVersion } of TestCases) {
    test(`signs up as v${signupVersion.version}, rate limited, unblocked, signs in as v${signinVersion.version}`, async ({
      page,
      target,
      pages: {
        settings,
        signup,
        signin,
        signinUnblock,
        deleteAccount,
        confirmSignupCode,
      },
      testAccountTracker,
    }, { project }) => {
      test.fixme(
        project.name !== 'local' &&
          signupVersion.version === 1 &&
          signinVersion.version === 2,
        'FXA-9734'
      );
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
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
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signinVersion.query}`
      );
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_unblock/);

      const unblockCode = await target.emailClient.getUnblockCode(email);
      await signinUnblock.fillOutCodeForm(unblockCode);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();

      // Make sure upgrade occurred
      if (signinVersion.version === 2) {
        const client = target.createAuthClient(2);
        const status = await client.getCredentialStatusV2(email);
        expect(status.currentVersion).toEqual('v2');
      }

      // Delete blocked account, required before teardown
      await removeAccount(target, page, settings, deleteAccount, password);
    });
  }
});

async function removeAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  deleteAccount: DeleteAccountPage,
  password: string
) {
  await settings.goto();
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(page).toHaveURL(`${target.baseUrl}`);
  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
