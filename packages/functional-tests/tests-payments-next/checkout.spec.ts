/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test('Unauthenticated checkout redirects to sign-in', async ({
    target,
    page,
  }) => {
    const checkoutUrl = `${target.paymentsNextUrl}/${target.paymentsTestOfferingId}/monthly/landing`;
    await page.goto(checkoutUrl);
    await expect(page).toHaveURL(new RegExp(target.contentServerUrl));
  });
});
