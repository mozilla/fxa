/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('cancel delete account step 1', async ({
    pages: { settings, deleteAccount },
  }) => {
    test.slow();
    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.cancelButton.click();

    await expect(settings.settingsHeading).toBeVisible();
  });

  test('cancel delete account step 2', async ({
    pages: { settings, deleteAccount },
  }) => {
    test.slow();
    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.checkAllBoxes();
    await deleteAccount.continueButton.click();

    await expect(deleteAccount.step2Heading).toBeVisible();

    await deleteAccount.cancelButton.click();

    await expect(settings.settingsHeading).toBeVisible();
  });

  test('delete account', async ({
    credentials,
    pages: { settings, deleteAccount, page },
  }) => {
    test.slow();
    await settings.goto();

    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(credentials.password);

    await expect(page.getByText('Account deleted successfully')).toBeVisible();
  });

  test('delete account incorrect password', async ({
    pages: { settings, deleteAccount, page },
  }) => {
    test.slow();
    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.checkAllBoxes();
    await deleteAccount.continueButton.click();

    await expect(deleteAccount.step2Heading).toBeVisible();

    await deleteAccount.passwordTextbox.fill('incorrect password');
    await deleteAccount.deleteButton.click();

    await expect(deleteAccount.tooltip).toHaveText('Incorrect password');
  });
});
