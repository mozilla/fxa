/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('404', () => {
  test('visit an invalid page', async ({
    page,
    pages: { signin, fourOhFour },
  }) => {
    await fourOhFour.goto('load');
    await expect(fourOhFour.header).toBeVisible();
    await expect(fourOhFour.homeLink).toBeVisible();
    await fourOhFour.homeLink.click();
    await page.waitForLoadState();
    await expect(signin.emailFirstHeading).toBeVisible();
  });
});
