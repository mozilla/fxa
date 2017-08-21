/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BackMixin = require('views/mixins/back-mixin');
  const Cocktail = require('cocktail');
  const FormPrefillMixin = require('views/mixins/form-prefill-mixin');
  const FormView = require('views/form');
  const PasswordMixin = require('views/mixins/password-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const SignInMixin = require('views/mixins/signin-mixin');
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
    FormPrefillMixin,
    PasswordMixin,
    ServiceMixin,
    SignInMixin
  );

  module.exports = SignInPasswordView;
});
