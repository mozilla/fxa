/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninTokenCodePage extends BaseTokenCodePage {
  readonly path = '/signin_token_code';

  get tokenCodeHeader() {
    this.checkPath();
    return this.page.locator('#fxa-signin-code-header');
  }

  get resendButton() {
    this.checkPath();
    return this.page.getByRole('button', { name: /Email new code/ });
  }
}
