/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BackMixin = require('./mixins/back-mixin');
  const Cocktail = require('cocktail');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const FormPrefillMixin = require('./mixins/form-prefill-mixin');
  const FormView = require('./form');
  const PasswordMixin = require('./mixins/password-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const SignInMixin = require('./mixins/signin-mixin');
  const Template = require('stache!templates/sign_in_password');

  class SignInPasswordView extends FormView {
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
      const password = this.getElementValue('input[type=password]');

      return this.signIn(this.getAccount(), password);
    }
  }

  Cocktail.mixin(
    SignInPasswordView,
    BackMixin,
    FlowEventsMixin,
    FormPrefillMixin,
    PasswordMixin,
    ServiceMixin,
    SignInMixin
  );

  module.exports = SignInPasswordView;
});
