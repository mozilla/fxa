/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/change_password',
  'views/mixins/password-mixin',
  'views/mixins/floating-placeholder-mixin',
  'lib/auth-errors',
  'views/mixins/service-mixin'
],
function (_, BaseView, FormView, Template, PasswordMixin, FloatingPlaceholderMixin, AuthErrors, ServiceMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to change password
    mustAuth: true,

    template: Template,
    className: 'change-password',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'change .show-password': 'onPasswordVisibilityChange'
    },

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
      var account = self.currentAccount();
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

            return self.fxaClient.signIn(email, newPassword, self.relier, self.user, {
              sessionTokenContext: account.get('sessionTokenContext')
            });
          })
          .then(function () {
            self.navigate('settings', {
              success: t('Password changed')
            });
          });
    }

  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, FloatingPlaceholderMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
