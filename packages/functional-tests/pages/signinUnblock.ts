/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninUnblockPage extends BaseTokenCodePage {
  readonly path = '/signin_unblock';

  get resendCodeButton() {
    this.checkPath();
    return this.page.getByRole('link', {
      name: 'Not in inbox or spam folder? Resend',
    });
  }
}
