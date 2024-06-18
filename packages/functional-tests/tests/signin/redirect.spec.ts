/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    const testCases = [
      { name: 'invalid', redirectTo: 'https://evil.com/' },
      { name: 'xss', redirectTo: 'javascript:alert(1)' },
    ];
    test.describe('backbone', () => {
      for (const { name, redirectTo } of testCases) {
        test(`prevent ${name} redirect_to parameter`, async ({
          target,
          page,
          pages: { configPage, signin },
          testAccountTracker,
        }) => {
          const config = await configPage.getConfig();
          test.skip(
            config.showReactApp.signInRoutes === true,
            'React does not display an error message when a redirect is invalid, it just ignores the redirect_to param and navigates to /settings'
          );
          const credentials = await testAccountTracker.signUp();

          await page.goto(
            `${target.contentServerUrl}/?redirect_to=${redirectTo}`
          );
          await signin.fillOutEmailFirstForm(credentials.email);
          await signin.fillOutPasswordForm(credentials.password);

          await expect(page.getByText('Invalid redirect!')).toBeVisible();
          expect(page.url()).toContain(redirectTo);
        });
      }
    });

    test.describe('react', () => {
      for (const { name, redirectTo } of testCases) {
        test(`ignore ${name} redirect_to parameter`, async ({
          target,
          page,
          pages: { configPage, signin },
          testAccountTracker,
        }) => {
          const config = await configPage.getConfig();
          test.skip(
            config.showReactApp.signInRoutes !== true,
            'React does not display an error message when a redirect is invalid, it just ignores the redirect_to param and navigates to /settings'
          );
          const credentials = await testAccountTracker.signUp();

          await page.goto(
            `${target.contentServerUrl}/?redirect_to=${redirectTo}`
          );
          await signin.fillOutEmailFirstForm(credentials.email);
          await signin.fillOutPasswordForm(credentials.password);

          await expect(page).toHaveURL(/settings/);
        });
      }
    });

    test('allows valid redirect_to parameter', async ({
      target,
      pages: { page, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // set a redirect url that is not the usual navigation target after signin
      const redirectTo = `${target.contentServerUrl}/settings/change_password`;
      await page.goto(`${target.contentServerUrl}/?redirect_to=${redirectTo}`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(redirectTo);
    });
  });
});
