/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SigninPage } from '../../pages/signin';

/**
 * These tests represent various permutations between interacting with V1 and V2
 * key stretched passwords. We need to ensure that operations are interchangeable!
 */
test.describe('severity-2 #smoke', () => {
  type Version = { version: 1 | 2; query: string };
  type TestCase = { signinVersion: Version };
  const v2: Version = { version: 2, query: 'stretch=2' };
  const TestCases: TestCase[] = [{ signinVersion: v2 }];

  for (const { signinVersion } of TestCases) {
    test(`signs up as v2, sign in within token code, signs  as v${signinVersion.version}`, async ({
      page,
      target,
      pages: {
        settings,
        signin,
        connectAnotherDevice,
        deleteAccount,
        signinTokenCode,
      },
      testAccountTracker,
    }, {}) => {
      const { email, password } = await testAccountTracker.signUpSync();
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&${signinVersion.query}`
      );
      await signin.fillOutEmailFirstForm(email);
      await signin.fillOutPasswordForm(password);

      await expect(page).toHaveURL(/signin_token_code/);
      await expect(signinTokenCode.heading).toBeVisible();
      const code = await target.emailClient.getVerifyLoginCode(email);
      await signinTokenCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/pair/);
      await connectAnotherDevice.clickNotNowPair();

      await expect(page).toHaveURL(/settings/);

      // Make sure upgrade occurred
      if (signinVersion.version === 2) {
        const client = target.createAuthClient(2);
        const status = await client.getCredentialStatusV2(email);
        expect(status.currentVersion).toEqual(`v2`);
      }

      await removeAccount(
        target,
        page,
        settings,
        signin,
        deleteAccount,
        password
      );
    });
  }
});

async function removeAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  deleteAccount: DeleteAccountPage,
  password: string
) {
  await settings.goto();
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(signin.emailFirstHeading).toBeVisible();
  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
