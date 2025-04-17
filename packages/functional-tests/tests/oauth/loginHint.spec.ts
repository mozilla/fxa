/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth `login_hint` and `email` param', () => {
    test('email specified by relier, invalid', async ({
      pages: { page, relier },
    }) => {
      const invalidEmail = 'invalid@';

      await relier.goto(`email=${invalidEmail}`);
      await relier.clickEmailFirst();

      await expect(page.getByText('Valid email required')).toBeVisible();
    });

    test('login_hint specified by relier, not registered', async ({
      page,
      pages: { signup, relier },
      target,
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generateAccountDetails();

      await relier.goto(
        `login_hint=${email}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );
      await relier.clickEmailFirst();

      await page.waitForURL(`${target.contentServerUrl}/oauth/signup**`);

      await expect(signup.signupFormHeading).toBeVisible();
      // email provided as login hint is displayed on the signup page
      await expect(page.getByText(email)).toBeVisible();

      await signup.changeEmailLink.click();

      // Email first page has email input prefilled
      await expect(signup.emailFormHeading).toBeVisible();
      await expect(signup.emailTextbox).toHaveValue(email);
    });

    ['email', 'login_hint'].forEach((query_parameter) => {
      test(`${query_parameter} specified by relier, registered`, async ({
        pages: { page, signin, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        await relier.goto(`${query_parameter}=${credentials.email}`);
        await relier.clickEmailFirst();

        // Email is prefilled
        await expect(signin.passwordFormHeading).toBeVisible();
        await expect(page.getByText(credentials.email)).toBeVisible();

        await signin.useDifferentAccountLink.click();

        // Email first page has email input prefilled
        await expect(signin.emailTextbox).toHaveValue(credentials.email);
      });
    });
  });
});
