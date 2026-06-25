/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Chromium-only passkey smoke test: drives Chrome's REAL WebAuthn stack via a CDP
 * virtual authenticator (see cdpVirtualAuthenticator.ts), not the polyfill, to
 * exercise the production webauthn.ts path end-to-end.
 *
 * A CDP authenticator is still Chromium's WebAuthn, so it can't reproduce the
 * iOS toJSON() renderer crash — that remains manual cross-device QA.
 *
 * Tagged @chromium so it runs only under the -chromium Playwright projects.
 */

import { expect, test } from '../../lib/fixtures/standard';
import { addVirtualAuthenticator } from '../../lib/cdpVirtualAuthenticator';

test.describe('severity-1 #smoke @chromium', () => {
  test.describe('passkey (real WebAuthn via CDP virtual authenticator)', () => {
    // Run serially: CDP sessions and virtual authenticators are attached to the
    // shared browser context and can collide when this spec runs in parallel.
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled ||
          !config.featureFlags?.passkeyAuthenticationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('registers and then signs in with a passkey end-to-end', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const authenticator = await addVirtualAuthenticator(page);
      try {
        // Sign up + password sign-in to reach Settings.
        const credentials = await testAccountTracker.signUp();
        await page.goto(target.contentServerUrl);
        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.fillOutPasswordForm(credentials.password);
        await page.waitForURL(/settings/);
        await expect(settings.settingsHeading).toBeVisible();
        await expect(settings.passkey.status).toHaveText('Not set');

        // Register: real create() runs toNativeCreationOptions + toCredentialJSON
        // against a genuine credential.
        await settings.passkey.createButton.click();
        await settings.confirmMfaGuardIfVisible(credentials.email);
        await expect(settings.settingsHeading).toBeVisible();
        await expect(settings.alertBar).toHaveText('Passkey created');
        await expect(settings.passkey.status).toHaveText('Enabled');

        // Sign back in: real get() resolves via the same resident credential.
        await settings.signOut();
        await page.goto(target.contentServerUrl);
        await signin.fillOutEmailFirstForm(credentials.email);
        await signin.passkeySigninButton.click();
        await page.waitForURL(/settings/);
        await expect(settings.settingsHeading).toBeVisible();
      } finally {
        await authenticator.remove();
      }
    });
  });
});
