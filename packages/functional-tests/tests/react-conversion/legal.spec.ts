/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('legal', () => {
    test('users can navigate between legal and privacy notice', async ({
      pages: { legal, privacy },
    }) => {
      await legal.goto();

      await expect(legal.pageHeader).toBeVisible();
      await expect(legal.privacyNoticeLink).toBeVisible();

      await legal.clickPrivacyNoticeLink();

      await expect(privacy.pageHeader).toBeVisible();

      await privacy.clickBackButton();

      await expect(legal.pageHeader).toBeVisible();
    });

    test('users can navigate between legal and terms of service', async ({
      pages: { legal, termsOfService },
    }) => {
      await legal.goto();

      await expect(legal.pageHeader).toBeVisible();
      await expect(legal.termsOfServiceLink).toBeVisible();

      await legal.clickTermsOfServiceLink();

      await expect(termsOfService.pageHeader).toBeVisible();

      await termsOfService.clickBackButton();

      await expect(legal.pageHeader).toBeVisible();
    });
  });
});
