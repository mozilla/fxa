/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import BackMixin from '../mixins/back-mixin';
import Cocktail from 'cocktail';
import FormView from '../form';
import ExperimentMixin from '../mixins/experiment-mixin';
import PasswordMixin from '../mixins/password-mixin';
import PasswordStrengthMixin from '../mixins/password-strength-mixin';
import ServiceMixin from '../mixins/service-mixin';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/change_password.mustache';

const t = msg => msg;

const View = FormView.extend({
  template: Template,
  className: 'change-password',
  viewName: 'settings.change-password',

  getAccount() {
    return this.getSignedInAccount();
  },

  setInitialContext(context) {
    const account = this.getAccount();
    context.set('email', account.get('email'));
  },

  isValidEnd() {
    return this._getNewPassword() === this._getNewVPassword();
  },

  showValidationErrorsEnd() {
    if (this._getNewPassword() !== this._getNewVPassword()) {
      const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
      this.showValidationError(this.$('#new_vpassword'), err);
    }
  },

  submit() {
    var account = this.getAccount();
    var oldPassword = this._getOldPassword();
    var newPassword = this._getNewPassword();

    this.hideError();

    return this.user
      .changeAccountPassword(account, oldPassword, newPassword, this.relier)
      .then(() => {
        this.logViewEvent('success');
        return this.invokeBrokerMethod('afterChangePassword', account);
      })
      .then(() => {
        this.displaySuccess(t('Password changed successfully'));
        this.navigate('settings');

        return this.render();
      })
      .catch(err => {
        if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
          return this.showValidationError(this.$('#old_password'), err);
        } else if (AuthErrors.is(err, 'PASSWORDS_MUST_BE_DIFFERENT')) {
          return this.showValidationError(this.$('#new_password'), err);
        }
        throw err;
      });
  },

  _getOldPassword() {
    return this.$('#old_password').val();
  },

  _getNewPassword() {
    return this.$('#new_password').val();
  },

  _getNewVPassword() {
    return this.$('#new_vpassword').val();
  },
});

Cocktail.mixin(
  View,
  ExperimentMixin,
  PasswordMixin,
  PasswordStrengthMixin({
    balloonEl: '.helper-balloon',
    passwordEl: '#new_password',
  }),
  SettingsPanelMixin,
  ServiceMixin,
  BackMixin
);

export default View;
