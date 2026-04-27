/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PasskeyPage } from '../passkey';

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
}
