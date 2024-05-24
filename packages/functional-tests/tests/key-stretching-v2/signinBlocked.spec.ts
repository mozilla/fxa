/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
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
  type TestCase = { signup: Version; signin: Version };
  const v1: Version = { version: 1, query: '' };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [
    { signup: v1, signin: v1 },
    { signup: v1, signin: v2 },
    { signup: v2, signin: v1 },
    { signup: v2, signin: v2 },
  ];

  for (const { signup, signin } of TestCases) {
    test(`signs up as v${signup.version}, rate limited, unblocked, signs in as v${signin.version}`, async ({
      page,
      target,
      pages: {
        settings,
        signupReact,
        signinReact,
        signinUnblock,
        deleteAccount,
      },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateBlockedAccountDetails();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signup.query}`
      );
      await signupReact.fillOutFirstSignUp(email, password, AGE_21);

      await expect(page).toHaveURL(/settings/);

      await settings.signOut();
      await page.goto(
        `${target.contentServerUrl}/?forceExperiment=generalizedReactApp&forceExperimentGroup=react&${signin.query}`
      );
      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_unblock/);

      const code = await target.emailClient.waitForEmail(
        email,
        EmailType.unblockCode,
        EmailHeader.unblockCode
      );
      await signinUnblock.input.fill(code);
      await signinUnblock.submit.click();

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();

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

  await expect(page).toHaveURL(`${target.baseUrl}?delete_account_success=true`);
  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
