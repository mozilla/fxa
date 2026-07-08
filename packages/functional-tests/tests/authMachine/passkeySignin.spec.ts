/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

/**
 * Auth state machine — passkey sign-in E2E.
 *
 * The passkey sign-in flow delegates to the same handleNavigation seam as the
 * password path (lib/passkeys/signin-flow.ts), and machineOwnsNavigation has no
 * passkey exclusion — so with the flag on, the machine owns the passkey post-auth
 * routing decision. A passkey assertion is AAL2 and yields a verified session, so
 * the machine must finalize it to settings (routeAfterVerify → finalizing.handoff).
 *
 * Requires the passkey feature flags; the test skips when they are unavailable.
 */
test.describe('auth-machine: passkey sign-in', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      !config.featureFlags?.passkeysEnabled ||
        !config.featureFlags?.passkeyRegistrationEnabled ||
        !config.featureFlags?.passkeyAuthenticationEnabled,
      'Passkey feature flags are not enabled'
    );
  });

  test('verified passkey sign-in is finalized to settings (machine on)', async ({
    target,
    pages: { page, settings, settingsPasskeyAdd, signin },
    testAccountTracker,
  }) => {
    // Register a passkey on a fresh account (installs the WebAuthn polyfill).
    const credentials = await testAccountTracker.signUp();
    await page.goto(target.contentServerUrl);
    await signin.fillOutEmailFirstForm(credentials.email);
    await signin.fillOutPasswordForm(credentials.password);
    await page.waitForURL(/settings/);
    await expect(settings.settingsHeading).toBeVisible();

    await settingsPasskeyAdd.registerNewPasskey(settings, credentials.email);

    // Sign out but keep the polyfill credential discoverable.
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Sign in with the passkey, machine flag on. The machine must own the
    // post-auth navigation and finalize the AAL2 passkey session to settings.
    await page.goto(`${target.contentServerUrl}?authStateMachine=true`);
    await expect(page).toHaveURL(/authStateMachine=true/);

    await settingsPasskeyAdd.passkeyAuth.assertion(async () => {
      await signin.passkeySigninButton.click();
      await page.waitForURL(/settings/);
    });

    await expect(settings.settingsHeading).toBeVisible();
  });
});
