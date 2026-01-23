/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTokenCodePage } from './baseTokenCode';

export class SigninPasswordlessCodePage extends BaseTokenCodePage {
  readonly path = '/signin_passwordless_code';

  get heading() {
    this.checkPath();
    return this.page.getByRole('heading', {
      name: /^(Enter confirmation code|Create your account)/,
    });
  }

  get codeInput() {
    this.checkPath();
    return this.page.getByLabel('Enter 8-digit code');
  }

  get submitButton() {
    this.checkPath();
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  get resendCodeButton() {
    this.checkPath();
    return this.page.getByRole('button', { name: /Email new code/ });
  }

  get errorBanner() {
    return this.page.locator('[class*="banner"][class*="error"]');
  }

  get totpRequiredError() {
    return this.page.getByText(
      /Two-step authentication is enabled on your account/
    );
  }

  get resendSuccessBanner() {
    return this.page.getByText(/A new code was sent/);
  }
}
