/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('404', () => {
  test('visit an invalid page', async ({
    page,
    target,
    pages: { fourOhFour },
  }) => {
    await fourOhFour.goto('load');
    expect(await fourOhFour.header.isVisible()).toBeTruthy();
    expect(await fourOhFour.homeLink.isVisible()).toBeTruthy();
    await fourOhFour.homeLink.click();
    await page.waitForURL(target.contentServerUrl);
    await page.waitForLoadState();
    expect(
      await page.getByRole('heading', { name: /Enter your email/ }).isVisible()
    ).toBeTruthy();
  });
});
