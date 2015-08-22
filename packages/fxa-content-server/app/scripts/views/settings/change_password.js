/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/base',
  'views/form',
  'lib/auth-errors',
  'stache!templates/settings/change_password',
  'views/mixins/password-mixin',
  'views/mixins/floating-placeholder-mixin',
  'views/mixins/settings-mixin',
  'views/mixins/settings-panel-mixin',
  'views/mixins/service-mixin',
  'views/mixins/back-mixin',
  'views/mixins/account-locked-mixin'
],
function (Cocktail, BaseView, FormView, AuthErrors, Template, PasswordMixin,
  FloatingPlaceholderMixin, SettingsMixin, SettingsPanelMixin, ServiceMixin,
  BackMixin, AccountLockedMixin) {
  'use strict';

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
      var oldPassword = self.$('#old_password').val();
      var newPassword = self.$('#new_password').val();

      self.hideError();

      return self.user.changeAccountPassword(
          account,
          oldPassword,
          newPassword,
          self.relier
        )
        .then(function () {
          return self.broker.afterChangePassword(account);
        })
        .then(function () {
          self.displaySuccess(t('Password changed successfully'));
          self.navigate('settings');

          return self.render();
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
    SettingsMixin,
    SettingsPanelMixin,
    ServiceMixin,
    BackMixin,
    AccountLockedMixin
  );

  return View;
});
