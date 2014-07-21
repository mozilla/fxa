/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/promise',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/constants',
  'lib/session',
  'views/mixins/password-mixin',
  'lib/auth-errors',
  'lib/validate',
  'views/mixins/service-mixin'
],
function (_, p, BaseView, FormView, SignInTemplate, Constants, Session, PasswordMixin, AuthErrors, Validate, ServiceMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      // reset any force auth status.
      Session.set('forceAuth', false);
      this.service = Session.service;
    },

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      var email = Session.prefillEmail || this.searchParam('email');

      return {
        service: this.service,
        serviceName: this.serviceName,
        email: email,
        password: Session.prefillPassword,
        isSync: this.isSync()
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'click a[href="/reset_password"]': 'resetPasswordIfKnownValidEmail'
    },

    beforeDestroy: function () {
      Session.set('prefillEmail', this.$('.email').val());
      Session.set('prefillPassword', this.$('.password').val());
    },

    beforeRender: function() {
      var self = this;
      return p().then(function () {
          return FormView.prototype.beforeRender.call(self);
        })
        .then(function () {
          if (self.hasService() && self.isSync()) {
            return self.setServiceInfo();
          }
        });
    },

    submit: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();

      return this._signIn(email, password);
    },

    _signIn: function (email, password) {
      var self = this;
      return this.fxaClient.signIn(email, password)
        .then(function (accountData) {
          if (accountData.verified) {
            return self.onSignInSuccess();
          } else {
            return self.onSignInUnverified();
          }
        })
        .then(null, function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            return self._suggestSignUp(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            self.logEvent('login:canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    },

    onSignInSuccess: function() {
      // Don't switch to settings if we're trying to log in to
      // Firefox. Firefox will show its own landing page
      if (Session.get('context') !== Constants.FX_DESKTOP_CONTEXT) {
        this.navigate('settings');
      }

      return true;
    },

    onSignInUnverified: function() {
      var self = this;

      return self.fxaClient.signUpResend()
        .then(function () {
          self.navigate('confirm');
        });
    },

    onPasswordResetNavigate: function () {
      this.navigate('reset_password');
    },

    _suggestSignUp: function (err) {
      err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
      return this.displayErrorUnsafe(err);
    },

    resetPasswordIfKnownValidEmail: BaseView.preventDefaultThen(function () {
      var self = this;
      return p().then(function () {
        self.onPasswordResetNavigate();
      });
    })
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
