/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

// A public IP that geodb resolves to California; local requests come from 127.0.0.1
const PUBLIC_IP = '63.245.221.32';

test.describe('severity-2', () => {
  test('connected services shows the location of the current session', async ({
    target,
    pages: { page, settings, signin },
    testAccountTracker,
  }) => {
    test.skip(
      target.name !== 'local',
      'remote targets resolve the real client IP behind the load balancer'
    );
    await page.route(`${target.authServerUrl}/**`, (route) =>
      route.continue({
        headers: {
          ...route.request().headers(),
          'x-forwarded-for': PUBLIC_IP,
        },
      })
    );
    const credentials = await testAccountTracker.signUp();

    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();

    await expect(page.getByTestId('service-location').first()).toHaveText(
      /^[A-Za-z .]+, [A-Z]{2}, United States$/
    );
  });
});
