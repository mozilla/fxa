/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const BackMixin = require('views/mixins/back-mixin');
  const CheckboxMixin = require('views/mixins/checkbox-mixin');
  const Cocktail = require('cocktail');
  const CoppaMixin = require('views/mixins/coppa-mixin');
  const EmailOptInMixin = require('views/mixins/email-opt-in-mixin');
  const FormPrefillMixin = require('views/mixins/form-prefill-mixin');
  const FormView = require('views/form');
  const p = require('lib/promise');
  const PasswordMixin = require('views/mixins/password-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const SignUpMixin = require('views/mixins/signup-mixin');
  const Template = require('stache!templates/sign_up_password');

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
      return this._doPasswordsMatch();
    }

    showValidationErrorsEnd () {
      if (! this._doPasswordsMatch()) {
        this.displayError(AuthErrors.toError('PASSWORDS_DO_NOT_MATCH'));
      }
    }

    submit () {
      return p().then(() => {
        if (! this.isUserOldEnough()) {
          return this.tooYoung();
        }

        const account = this.getAccount();
        account.set('needsOptedInToMarketingEmail', this.hasOptedInToMarketingEmail());
        return this.signUp(account, this._getPassword());
      });
    }

    _doPasswordsMatch () {
      return this._getPassword() === this._getVPassword();
    }

    _getPassword () {
      return this.getElementValue('#password');
    }

    _getVPassword () {
      return this.getElementValue('#vpassword');
    }
  }

  Cocktail.mixin(
    SignUpPasswordView,
    BackMixin,
    CheckboxMixin,
    CoppaMixin({
      required: true
    }),
    EmailOptInMixin,
    FormPrefillMixin,
    PasswordMixin,
    ServiceMixin,
    SignUpMixin
  );

  module.exports = SignUpPasswordView;
});
