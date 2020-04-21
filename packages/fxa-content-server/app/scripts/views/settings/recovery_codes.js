/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/recovery_codes.mustache';
import RecoveryCodesMixin from '../mixins/recovery-codes-mixin';
import preventDefaultThen from '../decorators/prevent_default_then';
import SaveOptionsMixin from '../mixins/save-options-mixin';
import UserAgentMixin from '../../lib/user-agent-mixin';

const t = msg => msg;

const View = FormView.extend({
  template: Template,
  className: 'recovery-codes',
  viewName: 'settings.two-step-authentication.recovery-codes',

  events: {
    'click .copy-option': preventDefaultThen('copyCodes'),
    'click .download-option': 'downloadCodes',
    'click .print-option': preventDefaultThen('printCodes'),
    'click .replace-codes-link': preventDefaultThen('_replaceRecoveryCodes'),
    'click .two-step-authentication-done': preventDefaultThen(
      'showConfirmationForm'
    ),
    'click .recovery-confirm-code': preventDefaultThen('verifyCode'),
    'click .recovery-back': preventDefaultThen('hideConfirmationForm'),
  },

  _returnToTwoStepAuthentication() {
    // If this view was navigated from `sign_in_recovery_code`, that
    // means that the user came here to generate new recovery codes,
    // continue the sign-in process after generating.
    if (this.model.get('previousViewName') === 'sign_in_recovery_code') {
      const account = this.getSignedInAccount();
      return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
    }

    this.onSetupComplete(() => {
      this.navigate('settings/two_step_authentication');
    });
  },

  _replaceRecoveryCodes() {
    const account = this.getSignedInAccount();
    return account.replaceRecoveryCodes().then(result => {
      this.setupRecoveryCodes(
        result.recoveryCodes,
        t('New recovery codes generated')
      );
    });
  },

  beforeRender() {
    if (!this.verifyTotpStatus()) {
      this.navigate('settings/two_step_authentication');
    }
  },

  initialize() {
    this.setupRecoveryCodes(this.model.get('recoveryCodes'));
    this.listenTo(this.model, 'change', this.render);
  },
});

Cocktail.mixin(
  View,
  ModalSettingsPanelMixin,
  RecoveryCodesMixin,
  SaveOptionsMixin,
  UserAgentMixin
);

export default View;
