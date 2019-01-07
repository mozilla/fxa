/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import BackMixin from '../mixins/back-mixin';
import Cocktail from 'cocktail';
import FormView from '../form';
import ExperimentMixin from '../mixins/experiment-mixin';
import PasswordMixin from '../mixins/password-mixin';
import ServiceMixin from '../mixins/service-mixin';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/change_password.mustache';

const t = msg => msg;

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
  SettingsPanelMixin,
  ServiceMixin,
  BackMixin
);

module.exports = View;
