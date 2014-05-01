/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/constants',
  'lib/session',
  'lib/password-mixin',
  'lib/url',
  'lib/auth-errors'
],
function (_, p, BaseView, FormView, SignInTemplate, Constants, Session, PasswordMixin, Url, AuthErrors) {
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
      return {
        service: this.service,
        serviceName: this.serviceName,
        email: Session.prefillEmail,
        isSync: Session.isSync()
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange'
    },

    submit: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();

      return this.signIn(email, password);
    },

    signIn: function (email, password) {
      var self = this;
      return this.fxaClient.signIn(email, password)
        .then(function (accountData) {
          if (accountData.verified) {
            return self.onSignInSuccess();
          } else {
            return self.fxaClient.signUpResend()
              .then(function () {
                self.navigate('confirm');
              });
          }
        })
        .then(null, _.bind(function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            // email indicates the signed in email. Use prefillEmail
            // to avoid collisions across sessions.
            Session.set('prefillEmail', email);
            var msg = t('Unknown account. <a href="/signup">Sign up</a>');
            return self.displayErrorUnsafe(msg);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        }, this));
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
