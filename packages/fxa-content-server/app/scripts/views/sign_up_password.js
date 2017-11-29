/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BackMixin = require('./mixins/back-mixin');
  const CheckboxMixin = require('./mixins/checkbox-mixin');
  const Cocktail = require('cocktail');
  const CoppaMixin = require('./mixins/coppa-mixin');
  const EmailOptInMixin = require('./mixins/email-opt-in-mixin');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const FormPrefillMixin = require('./mixins/form-prefill-mixin');
  const FormView = require('./form');
  const PasswordMixin = require('./mixins/password-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const SignUpMixin = require('./mixins/signup-mixin');
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
  }

  Cocktail.mixin(
    SignUpPasswordView,
    BackMixin,
    CheckboxMixin,
    CoppaMixin({
      required: true
    }),
    EmailOptInMixin,
    FlowEventsMixin,
    FormPrefillMixin,
    PasswordMixin,
    ServiceMixin,
    SignUpMixin
  );

  module.exports = SignUpPasswordView;
});
