/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/change_password',
  'lib/session',
  'lib/password-mixin',
  'lib/auth-errors'
],
function (_, BaseView, FormView, Template, Session, PasswordMixin, AuthErrors) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to change password
    mustAuth: true,

    template: Template,
    className: 'change-password',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'change .show-password': 'onPasswordVisibilityChange',
      'click #resend': 'resendVerificationEmail'
    },

    context: function () {
      return {
        isSync: Session.isSync()
      };
    },

    afterRender: function() {
      this.togglePlaceholderPattern();
    },

    submit: function () {
      var email = Session.email;
      var oldPassword = this.$('#old_password').val();
      var newPassword = this.$('#new_password').val();

      if (oldPassword === newPassword) {
        return this.displayError(
                    t('Your new password must be different'));
      }

      this.hideError();

      var self = this;
      return this.fxaClient.changePassword(email, oldPassword, newPassword)
                .then(function () {
                  self.navigate('settings', {
                    success: t('Password changed')
                  });
                }, function (err) {
                  if (AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')) {
                    err.forceMessage = t('Unverified account. <a href="#" id="resend">Resend verification email</a>.');
                    return self.displayErrorUnsafe(err);
                  }

                  throw err;
                });
    },

    resendVerificationEmail: BaseView.preventDefaultThen(function () {
      var self = this;

      return this.fxaClient.signUpResend()
              .then(function () {
                self.navigate('confirm');
              }, function (err) {
                if (AuthErrors.is(err, 'INVALID_TOKEN')) {
                  return self.navigate('signup', {
                    error: err
                  });
                }

                throw self.displayError(err);
              });
    })

  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
