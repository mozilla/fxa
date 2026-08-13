/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class InlineTotpSetupPage extends BaseLayout {
  readonly path = '/inline_totp_setup';

  get introHeading() {
    return this.page.getByRole('heading', {
      name: 'Set up two-step authentication',
    });
  }

  // Structural, not copy — the banner id is guarded in the FlowSetup2faPrompt
  // unit test, which is also where the wording is asserted.
  get passkeySuccessBanner() {
    return this.page.locator('#passkey-signin-success');
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }
}
