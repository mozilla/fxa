/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class SigninTokenCodePage extends BaseLayout {
  readonly path = 'sign_in_token_code';

  readonly selectors = {
    LINK_RESEND: '#resend',
    SIGNIN_HEADER: '#fxa-signin-header',
    SIGNIN_TOKEN_CODE_HEADER: '#fxa-signin-code-header',
    SIGNIN_PASSWORD_HEADER: '#fxa-signin-password-header',
    SUBMIT: 'button[type=submit]',
    TEXT_INPUT: 'input[type=text]',
    TOOLTIP: '.tooltip',
    SUCCESS: '.success',
  };

  get passwordHeader() {
    return this.page.locator(this.selectors.SIGNIN_PASSWORD_HEADER);
  }

  get tokenCodeHeader() {
    return this.page.locator(this.selectors.SIGNIN_TOKEN_CODE_HEADER);
  }

  get input() {
    return this.page.locator(this.selectors.TEXT_INPUT);
  }

  get submit() {
    return this.page.locator(this.selectors.SUBMIT);
  }

  get tooltip() {
    return this.page.locator(this.selectors.TOOLTIP);
  }

  get resendLink() {
    return this.page.locator(this.selectors.LINK_RESEND);
  }

  get successMessage() {
    return this.page.locator(this.selectors.SUCCESS);
  }

  async clickSubmitButton() {
    await this.page.locator(this.selectors.SUBMIT).click();
  }
}
