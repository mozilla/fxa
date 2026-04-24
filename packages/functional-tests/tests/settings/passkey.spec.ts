/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * These tests require the passkey feature flags to be enabled on the content
 * server (FEATURE_FLAGS_PASSKEYS_ENABLED=true and
 * FEATURE_FLAGS_PASSKEY_REGISTRATION_ENABLED=true) and passkeys.enabled=true
 * on the auth-server. The suite is skipped at runtime if the
 * fxa-settings config reports either flag as disabled.
 */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('passkey registration', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.passkeysEnabled ||
          !config.featureFlags?.passkeyRegistrationEnabled,
        'Passkey feature flags are not enabled'
      );
    });

    test('registers a new passkey', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.passkey.status).toHaveText('Not set');

      // Install the polyfill only after signin so content-server pages
      // load untouched, then immediately eager-evaluate it so the current
      // settings page's navigator.credentials is patched before the SPA
      // navigation to /settings/passkeys/add (which doesn't fire
      // addInitScript).
      await settingsPasskeyAdd.initPasskeys(page);

      await settingsPasskeyAdd.passkeyAuth.success(async () => {
        await settings.passkey.createButton.click();
        await settings.confirmMfaGuard(email);
      });

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText('Passkey created');
      await expect(settings.passkey.status).toHaveText('Enabled');
      await expect(settings.passkey.subRow).toBeVisible();

      const credentials = await settingsPasskeyAdd.passkeyAuth.getCredentials();
      expect(credentials).toHaveLength(1);
    });

    test('cancels passkey registration', async ({
      target,
      pages: { page, settings, settingsPasskeyAdd, signin },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();
      await expect(settings.settingsHeading).toBeVisible();
      // Wait for UnitRowPasskey to finish its async passkey list fetch —
      // the row renders empty until loading completes, so clicking too
      // early would hit a missing testid.
      await expect(settings.passkey.status).toHaveText('Not set');

      // Install the polyfill in `pending` mode (default) so the WebAuthn
      // ceremony started by createButton.click() hangs until the Cancel
      // button is clicked. Content-server pages loaded untouched during
      // signin.
      await settingsPasskeyAdd.initPasskeys(page);

      await settings.passkey.createButton.click();
      await settings.confirmMfaGuard(email);

      await expect(settingsPasskeyAdd.pageContainer).toBeVisible();
      await expect(settingsPasskeyAdd.creatingHeading).toBeVisible();

      await settingsPasskeyAdd.cancelButton.click();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.passkey.status).toHaveText('Not set');
      await expect(settings.passkey.subRow).toHaveCount(0);

      const credentials = await settingsPasskeyAdd.passkeyAuth.getCredentials();
      expect(credentials).toHaveLength(0);
    });

    test('shows error when WebAuthn is not supported', async ({
      target,
      pages: { page, settings, signin },
      testAccountTracker,
    }) => {
      // Simulate a browser without WebAuthn by stubbing
      // window.PublicKeyCredential before any document loads. This must be
      // installed before signInAccount navigates, so the settings page's
      // initial render sees isWebAuthnLevel3Supported() === false and
      // renders the modal-trigger "Create" button (which reveals an error
      // banner on click) instead of the route link.
      await page.context().addInitScript(() => {
        Object.defineProperty(window, 'PublicKeyCredential', {
          value: undefined,
          configurable: true,
          writable: true,
        });
      });

      await signInAccount(target, page, settings, signin, testAccountTracker);

      await settings.goto();
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.passkey.status).toHaveText('Not set');

      await settings.passkey.createButton.click();

      await expect(page.getByText('Your browser or device')).toBeVisible();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
