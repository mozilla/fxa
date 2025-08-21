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

    test(`errors on xss redirect_to parameter`, async ({
      target,
      page,
      pages: { signin },
    }) => {
      const response = await page.goto(
        `${target.contentServerUrl}/?redirect_to=javascript:alert(1)`
      );

      if (response && response.status() === 406) {
        // WAF blocked request with 406 (Fastly's default error code) before it reaches app; that's sufficient for pass.
        return;
      }

      // only error message shown on screen in case of xss redirect_to
      await expect(
        page.getByRole('heading', { name: /Bad Request/ })
      ).toBeVisible();
      await expect(signin.emailFirstHeading).toBeHidden();
    });

    test('does not allow bogus redirect_to parameter', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // set a redirect url that is not the usual navigation target after signin
      const redirectTo = `https://evil.com/`;
      await page.goto(`${target.contentServerUrl}/?redirect_to=${redirectTo}`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).not.toHaveURL(redirectTo);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('allows valid redirect_to parameter', async ({
      target,
      pages: { page, changePassword, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // set a redirect url that is not the usual navigation target after signin
      const redirectTo = `${target.contentServerUrl}/settings/change_password`;
      await page.goto(`${target.contentServerUrl}/?redirect_to=${redirectTo}`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(redirectTo);
      await expect(changePassword.changePasswordHeading).toBeVisible();
    });
  });
});
