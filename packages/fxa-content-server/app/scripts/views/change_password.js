/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'views/form',
  'lib/auth-errors',
  'stache!templates/change_password',
  'views/mixins/password-mixin',
  'views/mixins/floating-placeholder-mixin',
  'views/mixins/service-mixin',
  'views/mixins/back-mixin',
  'views/mixins/account-locked-mixin'
],
function (Cocktail, BaseView, FormView, AuthErrors, Template, PasswordMixin,
  FloatingPlaceholderMixin, ServiceMixin, BackMixin, AccountLockedMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to change password
    mustAuth: true,

    template: Template,
    className: 'change-password',

    context: function () {
      return {
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled()
      };
    },

    afterRender: function () {
      this.initializePlaceholderFields();
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      var email = account.get('email');
      var oldPassword = self.$('#old_password').val();
      var newPassword = self.$('#new_password').val();

      self.hideError();

      // Try to sign the user in before checking whether the
      // passwords are the same. If the user typed the incorrect old
      // password, they should know that first.
      return self.fxaClient.checkPassword(email, oldPassword)
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

            return self.fxaClient.signIn(
              email,
              newPassword,
              self.relier,
              {
                reason: self.fxaClient.SIGNIN_REASON.PASSWORD_CHANGE,
                sessionTokenContext: account.get('sessionTokenContext')
              }
            );
          })
          .then(function (updatedSessionData) {
            account.set(updatedSessionData);
            return self.user.setSignedInAccount(account);
          })
          .then(function () {
            return self.broker.afterChangePassword(account);
          })
          .then(function () {
            self.navigate('settings', {
              success: t('Password changed successfully')
            });
          }, function (err) {
            if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
              // the password is needed to poll whether the account has
              // been unlocked.
              account.set('password', oldPassword);
              return self.notifyOfLockedAccount(account);
            }

            throw err;
          });
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    FloatingPlaceholderMixin,
    ServiceMixin,
    BackMixin,
    AccountLockedMixin
  );

  return View;
});
