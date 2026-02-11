/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninUnblockPage extends BaseTokenCodePage {
  readonly path = '/signin_unblock';

  get heading() {
    this.checkPath();
    return this.page.getByRole('heading', { name: /^Authorize this sign-in/ });
  }

  get submitButton() {
    this.checkPath();
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get codeInput() {
    this.checkPath();
    return (
      this.page
        .getByRole('textbox', { name: 'Enter authorization code' })
        // for backbone compatibility
        .or(this.page.getByPlaceholder('Enter authorization code'))
    );
  }

  get resendCodeButton() {
    this.checkPath();
    return (
      this.page
        .getByRole('button', {
          name: 'Not in inbox or spam folder? Resend',
        })
        // for backbone compatibility
        .or(
          this.page.getByRole('link', {
            name: 'Not in inbox or spam folder? Resend',
          })
        )
    );
  }
}
