/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    test.beforeEach(
      async ({ credentials, pages: { settings, login, configPage } }) => {
        const config = await configPage.getConfig();
        // NOTE: These tests pass for React when `fullProdRollout` for React Signup is set
        // to `true`, but when we're only at 15% and the flag is "on", URLs need to have
        // the force experiment params. Since we'll be porting these over for React, for now,
        // skip these tests if the flag is on.
        test.skip(config.showReactApp.signUpRoutes === true);

        await settings.goto();
        await settings.signOut();
        await login.login(credentials.email, credentials.password);
      }
    );

    const testCases = [
      { name: 'invalid', redirectTo: 'https://evil.com/' },
      { name: 'xss', redirectTo: 'javascript:alert(1)' },
    ];
    for (const { name, redirectTo } of testCases) {
      test(`prevent ${name} redirect_to parameter`, async ({
        target,
        page,
        pages: { login },
      }) => {
        await page.goto(
          `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
        );
        await login.submitButton.click();

        await expect(page.getByText('Invalid redirect!')).toBeVisible();
        expect(page.url()).toContain(redirectTo);
      });
    }

    test('allows valid redirect_to parameter', async ({
      target,
      page,
      pages: { login },
    }) => {
      const redirectTo = `${target.contentServerUrl}/settings`;
      await page.goto(
        `${target.contentServerUrl}/confirm_signup_code?redirect_to=${redirectTo}`
      );
      await login.submitButton.click();

      await expect(page).toHaveURL(redirectTo);
    });
  });
});
