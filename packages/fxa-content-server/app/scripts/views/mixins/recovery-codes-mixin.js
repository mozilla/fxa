/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared code used by recovery key setup step, the second part of TOTP setup.
// Shared by views in login flow and settings page.

import AuthErrors from 'lib/auth-errors';
import { getCode } from '../../lib/crypto/totp';
import RecoveryCode from '../../models/recovery-code';
import RecoveryCodePrintTemplate from 'templates/settings/recovery_codes_print.mustache';
import SaveOptionsMixin from './save-options-mixin';

const RECOVERY_CODE_ELEMENT = '#recovery-codes';

const t = (msg) => msg;

export default {
  dependsOn: [SaveOptionsMixin],

  copyCodes() {
    this.logFlowEvent('copy-option', this.viewName);
    return this.copy(this.recoveryCodesText, RECOVERY_CODE_ELEMENT);
  },

  downloadCodes() {
    this.logFlowEvent('download-option', this.viewName);
    this.download(
      this.recoveryCodesText,
      this.getFormatedRecoveryCodeFilename(),
      RECOVERY_CODE_ELEMENT
    );
  },

  printCodes() {
    this.logFlowEvent('print-option', this.viewName);
    const recoveryCodes = this.recoveryCodes.map((code) => {
      return new RecoveryCode({ code }).toJSON();
    });
    this.print(RecoveryCodePrintTemplate({ recoveryCodes }));
  },

  showConfirmationForm() {
    if (this.model.get('totpSecret')) {
      this.model.set('showConfirmation', true);
      this.render();
    } else {
      this._returnToTwoStepAuthentication();
    }
  },

  hideConfirmationForm() {
    this.model.set('showConfirmation', false);
    this.render();
  },

  verifyCode() {
    const input = this.getElementValue('input.recovery-code');
    const codes = this.model.get('recoveryCodes');
    if (!codes.includes(input.toLowerCase())) {
      const e =
        input.length > 0 ? 'INVALID_RECOVERY_CODE' : 'RECOVERY_CODE_REQUIRED';
      return this.showValidationError(
        this.$('input.recovery-code'),
        AuthErrors.toError(e)
      );
    }

    this._returnToTwoStepAuthentication();
  },

  getFormatedRecoveryCodeFilename() {
    const account = this.getSignedInAccount();
    let formattedFilename =
      account.get('email') + ' ' + t('Firefox Recovery Codes');
    if (formattedFilename.length > 200) {
      // 200 bytes (close to filesystem max) - 4 for '.txt' extension
      formattedFilename = formattedFilename.substring(0, 196);
    }
    return `${formattedFilename}.txt`;
  },

  setupRecoveryCodes(codes, msg) {
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

  setInitialContext(context) {
    let recoveryCodes = this.model.get('recoveryCodes');
    if (recoveryCodes) {
      recoveryCodes = recoveryCodes.map((code) => {
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

  verifyTotpStatus() {
    const account = this.getSignedInAccount();
    return account.checkTotpTokenExists().then((result) => {
      return !!(
        result.exists &&
        result.verified &&
        this.model.get('recoveryCodes')
      );
    });
  },

  onSetupComplete(done) {
    const totpSecret = this.model.get('totpSecret');
    const account = this.getSignedInAccount();
    if (totpSecret) {
      return getCode(totpSecret)
        .then((code) => {
          return account.verifyTotpCode(code, this.relier.get('service'));
        })
        .then(() =>
          this.displaySuccess(t('Two-step authentication enabled'), {})
        )
        .then(done, (err) => this.displayError(err));
    }
    done();
  },
};
