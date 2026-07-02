/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

/** Auth state machine — sign-in E2E. */
test.describe('auth-machine: signin', () => {
  test('email + password reaches settings (machine on)', async ({
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();
  });
});
