/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class SignupConfirmedSyncPage extends BaseLayout {
  readonly path = 'signup_confirmed_sync';

  get bannerConfirmed() {
    return this.page.locator('div[role="status"]', {
      // .*? due to hidden bidi characters from Fluent
      hasText: /Mozilla account.*?confirmed/i,
    });
  }

  // Outside a form with no `type`, so the Glean id is the only stable hook.
  get pairLink() {
    this.checkPath();
    return this.page.locator(
      'button[data-glean-id="signup_confirmed_sync_pair_link"]'
    );
  }

  async clickPairLink() {
    await this.pairLink.click();
  }
}
