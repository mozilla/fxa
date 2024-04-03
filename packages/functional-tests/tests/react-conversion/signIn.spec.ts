/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('react signin', () => {
    test('sign in as an existing user', async ({
      credentials,
      page,
      pages: { configPage, settings, signinReact },
    }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );

      await signinReact.goto();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();

      await expect(signinReact.emailFirstHeading).toBeVisible();
    });
  });
});
