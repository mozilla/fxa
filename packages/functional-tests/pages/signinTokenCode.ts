/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninTokenCodePage extends BaseTokenCodePage {
  readonly path = '/signin_token_code';

  get heading() {
    this.checkPath();
    return this.page.getByRole('heading', { name: /^Enter confirmation code/ });
  }

  get codeInput() {
    this.checkPath();
    return this.page
      .getByLabel('Enter 6-digit code') // React
      .or(this.page.getByPlaceholder('Enter 6-digit code')); //Backbone
  }

  get resendCodeButton() {
    this.checkPath();
    return (
      this.page
        .getByRole('button', { name: /^Email new code/ })
        // compatibility with backbone
        .or(this.page.getByRole('link', { name: /^Email new code/ }))
    );
  }
}
