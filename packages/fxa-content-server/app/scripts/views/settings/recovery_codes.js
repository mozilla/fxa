/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import AuthErrors from 'lib/auth-errors';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/recovery_codes.mustache';
import RecoveryCodePrintTemplate from 'templates/settings/recovery_codes_print.mustache';
import RecoveryCode from '../../models/recovery-code';
import preventDefaultThen from '../decorators/prevent_default_then';
import SaveOptionsMixin from '../mixins/save-options-mixin';
import UserAgentMixin from '../../lib/user-agent-mixin';
import { getCode } from '../../lib/crypto/totp';

const t = msg => msg;

const RECOVERY_CODE_ELEMENT = '#recovery-codes';

const View = FormView.extend({
  template: Template,
  className: 'recovery-codes',
  viewName: 'settings.two-step-authentication.recovery-codes',

  events: {
    'click .copy-option': preventDefaultThen('_copyCodes'),
    'click .download-option': '_downloadCodes',
    'click .print-option': preventDefaultThen('_printCodes'),
    'click .replace-codes-link': preventDefaultThen('_replaceRecoveryCodes'),
    'click .two-step-authentication-done': preventDefaultThen(
      '_showConfirmationForm'
    ),
    'click .recovery-confirm-code': preventDefaultThen('_verifyCode'),
    'click .recovery-back': preventDefaultThen('_hideConfirmationForm'),
  },

  _returnToTwoStepAuthentication() {
    // If this view was navigated from `sign_in_recovery_code`, that
    // means that the user came here to generate new recovery codes,
    // continue the sign-in process after generating.
    if (this.model.get('previousViewName') === 'sign_in_recovery_code') {
      const account = this.getSignedInAccount();
      return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
    }
    const totpSecret = this.model.get('totpSecret');
    const done = () => {
      this.navigate('settings/two_step_authentication');
    };
    if (totpSecret) {
      return getCode(totpSecret)
        .then(code => {
          const account = this.getSignedInAccount();
          return account.verifyTotpCode(code, this.relier.get('service'));
        })
        .then(() =>
          this.displaySuccess(t('Two-step authentication enabled'), {})
        )
        .then(done, err => this.displayError(err));
    }
    done();
  },

  _showConfirmationForm() {
    if (this.model.get('totpSecret')) {
      this.model.set('showConfirmation', true);
      this.render();
    } else {
      this._returnToTwoStepAuthentication();
    }
  },

  _hideConfirmationForm() {
    this.model.set('showConfirmation', false);
    this.render();
  },

  _verifyCode() {
    const input = this.getElementValue('input.recovery-code');
    const codes = this.model.get('recoveryCodes');
    if (!codes.includes(input.toLowerCase())) {
      return this.showValidationError(
        this.$('input.recovery-code'),
        AuthErrors.toError('INVALID_RECOVERY_CODE')
      );
    }

    this._returnToTwoStepAuthentication();
  },

  _getFormatedRecoveryCodeFilename() {
    const account = this.getSignedInAccount();
    let formattedFilename =
      account.get('email') + ' ' + t('Firefox Recovery Codes');
    if (formattedFilename.length > 200) {
      // 200 bytes (close to filesystem max) - 4 for '.txt' extension
      formattedFilename = formattedFilename.substring(0, 196);
    }
    return `${formattedFilename}.txt`;
  },

  _copyCodes() {
    this.logFlowEvent('copy-option', this.viewName);
    return this.copy(this.recoveryCodesText, RECOVERY_CODE_ELEMENT);
  },

  _downloadCodes() {
    this.logFlowEvent('download-option', this.viewName);
    this.download(
      this.recoveryCodesText,
      this._getFormatedRecoveryCodeFilename(),
      RECOVERY_CODE_ELEMENT
    );
  },

  _printCodes() {
    this.logFlowEvent('print-option', this.viewName);
    const recoveryCodes = this.recoveryCodes.map(code => {
      return new RecoveryCode({ code }).toJSON();
    });
    this.print(RecoveryCodePrintTemplate({ recoveryCodes }));
  },

  _replaceRecoveryCodes() {
    const account = this.getSignedInAccount();
    return account.replaceRecoveryCodes().then(result => {
      this._setupRecoveryCodes(
        result.recoveryCodes,
        t('New recovery codes generated')
      );
    });
  },

  _setupRecoveryCodes(codes, msg) {
    // Store a readable version of recovery codes so that they can
    // be copied, printed and downloaded
    this.recoveryCodesText = '';
    if (codes) {
      this.recoveryCodes = codes;
      this.recoveryCodesText = this.recoveryCodes.join(' \r\n');
      this.model.set('recoveryCodes', codes);

      if (msg) {
        this.model.set('modalSuccessMsg', msg);
      }
    }
  },

  beforeRender() {
    const account = this.getSignedInAccount();
    return account.checkTotpTokenExists().then(result => {
      if (!result.exists) {
        this.navigate('settings/two_step_authentication');
      }
      if (!result.verified && !this.model.get('recoveryCodes')) {
        this.navigate('settings/two_step_authentication');
      }
    });
  },

  initialize() {
    this._setupRecoveryCodes(this.model.get('recoveryCodes'));
    this.listenTo(this.model, 'change', this.render);
  },

  setInitialContext(context) {
    let recoveryCodes = this.model.get('recoveryCodes');
    if (recoveryCodes) {
      recoveryCodes = recoveryCodes.map(code => {
        return new RecoveryCode({ code }).toJSON();
      });
    } else {
      recoveryCodes = [];
    }

    const modalSuccessMsg = this.model.get('modalSuccessMsg');

    context.set({
      isIos: this.getUserAgent().isIos(),
      // There can be several modalSuccessMsg's, make sure they are translated
      // before displaying to the user user. See #6728
      modalSuccessMsg: modalSuccessMsg && this.translate(modalSuccessMsg),
      recoveryCodes,
      showRecoveryCodes: recoveryCodes.length > 0,
    });
  },
});

Cocktail.mixin(View, ModalSettingsPanelMixin, SaveOptionsMixin, UserAgentMixin);

export default View;
