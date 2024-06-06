/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('react signin', () => {
    test('sign in as an existing user', async ({
      page,
      pages: { configPage, settings, signin },
      testAccountTracker,
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();

      await expect(signin.emailFirstHeading).toBeVisible();
    });

    test('sign in as an existing user with incorrect email case', async ({
      page,
      pages: { configPage, settings, signin },
      testAccountTracker,
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      // Note, we should automatically handle emails that are incorrectly cased
      await signin.fillOutEmailFirstForm(credentials.email.toUpperCase());
      await signin.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();

      await expect(signin.emailFirstHeading).toBeVisible();
    });
  });
});
