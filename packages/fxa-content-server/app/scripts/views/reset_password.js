/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../lib/auth-errors');
  const BackMixin = require('./mixins/back-mixin');
  const Cocktail = require('cocktail');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const FormView = require('./form');
  const PasswordResetMixin = require('./mixins/password-reset-mixin');
  const preventDefaultThen = require('./base').preventDefaultThen;
  const ServiceMixin = require('./mixins/service-mixin');
  const Session = require('../lib/session');
  const Template = require('templates/reset_password.mustache');

  const t = (msg) => msg;

  const ResetPasswordView = FormView.extend({
    events: {
      'click .remember-password': preventDefaultThen('_rememberPassword')
    },

    initialize (options) {
      this.template = Template;
      this.className = 'reset_password';

      // The form-prefill-mixin is not used, otherwise a blank email
      // address clears the email field in the formPrefill model if
      // the user doesn't enter an address. See comment in beforeDestroy
      this._formPrefill = options.formPrefill;

      FormView.prototype.initialize.call(this, options);
    },

    setInitialContext (context) {
      context.set({
        forceEmail: this.model.get('forceEmail')
      });
      FormView.prototype.setInitialContext.call(this, context);
    },

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
      FormView.prototype.beforeRender.call(this);
    },

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
    },

    submit () {
      return this._resetPassword(this.getElementValue('.email'));
    },

    /**
     *
     */
    _rememberPassword () {
      // if there is a forced email then we want to direct back to force_auth
      if (this.model.get('forceEmail')) {
        this.navigate('force_auth');
      } else {
        this.navigate('signin');
      }
    },

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
  });

  Cocktail.mixin(
    ResetPasswordView,
    BackMixin,
    FlowEventsMixin,
    PasswordResetMixin,
    ServiceMixin
  );

  module.exports = ResetPasswordView;
});
