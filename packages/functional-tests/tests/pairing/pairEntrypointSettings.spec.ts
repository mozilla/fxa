/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Settings "Connect a device" pairing entrypoint (FXA-13870 / FXA-13869).
 *
 * The Connected Services section shows a "Connect a device" CTA for desktop
 * Firefox (isPairingSupported = isFirefox && !isMobile) that launches the pair
 * flow. This covers that entrypoint routes into pairing.
 *
 * Note: the link currently targets /pair (v1). Carrying `?v=2` when the v2 pref
 * is on is FXA-14289 / FXA-13869 work not yet wired into this link; when it
 * lands, extend this to assert the v2 target.
 */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test('Settings "Connect a device" launches the pair flow', async ({
    target,
    page,
    pages: { signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signInAccount(target, page, settings, signin, credentials);

    await settings.goto();

    // The CTA is gated to desktop Firefox; the functional-test browser qualifies.
    const connectDevice = page.locator(
      '[data-glean-id="account_pref_connect_device_submit"]'
    );
    await expect(connectDevice).toBeVisible();
    await expect(connectDevice).toHaveAttribute('href', /\/pair/);

    await connectDevice.click();
    await page.waitForURL(/\/pair(\?|#|$)/);
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();
}
