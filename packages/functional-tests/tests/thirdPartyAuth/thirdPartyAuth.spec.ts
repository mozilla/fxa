/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('third party auth', () => {
    test('Continue with `Google` opens Google login', async ({
      target,
      pages: { page, signin },
    }) => {
      await page.goto(target.contentServerUrl);
      await signin.continueWithGoogleButton.click();
      await expect(page).toHaveURL(/accounts\.google\.com/);
    });

    test('Continue with `Apple` opens Apple login', async ({
      target,
      pages: { page, signin },
    }) => {
      await page.goto(target.contentServerUrl, { waitUntil: 'load' });
      await signin.continueWithAppleButton.click();
      await expect(page).toHaveURL(/appleid\.apple\.com/);
    });
  });
});
