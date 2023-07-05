/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../../../lib/auth-errors';
import Cocktail from '../../../lib/cocktail';
import Template from '../../../templates/post_verify/third_party_auth/set_password.mustache';
import FormView from '../../form';
import FlowEventsMixin from '../../mixins/flow-events-mixin';
import PasswordMixin from '../../mixins/password-mixin';
import PasswordStrengthMixin from '../../mixins/password-strength-mixin';
import CWTSOnSignupPasswordMixin from '../../mixins/cwts-on-signup-password';
import ServiceMixin from '../../mixins/service-mixin';
import AccountSuggestionMixin from '../../mixins/account-suggestion-mixin';

const PASSWORD_INPUT_SELECTOR = '#password';
const VPASSWORD_INPUT_SELECTOR = '#vpassword';

class SetPassword extends FormView {
  template = Template;

  _getPassword() {
    return this.$(PASSWORD_INPUT_SELECTOR).val();
  }

  _getVPassword() {
    return this.$(VPASSWORD_INPUT_SELECTOR).val();
  }

  isValidEnd() {
    return this._getPassword() === this._getVPassword();
  }

  getAccount() {
    return this.user.initAccount({
      email: 'a@aa.com',
    });
  }

  showValidationErrorsEnd() {
    if (this._getPassword() !== this._getVPassword()) {
      const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
      this.showValidationError(this.$(PASSWORD_INPUT_SELECTOR), err, true);
    }
  }

  setInitialContext(context) {
    const email = this.getAccount().get('email');
    context.set({
      email,
    });
  }

  beforeRender() {

  }

  submit() {
    const account = this.getAccount();
    const password = this._getPassword();
    const idToken = 'idToken'; // TODO: get idToken from somewhere

    return this.user.setPasswordThirdParty(account, this.relier, idToken, 'google', account.get('email'), password)
      .then(() => {
        console.log("Finished setting password");
      });
  }
}

Cocktail.mixin(
  SetPassword,
  PasswordMixin,
  CWTSOnSignupPasswordMixin,
  PasswordStrengthMixin({
    balloonEl: '#password-strength-balloon-container',
    passwordEl: '#password',
  }),
  ServiceMixin,
  AccountSuggestionMixin,
  FlowEventsMixin,
);

export default SetPassword;
