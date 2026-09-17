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
      // The local stack points the button at the mock IdP; mockIdp.spec.ts
      // covers that path end to end.
      test.skip(target.name === 'local', 'covered by mockIdp.spec.ts');
      await page.goto(target.contentServerUrl);
      await signin.continueWithGoogleButton.click();
      await expect(page).toHaveURL(/accounts\.google\.com/);
    });

    test('Continue with `Apple` opens Apple login', async ({
      target,
      pages: { page, signin },
    }) => {
      test.skip(target.name === 'local', 'covered by mockIdp.spec.ts');
      await page.goto(target.contentServerUrl);
      await signin.continueWithAppleButton.click();
      await expect(page).toHaveURL(/appleid\.apple\.com/);
    });
  });
});
