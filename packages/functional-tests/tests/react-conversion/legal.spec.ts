/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const MOZILLA_ACCOUNTS_TOS_URL =
  'https://www.mozilla.org/about/legal/terms/services/';
const MOZILLA_ACCOUNTS_PRIVACY_URL =
  'https://www.mozilla.org/privacy/mozilla-accounts/';

test.describe('severity-2 #smoke', () => {
  test.describe('legal', () => {
    test('terms of service link points to mozilla.org and opens in a new tab', async ({
      pages: { legal },
    }) => {
      await legal.goto();

      await expect(legal.pageHeader).toBeVisible();
      await expect(legal.termsOfServiceLink).toHaveAttribute(
        'href',
        MOZILLA_ACCOUNTS_TOS_URL
      );
      await expect(legal.termsOfServiceLink).toHaveAttribute(
        'target',
        '_blank'
      );
    });

    test('privacy notice link points to mozilla.org and opens in a new tab', async ({
      pages: { legal },
    }) => {
      await legal.goto();

      await expect(legal.pageHeader).toBeVisible();
      await expect(legal.privacyNoticeLink).toHaveAttribute(
        'href',
        MOZILLA_ACCOUNTS_PRIVACY_URL
      );
      await expect(legal.privacyNoticeLink).toHaveAttribute('target', '_blank');
    });

    test('the hosted terms of service page is still reachable directly', async ({
      pages: { termsOfService },
    }) => {
      await termsOfService.goto();

      await expect(termsOfService.pageHeader).toBeVisible();
    });

    test('the hosted privacy notice page is still reachable directly', async ({
      pages: { privacy },
    }) => {
      await privacy.goto();

      await expect(privacy.pageHeader).toBeVisible();
    });
  });
});
