/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('react signin cached', () => {
    test('sign in twice, on second attempt email will be cached', async ({
      page,
      pages: { configPage, settings, signinReact },
      testAccountTracker,
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'Skip tests if React signInRoutes not enabled'
      );

      const credentials = await testAccountTracker.signUp();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await signinReact.clearSessionStorage();

      // Return to sign in without signing out
      await signinReact.goto();

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      // email is prefilled and password is not required to sign in
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.signInButton.click();

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();
    });
  });
});
