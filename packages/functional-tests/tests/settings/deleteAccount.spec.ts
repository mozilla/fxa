/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  // https://testrail.stage.mozaws.net/index.php?/cases/view/1293493
  test('delete account and cancel delete #1293493', async ({
    credentials,
    pages: { settings, deleteAccount, page },
  }) => {
    test.slow();
    await settings.goto();
    await settings.clickDeleteAccount();
    await deleteAccount.checkAllBoxes();

    // Click cancel to cancel the deletion
    await deleteAccount.clickCancel();

    // Click Delete account again
    await settings.clickDeleteAccount();
    await deleteAccount.checkAllBoxes();
    await deleteAccount.clickContinue();

    // Enter incorrect password
    await deleteAccount.setPassword('incorrect password');
    await deleteAccount.submit();

    // Verifying that the tooltip throws error
    expect(await deleteAccount.toolTipText()).toContain('Incorrect password');

    // Enter correct password
    await deleteAccount.setPassword(credentials.password);
    await deleteAccount.submit();
    const success = await page.waitForSelector('.success');
    expect(await success.isVisible()).toBeTruthy();
  });
});
