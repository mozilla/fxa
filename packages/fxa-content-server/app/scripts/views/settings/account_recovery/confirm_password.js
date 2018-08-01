/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../../../lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from '../../form';
import PasswordMixin from '../../mixins/password-mixin';
import ModalSettingsPanelMixin from '../../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/account_recovery/confirm_password.mustache';

const PASSWORD_SELECTOR = '#password';

const View = FormView.extend({
  template: Template,
  className: 'account-recovery-confirm-password',
  viewName: 'settings.account-recovery.confirm-password',

  events: _.extend({}, FormView.prototype.events, {
    'click .cancel-link': FormView.preventDefaultThen('_cancelPasswordConfirm')
  }),

  _cancelPasswordConfirm() {
    this.navigate('settings/account_recovery', {
      hasRecoveryKey: false
    });
  },

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    const email = account.get('email');
    context.set({
      email
    });
  },

  submit() {
    const account = this.getSignedInAccount();
    const password = this.getElementValue('#password');
    return account.createRecoveryBundle(password)
      .then((result) => {
        this.model.set('recoveryKey', result.recoveryKey);
        this.showRecoveryKeyView = true;
        this.navigate('settings/account_recovery/recovery_key', result);
      })
      .catch((err) => {
        if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
          return this.showValidationError(this.$(PASSWORD_SELECTOR), err);
        }
        throw err;
      });
  },
});

Cocktail.mixin(
  View,
  ModalSettingsPanelMixin,
  PasswordMixin
);

module.exports = View;

