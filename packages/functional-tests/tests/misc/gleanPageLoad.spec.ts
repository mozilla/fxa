/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { GleanEventsHelper } from '../../lib/glean';

test.describe('severity-2 glean page_load', () => {
  test('records one page_load per view, with the path as url', async ({
    target,
    pages: { page, signin },
    testAccountTracker,
  }) => {
    const { email } = await testAccountTracker.signUp();
    const gleanEventsHelper = new GleanEventsHelper(page);
    await gleanEventsHelper.start();
    const pageLoadUrls = () =>
      gleanEventsHelper
        .getEventsByName('glean_page_load')
        .map((ping) => ping.extras.url);

    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(email);
    await page.waitForURL(/\/signin/);

    await expect.poll(pageLoadUrls).toContain('/signin');
    // Glean uploads pings in order, so a later event marks that every page_load arrived.
    await signin.passwordTextbox.fill('x');
    await gleanEventsHelper.waitForEvent('login_engage');
    // Dev builds run StrictMode, which records the first view twice.
    const landingCount = pageLoadUrls().filter((url) => url === '/').length;
    expect(landingCount).toBeGreaterThanOrEqual(1);
    expect(landingCount).toBeLessThanOrEqual(2);
    expect(new Set(pageLoadUrls())).toEqual(new Set(['/', '/signin']));
    expect(pageLoadUrls().filter((url) => url === '/signin')).toHaveLength(1);
  });
});
