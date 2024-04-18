/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  PASSWORD,
  SIGNIN_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

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
      emails,
    }) => {
      const [email] = emails;

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
        credentials,
        pages: { login, relier },
      }) => {
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
  });

  test.describe('OAuth `login_hint` and `email` param', () => {
    test.use({
      emailOptions: [
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
      ],
    });
    test('cached credentials, login_hint specified by relier', async ({
      target,
      pages: { login, relier },
      emails,
    }) => {
      const [email, loginHintEmail] = emails;

      await target.createAccount(email, PASSWORD);
      await target.createAccount(loginHintEmail, PASSWORD);
      // Create a cached login
      await relier.goto();
      await relier.clickEmailFirst();
      await login.login(email, PASSWORD);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // login_hint takes precedence over the signed-in user
      await relier.goto(`login_hint=${loginHintEmail}`);
      await relier.clickEmailFirst();

      // Email is prefilled
      expect(await login.getPrefilledEmail()).toEqual(loginHintEmail);
      expect(await login.enterPasswordHeader()).toEqual(true);

      await login.useDifferentAccountLink();

      // Email first page has email input prefilled
      expect(await login.getEmailInput()).toEqual(loginHintEmail);
    });
  });
});
