/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — tri-state flag off-switch E2E.
 *
 * The flag is tri-state: ?authStateMachine=true forces the machine on,
 * ?authStateMachine=false forces it off (overriding config), absent → config.
 * Config defaults OFF on this stack, so the meaningful E2E checks are that
 * both flag values let a plain email+password sign-in complete normally.
 */
test.describe('auth-machine: flag off-switch', () => {
  test('flag=false: plain sign-in still completes to settings (machine disabled)', async ({
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await page.goto(`${target.contentServerUrl}?authStateMachine=false`);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await expect(settings.settingsHeading).toBeVisible();
  });

  test('flag=true: plain sign-in completes to settings (machine enabled)', async ({
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
