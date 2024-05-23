/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(({}, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
  });

  test.describe('OAuth signin blocked', () => {
    test('verified, blocked', async ({
      page,
      pages: { login, relier, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);
      await login.unblock(credentials.email);

      expect(await relier.isLoggedIn()).toBe(true);

      // Delete blocked account, required before teardown
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('verified, blocked, incorrect password', async ({
      page,
      pages: { login, relier, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, 'wrong password');
      await login.unblock(credentials.email);
      // After filling in the unblock code, the user is prompted again to enter password
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await login.setPassword(credentials.password);
      await login.submit();
      await login.unblock(credentials.email);
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
