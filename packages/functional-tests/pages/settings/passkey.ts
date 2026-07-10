/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { PasskeyPage } from '../passkey';
import type { SettingsPage } from './index';

/**
 * Page object for the `/settings/passkeys/add` page, which auto-starts a
 * WebAuthn registration ceremony on mount. Extends PasskeyPage to pick up the
 * virtual-authenticator lifecycle (init/cleanup) and `passkeyAuth` getter.
 */
export class SettingsPasskeyAddPage extends PasskeyPage {
  readonly path = 'settings/passkeys/add';

  get pageContainer() {
    return this.page.getByTestId('page-passkey-add');
  }

  get creatingHeading() {
    return this.page.getByRole('heading', { name: 'Creating passkey…' });
  }

  get cancelButton() {
    return this.page.getByTestId('passkey-add-cancel');
  }

  /**
   * Happy-path passkey registration. Assumes the user is signed in and the
   * settings page is loaded. Installs the WebAuthn polyfill (idempotent),
   * clicks Create on the passkey row, satisfies the MFA guard with the email
   * OTP, and waits for the success alert. Returns the credentialId of the
   * freshly minted passkey so callers can target it later (e.g. to sign in
   * with it or to assert it was deleted).
   */
  async registerNewPasskey(settings: SettingsPage, email: string) {
    await this.initPasskeys(this.page);

    await this.passkeyAuth.success(async () => {
      await settings.passkey.createButton.click();
      await settings.confirmMfaGuardIfVisible(email);
    });

    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.alertBar).toHaveText('Passkey created');
    await expect(settings.passkey.status).toHaveText('Enabled');
    await expect(settings.passkey.subRow).toBeVisible();

    const credentials = this.passkeyAuth.getCredentials();
    return credentials[credentials.length - 1].credentialId;
  }
}
