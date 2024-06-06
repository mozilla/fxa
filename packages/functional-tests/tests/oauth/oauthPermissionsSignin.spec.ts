/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth permissions for trusted reliers - sign in', () => {
    test.beforeEach(async ({ pages: { signin } }) => {
      await signin.clearCache();
    });

    test('signin without `prompt=consent`', async ({
      pages: { signin, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('signin with `prompt=consent`', async ({
      target,
      page,
      pages: { configPage, signin, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes === true,
        'permissions page is not supported in React, see FXA-8827'
      );
      const credentials = await testAccountTracker.signUp();
      const query = { prompt: 'consent' };
      const queryParam = new URLSearchParams(query);

      await page.goto(`${target.relierUrl}/?${queryParam.toString()}`);
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify permissions header
      await expect(signin.permissionsHeading).toBeVisible();
      await signin.permissionsAcceptButton.click();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('signin without `prompt=consent`, then re-signin with `prompt=consent`', async ({
      target,
      page,
      pages: { configPage, signin, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes === true,
        'permissions page is not supported in React, see FXA-8827'
      );
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      const query = { prompt: 'consent' };
      const queryParam = new URLSearchParams(query);
      await page.goto(`${target.relierUrl}/?${queryParam.toString()}`);
      await relier.clickEmailFirst();
      await expect(signin.cachedSigninHeading).toBeVisible();
      await signin.signInButton.click();

      //Verify permissions header
      await expect(signin.permissionsHeading).toBeVisible();
      await signin.permissionsAcceptButton.click();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('force_auth without `prompt=consent`', async ({
      pages: { signin, relier },
      testAccountTracker,
    }) => {
      test.skip(true, 'FXA-9519, will be fixed in FXA-9855');
      const credentials = await testAccountTracker.signUp();

      await relier.goto(`email=${credentials.email}`);
      await relier.clickForceAuth();
      await expect(signin.passwordFormHeading).toBeVisible();
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('force_auth with `prompt=consent`', async ({
      target,
      page,
      pages: { configPage, signin, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(true, 'FXA-9519, will be fixed in FXA-9855');
      test.skip(
        config.showReactApp.signInRoutes === true,
        'permissions page is not supported in React, see FXA-8827'
      );
      const credentials = await testAccountTracker.signUp();

      const query = new URLSearchParams({
        prompt: 'consent',
        email: credentials.email,
      });
      await page.goto(`${target.relierUrl}/?${query.toString()}`);
      await relier.clickForceAuth();
      await signin.fillOutPasswordForm(credentials.password);

      //Verify permissions header
      await expect(signin.permissionsHeading).toBeVisible();
      await signin.permissionsAcceptButton.click();

      //Verify logged in to relier
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
