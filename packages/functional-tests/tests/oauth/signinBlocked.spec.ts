/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth signin blocked', () => {
    test('verified, blocked', async ({
      target,
      pages: { page, signin, relier, settings, deleteAccount, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_unblock/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      // Delete blocked account, required before teardown
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('verified, blocked, incorrect password', async ({
      target,
      pages: { page, signin, relier, settings, deleteAccount, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm('wrong password');
      await expect(page).toHaveURL(/signin_unblock/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);
      // After filling in the unblock code, the user is prompted again to enter password
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_unblock/);
      const secondCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(secondCode);
      await relier.isLoggedIn();
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function removeAccount(
  settings: SettingsPage,
  deleteAccount: DeleteAccountPage,
  page: Page,
  password: string
) {
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
