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

      await expect(login.getTooltipError()).toContainText(
        'Valid email required'
      );
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

    ['email', 'login_hint'].forEach((query_parameter) => {
      test(`${query_parameter} specified by relier, registered`, async ({
        pages: { login, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        await relier.goto(`${query_parameter}=${credentials.email}`);
        await relier.clickEmailFirst();

        // Email is prefilled
        expect(await login.getPrefilledEmail()).toEqual(credentials.email);
        expect(await login.enterPasswordHeader()).toEqual(true);

        await login.useDifferentAccountLink();

        // Email first page has email input prefilled
        expect(await login.getEmailInput()).toEqual(credentials.email);
      });
    });

    test('cached credentials, login_hint specified by relier', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const loginHintCredentials = await testAccountTracker.signUp();

      // Create a cached login
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(credentials.email, credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // login_hint takes precedence over the signed-in user
      await relier.goto(`login_hint=${loginHintCredentials.email}`);
      await relier.clickEmailFirst();

      // Email is prefilled
      expect(await login.getPrefilledEmail()).toEqual(
        loginHintCredentials.email
      );
      expect(await login.enterPasswordHeader()).toEqual(true);

      await login.useDifferentAccountLink();

      // Email first page has email input prefilled
      expect(await login.getEmailInput()).toEqual(loginHintCredentials.email);
    });
  });
});
