/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AccountLockedMixin = require('views/mixins/account-locked-mixin');
  var AuthErrors = require('lib/auth-errors');
  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  var FormView = require('views/form');
  var PasswordMixin = require('views/mixins/password-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var Template = require('stache!templates/settings/change_password');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'change-password',
    viewName: 'settings.change-password',

    context: function () {
      return {
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled()
      };
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
          return self.invokeBrokerMethod('afterChangePassword', account);
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
    SettingsPanelMixin,
    ServiceMixin,
    BackMixin,
    AccountLockedMixin
  );

  module.exports = View;
});
