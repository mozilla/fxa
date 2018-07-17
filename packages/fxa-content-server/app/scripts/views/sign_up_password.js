/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailOptInMixin from './mixins/email-opt-in-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import PasswordMixin from './mixins/password-mixin';
import PasswordStrengthExperimentMixin from './mixins/password-strength-experiment-mixin';
import ServiceMixin from './mixins/service-mixin';
import SignUpMixin from './mixins/signup-mixin';
import Template from 'templates/sign_up_password.mustache';

class SignUpPasswordView extends FormView {
  constructor (options) {
    super(options);

    this.template = Template;
  }

  getAccount () {
    return this.model.get('account');
  }

  beforeRender () {
    if (! this.getAccount()) {
      this.navigate('/');
    }
  }

  setInitialContext (context) {
    context.set(this.getAccount().pick('email'));
  }

  isValidEnd () {
    if (! this._doPasswordsMatch()) {
      return false;
    }

    return super.isValidEnd();
  }

  showValidationErrorsEnd () {
    if (! this._doPasswordsMatch()) {
      this.displayError(AuthErrors.toError('PASSWORDS_DO_NOT_MATCH'));
    }
  }

  submit () {
    return Promise.resolve().then(() => {
      if (! this.isUserOldEnough()) {
        return this.tooYoung();
      }

      const account = this.getAccount();
      account.set('needsOptedInToMarketingEmail', this.hasOptedInToMarketingEmail());
      return this.signUp(account, this._getPassword());
    });
  }

  _getPassword () {
    return this.getElementValue('#password');
  }

  _getVPassword () {
    return this.getElementValue('#vpassword');
  }

  _doPasswordsMatch() {
    return this._getPassword() === this._getVPassword();
  }
}

Cocktail.mixin(
  SignUpPasswordView,
  BackMixin,
  CoppaMixin({
    required: true
  }),
  EmailOptInMixin,
  FlowEventsMixin,
  FormPrefillMixin,
  PasswordMixin,
  PasswordStrengthExperimentMixin({
    balloonEl: '.helper-balloon',
    passwordEl: '#password'
  }),
  ServiceMixin,
  SignUpMixin
);

module.exports = SignUpPasswordView;
