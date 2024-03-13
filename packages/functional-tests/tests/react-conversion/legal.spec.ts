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

    test('users can navigate from privacy notice to legal', async ({
      pages: { legal, privacy },
    }) => {
      test.fixme(true, 'Fix required as of 2024/03/13 (see FXA-9280).');

      await privacy.goto();

      await expect(privacy.pageHeader).toBeVisible();
      await expect(privacy.backButton).toBeVisible();

      await privacy.clickBackButton();

      await expect(legal.pageHeader).toBeVisible();
    });

    test('users can navigate from privacy notice to legal from third-party', async ({
      page,
      pages: { legal, privacy },
    }) => {
      test.fixme(true, 'Fix required as of 2024/03/13 (see FXA-9280).');

      await page.goto(`https://www.mozilla.org/en-US/`);
      await privacy.goto();

      await expect(privacy.pageHeader).toBeVisible();
      await expect(privacy.backButton).toBeVisible();

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

    test('users can navigate from terms of service to legal', async ({
      pages: { legal, termsOfService },
    }) => {
      test.fixme(true, 'Fix required as of 2024/03/13 (see FXA-9280).');

      await termsOfService.goto();

      await expect(termsOfService.pageHeader).toBeVisible();
      await expect(termsOfService.backButton).toBeVisible();

      await termsOfService.clickBackButton();

      await expect(legal.pageHeader).toBeVisible();
    });

    test('users can navigate from terms of service to legal from third-party', async ({
      page,
      pages: { legal, termsOfService },
    }) => {
      test.fixme(true, 'Fix required as of 2024/03/13 (see FXA-9280).');

      await page.goto(`https://www.mozilla.org/en-US/`);
      await termsOfService.goto();

      await expect(termsOfService.pageHeader).toBeVisible();
      await expect(termsOfService.backButton).toBeVisible();

      await termsOfService.clickBackButton();

      await expect(legal.pageHeader).toBeVisible();
    });
  });
});
