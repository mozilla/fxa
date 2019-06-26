/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from 'lib/auth-errors';
import FormView from '../form';
import Template from '../../templates/sign_in_totp_code.mustache';

const CODE_INPUT_SELECTOR = 'input.totp-code';

const View = FormView.extend({
  className: 'pair-totp',
  template: Template,

  setInitialContext(context) {
    context.set({
      hideTotpAlternatives: true,
    });
  },

  getAccount() {
    return this.model.get('account') || this.getSignedInAccount();
  },

  submit() {
    const account = this.getAccount();
    const code = this.getElementValue('input.totp-code');
    return account
      .verifyTotpCode(code, 'pair')
      .then(result => {
        if (result.success) {
          return this.replaceCurrentPage('/pair/auth/allow', {
            totpComplete: true,
          });
        } else {
          throw AuthErrors.toError('INVALID_TOTP_CODE');
        }
      })
      .catch(err => this.showValidationError(this.$(CODE_INPUT_SELECTOR), err));
  },
});

export default View;
