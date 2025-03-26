/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('redirect_to', () => {
    test(`ignore invalid redirect_to parameter`, async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}/?redirect_to=https://evil.com/`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/settings/);
    });

    test(`ignore xss redirect_to parameter`, async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}/?redirect_to=javascript:alert(1)`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/settings/);
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
