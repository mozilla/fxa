/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth `login_hint` and `email` param', () => {
    test('cached credentials, login_hint specified by relier', async ({
      pages: { page, signin, relier },
      testAccountTracker,
      target,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const loginHintCredentials = await testAccountTracker.signUp();

      // Create a cached login
      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(target.relierUrl);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // login_hint takes precedence over the signed-in user
      await relier.goto(`login_hint=${loginHintCredentials.email}`);
      await relier.clickEmailFirst();

      await page.waitForURL(/signin/);

      // Email is prefilled
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(loginHintCredentials.email)).toBeVisible();

      await signin.useDifferentAccountLink.click();

      // Email first page has email input prefilled
      await expect(signin.emailTextbox).toHaveValue(loginHintCredentials.email);
    });
  });
});
