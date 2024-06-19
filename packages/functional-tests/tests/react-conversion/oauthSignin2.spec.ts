/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('react OAuth signin', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
    });

    test('verified account with cached login, no email confirmation required', async ({
      pages: { page, relier, signin },
      testAccountTracker,
    }, { project }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/04/26 (see FXA-9518).'
      );

      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in
      await relier.clickEmailFirst();

      // wait for navigation
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await expect(signin.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();

      await relier.isLoggedIn();
    });
  });
});
