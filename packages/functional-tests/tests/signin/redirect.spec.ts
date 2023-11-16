/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    test.beforeEach(async ({ credentials, pages: { settings, login } }) => {
      await settings.goto();
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
    });

    async function engageRedirect(page, target, redirectTo) {
      await page.goto(
        `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
      );
      await page.click('button[type=submit]');
    }

    test('prevent invalid redirect_to parameter', async ({
      target,
      pages: { page },
    }) => {
      const redirectTo = 'https://evil.com/';
      await engageRedirect(page, target, redirectTo);

      const error = await page.waitForSelector('.error');
      expect(await error.isVisible()).toBeTruthy();
      expect(await error.textContent()).toEqual('Invalid redirect!');
      expect(page.url).not.toEqual(redirectTo);
    });

    test('prevent xss in redirect_to parameter', async ({
      target,
      pages: { page },
    }) => {
      const redirectTo = 'javascript:alert(1)';
      await engageRedirect(page, target, redirectTo);

      const error = await page.waitForSelector('.error');
      expect(await error.isVisible()).toBeTruthy();
      expect(await error.textContent()).toEqual('Invalid redirect!');
    });

    test('allows valid redirect_to parameter', async ({
      target,
      pages: { page },
    }) => {
      const redirectTo = `${target.contentServerUrl}/settings`;
      await page.goto(
        `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
      );
      await page.click('button[type=submit]');

      await page.waitForURL(/settings\?/);

      expect(page.url().startsWith(redirectTo)).toBeTruthy();
    });
  });
});
