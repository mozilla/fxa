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
  var ExperimentMixin = require('views/mixins/experiment-mixin');
  var PasswordMixin = require('views/mixins/password-mixin');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var Template = require('stache!templates/settings/change_password');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'change-password',
    viewName: 'settings.change-password',

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
          self.logViewEvent('success');
          return self.invokeBrokerMethod('afterChangePassword', account);
        })
        .then(function () {
          self.displaySuccess(t('Password changed successfully'));
          self.navigate('settings');

          return self.render();
        }, function (err) {
          if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
            return self.notifyOfLockedAccount(account, oldPassword);
          }

          throw err;
        });
    }

  });

  Cocktail.mixin(
    View,
    ExperimentMixin,
    PasswordMixin,
    PasswordStrengthMixin,
    FloatingPlaceholderMixin,
    SettingsPanelMixin,
    ServiceMixin,
    BackMixin,
    AccountLockedMixin
  );

  module.exports = View;
});
