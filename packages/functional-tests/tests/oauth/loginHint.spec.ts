/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('OAuth `login_hint` and `email` param', () => {
    test('email specified by relier, invalid', async ({
      pages: { login, relier },
    }) => {
      const invalidEmail = 'invalid@';

      await relier.goto(`email=${invalidEmail}`);
      await relier.clickEmailFirst();

      expect(await login.getTooltipError()).toContain('Valid email required');
    });

    test('login_hint specified by relier, not registered', async ({
      page,
      pages: { login, relier },
      target,
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generateAccountDetails();

      await relier.goto(`login_hint=${email}`);
      await relier.clickEmailFirst();

      await page.waitForURL(`${target.contentServerUrl}/oauth/signup**`);
      await expect(login.signUpPasswordHeader).toBeVisible();
      // email provided as login hint is displayed on the signup page
      await expect(page.getByText(email)).toBeVisible();

      await login.useChangeEmailLink();

      // Email first page has email input prefilled
      expect(await login.getEmailInput()).toEqual(email);
    });

    test('email specified by relier, registered', async ({
      pages: { page, signinReact, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto(`email=${credentials.email}`);
      await relier.clickEmailFirst();

      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await expect(signinReact.passwordFormHeading).toBeVisible();

      await signinReact.useDifferentAccountLink.click();

      // Email first page has email input prefilled
      await expect(signinReact.emailTextbox).toHaveValue(credentials.email);
    });

    test('login_hint specified by relier, registered', async ({
      pages: { configPage, page, signinReact, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signInRoutes === true,
        'FXA-9519, login_hint might not be supported in React'
      );

      const credentials = await testAccountTracker.signUp();

      await relier.goto(`login_hint=${credentials.email}`);
      await relier.clickEmailFirst();

      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await expect(signinReact.passwordFormHeading).toBeVisible();

      await signinReact.useDifferentAccountLink.click();

      // Email first page has email input prefilled
      await expect(signinReact.emailTextbox).toHaveValue(credentials.email);
    });

    test('cached credentials, login_hint specified by relier', async ({
      pages: { configPage, page, signinReact, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signInRoutes === true,
        'FXA-9519, login_hint might not be supported in React'
      );
      const credentials = await testAccountTracker.signUp();
      const loginHintCredentials = await testAccountTracker.signUp();

      // Create a cached login
      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // login_hint takes precedence over the signed-in user
      await relier.goto(`login_hint=${loginHintCredentials.email}`);
      await relier.clickEmailFirst();

      // Email is prefilled
      await expect(page.getByText(loginHintCredentials.email)).toBeVisible();
      await expect(signinReact.passwordFormHeading).toBeVisible();

      await signinReact.useDifferentAccountLink.click();

      // Email first page has email input prefilled
      await expect(signinReact.emailTextbox).toHaveValue(
        loginHintCredentials.email
      );
    });
  });
});
