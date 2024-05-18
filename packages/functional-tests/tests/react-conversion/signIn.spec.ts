/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('react signin', () => {
    test('sign in as an existing user', async ({
      page,
      pages: { configPage, settings, signinReact },
      testAccountTracker,
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      const credentials = await testAccountTracker.signUp();

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();

      await expect(signinReact.emailFirstHeading).toBeVisible();
    });

    test('sign in as an existing user with incorrect email case', async ({
      page,
      pages: { configPage, settings, signinReact },
      testAccountTracker,
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      const credentials = await testAccountTracker.signUp();

      await signinReact.goto();
      // Note, we should automatically handle emails that are incorrectly cased
      await signinReact.fillOutEmailFirstForm(credentials.email.toUpperCase());
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();

      await expect(signinReact.emailFirstHeading).toBeVisible();
    });
  });
});
