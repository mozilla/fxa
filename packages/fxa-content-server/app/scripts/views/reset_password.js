/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../lib/auth-errors');
  const BackMixin = require('./mixins/back-mixin');
  const Cocktail = require('cocktail');
  const FormView = require('./form');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const PasswordResetMixin = require('./mixins/password-reset-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const Session = require('../lib/session');
  const Template = require('stache!templates/reset_password');

  const t = (msg) => msg;

  class ResetPasswordView extends FormView {
    initialize (options) {
      this.template = Template;
      this.className = 'reset_password';

      // The form-prefill-mixin is not used, otherwise a blank email
      // address clears the email field in the formPrefill model if
      // the user doesn't enter an address. See comment in beforeDestroy
      this._formPrefill = options.formPrefill;

      super.initialize(options);
    }

    setInitialContext (context) {
      super.setInitialContext(context);

      context.set({
        forceEmail: this.model.get('forceEmail')
      });
    }

    beforeRender () {
      var email = this.relier.get('email');
      var canSkip = this.relier.get('resetPasswordConfirm') === false;
      if (canSkip && email) {
        return this._resetPassword(email)
          .then(() => false)
          .catch((err) => {
            this.model.set('error', err);
          });
      }

      return super.beforeRender();
    }

    beforeDestroy () {
      const email = this.getElementValue('.email');
      // The email field is not pre-filled for the reset_password page,
      // but if the user enters an email address, the entered email
      // address should be propagated back to the signin page. If
      // the user enters no email and instead clicks "Remember password?"
      // immediately, the /signin page should have the original email.
      // See https://github.com/mozilla/fxa/tree/master/features/FxA-72-reset-password
      // and #5293
      if (email) {
        this._formPrefill.set({ email });
      }
    }

    submit () {
      return this._resetPassword(this.getElementValue('.email'));
    }

    _resetPassword (email) {
      return this.resetPassword(email)
        .catch((err) => {
          // clear oauth session
          Session.clear('oauth');
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
            return this.unsafeDisplayError(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            this.logEvent('login.canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    }
  }

  Cocktail.mixin(
    ResetPasswordView,
    BackMixin,
    FlowEventsMixin,
    PasswordResetMixin,
    ServiceMixin
  );

  module.exports = ResetPasswordView;
});
