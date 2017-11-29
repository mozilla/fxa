/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../../lib/auth-errors');
  const BackMixin = require('../mixins/back-mixin');
  const BaseView = require('../base');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('../mixins/floating-placeholder-mixin');
  const FormView = require('../form');
  const ExperimentMixin = require('../mixins/experiment-mixin');
  const PasswordMixin = require('../mixins/password-mixin');
  const ServiceMixin = require('../mixins/service-mixin');
  const SettingsPanelMixin = require('../mixins/settings-panel-mixin');
  const Template = require('stache!templates/settings/change_password');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'change-password',
    viewName: 'settings.change-password',

    setInitialContext (context) {
      const account = this.getSignedInAccount();
      context.set('email', account.get('email'));
    },

    submit () {
      var account = this.getSignedInAccount();
      var oldPassword = this.$('#old_password').val();
      var newPassword = this.$('#new_password').val();

      this.hideError();

      return this.user.changeAccountPassword(
          account,
          oldPassword,
          newPassword,
          this.relier
        )
        .then(() => {
          this.logViewEvent('success');
          return this.invokeBrokerMethod('afterChangePassword', account);
        })
        .then(() => {
          this.displaySuccess(t('Password changed successfully'));
          this.navigate('settings');

          return this.render();
        })
        .catch((err) => {
          if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
            return this.showValidationError(this.$('#old_password'), err);
          } else if (AuthErrors.is(err, 'PASSWORDS_MUST_BE_DIFFERENT')) {
            return this.showValidationError(this.$('#new_password'), err);
          }
          throw err;
        });
    }

  });

  Cocktail.mixin(
    View,
    ExperimentMixin,
    PasswordMixin,
    FloatingPlaceholderMixin,
    SettingsPanelMixin,
    ServiceMixin,
    BackMixin
  );

  module.exports = View;
});
