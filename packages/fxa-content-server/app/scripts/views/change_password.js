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
  'views/mixins/password-mixin',
  'views/mixins/floating-placeholder-mixin',
  'lib/auth-errors',
  'views/mixins/service-mixin'
],
function (_, BaseView, FormView, Template, Session, PasswordMixin, FloatingPlaceholderMixin, AuthErrors, ServiceMixin) {
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

    afterRender: function () {
      this.initializePlaceholderFields();
    },

    submit: function () {
      var email = Session.email;
      var oldPassword = this.$('#old_password').val();
      var newPassword = this.$('#new_password').val();

      this.hideError();

      var self = this;
      // Try to sign the user in before checking whether the
      // passwords are the same. If the user typed the incorrect old
      // password, they should know that first.
      return this.fxaClient.checkPassword(email, oldPassword)
          .then(function () {
            if (oldPassword === newPassword) {
              throw AuthErrors.toError('PASSWORDS_MUST_BE_DIFFERENT');
            }

            return self.fxaClient.changePassword(
                     email, oldPassword, newPassword);
          })
          .then(function () {
            // sign the user in, keeping the current sessionTokenContext. This
            // prevents sync users from seeing the `sign out` button on the
            // settings screen.

            var sessionTokenContext = Session.sessionTokenContext;
            Session.clear();
            return self.fxaClient.signIn(email, newPassword, self.relier, {
              sessionTokenContext: sessionTokenContext
            });
          })
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

      return self.fxaClient.signUpResend(self.relier)
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
  _.extend(View.prototype, FloatingPlaceholderMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
