/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('error views', () => {
  test('404 view links back to signin', async ({
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

  test('app error view renders for an invalid query parameter', async ({
    target,
    page,
    pages: { signin },
  }) => {
    // A malformed redirect_to fails query-parameter validation, which the app
    // surfaces through the redesigned AppErrorDialog instead of the signin form.
    const response = await page.goto(
      `${target.contentServerUrl}/?redirect_to=javascript:alert(1)`
    );

    // The WAF may block the request (Fastly returns 406) before it reaches the
    // app; that already prevents the bad parameter, so there is no view to check.
    if (response && response.status() === 406) {
      return;
    }

    await expect(signin.badRequestHeading).toBeVisible();
    await expect(signin.emailFirstHeading).toBeHidden();
  });
});
