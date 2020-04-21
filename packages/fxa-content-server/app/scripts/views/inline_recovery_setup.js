/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from 'lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import ErrorRedirectMixin from './mixins/error-redirect-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import preventDefaultThen from './decorators/prevent_default_then';
import RecoveryCodesMixin from './mixins/recovery-codes-mixin';
import SaveOptionsMixin from './mixins/save-options-mixin';
import ServiceMixin from './mixins/service-mixin';
import TimerMixin from './mixins/timer-mixin';
import UserAgentMixin from '../lib/user-agent-mixin';

import Template from 'templates/inline_recovery_setup.mustache';

var View = FormView.extend({
  template: Template,
  className: 'inline-recovery-setup',
  viewName: 'inline-recovery-setup',

  events: {
    'click .copy-option': preventDefaultThen('copyCodes'),
    'click .download-option': 'downloadCodes',
    'click .print-option': preventDefaultThen('printCodes'),
    'click .recovery-setup-done': preventDefaultThen('showConfirmationForm'),
    'click .recovery-confirm-code': preventDefaultThen('verifyCode'),
    'click .recovery-back': preventDefaultThen('hideConfirmationForm'),
    'click .recovery-cancel': preventDefaultThen('_cancel'),
  },

  _returnToTwoStepAuthentication() {
    this.onSetupComplete(() => {
      // Pause for a bit to allow to user to notice and read the success UI.
      return this.setTimeout(() => {
        const account = this.getSignedInAccount();
        this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      }, 500);
    });
  },

  // If the user cancels out of the flow, redirect back to the RP with
  // an error message that's easy to parse. The user will need to be shown
  // the 2FA-required instructions again.
  _cancel() {
    const err = AuthErrors.toError('TOTP_REQUIRED');
    this.redirectWithErrorCode(err);
  },

  beforeRender() {
    if (!this.verifyTotpStatus()) {
      this.navigate('inline_totp_setup');
    }
  },

  initialize() {
    this.setupRecoveryCodes(this.model.get('recoveryCodes'));
    this.listenTo(this.model, 'change', this.render);
  },
});

Cocktail.mixin(
  View,
  BackMixin,
  ErrorRedirectMixin,
  FlowEventsMixin,
  RecoveryCodesMixin,
  SaveOptionsMixin,
  ServiceMixin,
  TimerMixin,
  UserAgentMixin
);

export default View;
