/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { test } from '../../lib/fixtures/standard';
import { monitorDesktopOAuthQueryParamsNoScope } from '../../lib/query-params';
import { MONITOR_SCOPE, PROFILE_SCOPE } from '../../lib/scopes';

test.describe('monitor integration', () => {
  test('signin with Monitor desktop', async ({
    syncOAuthBrowserPages: { page, signin },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUp();

    await signin.goto('/authorization', monitorDesktopOAuthQueryParamsNoScope);
    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessageScope(
      FirefoxCommand.OAuthLogin,
      `${MONITOR_SCOPE} ${PROFILE_SCOPE}`
    );
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      monitor: {},
    });
  });
});
