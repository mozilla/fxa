/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const $ = require('jquery');
const Cocktail = require('cocktail');
const FormView = require('../form');
const ModalSettingsPanelMixin = require('../mixins/modal-settings-panel-mixin');
const Template = require('templates/settings/recovery_codes.mustache');
const RecoveryCodePrintTemplate = require('templates/settings/recovery_codes_print.mustache');
const RecoveryCode = require('../../models/recovery-code');
const UserAgentMixin = require('../../lib/user-agent-mixin');

const {preventDefaultThen, t} = FormView;

const View = FormView.extend({
  template: Template,
  className: 'recovery-codes',
  viewName: 'settings.two-step-authentication.recovery-codes',

  events: {
    'click .copy-codes': preventDefaultThen('_copyCodes'),
    'click .download-codes': '_downloadCodes',
    'click .print-codes': preventDefaultThen('_printCodes'),
    'click .replace-codes-link': preventDefaultThen('_replaceRecoveryCodes'),
    'click .two-step-authentication-done': preventDefaultThen('_returnToTwoStepAuthentication')
  },

  _returnToTwoStepAuthentication() {
    // If this view was navigated from `sign_in_recovery_code`, that
    // means that the user came here to generate new recovery codes,
    // continue the sign-in process after generating.
    if (this.model.get('previousViewName') === 'sign_in_recovery_code') {
      const account = this.getSignedInAccount();
      return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
    }
    this.navigate('settings/two_step_authentication');
  },

  _getFormatedRecoveryCodeFilename() {
    const account = this.getSignedInAccount();
    let formattedFilename = account.get('email') + ' ' + t('Firefox Recovery Codes');
    if (formattedFilename.length > 200) { // 200 bytes (close to filesystem max) - 4 for '.txt' extension
      formattedFilename = formattedFilename.substring(0, 196);
    }
    return `${formattedFilename}.txt`;
  },

  _copyCodes() {
    // This copies the recovery codes to clipboard by creating a tiny transparent
    // textArea with recovery code contents. Then it executes the
    // browser `copy` command and removes textArea.
    $('<textArea id=\"recovery-code-copy\" class=\"recovery-code-text-area\"></textArea>').appendTo('#recovery-codes');
    this.$('textArea.recovery-code-text-area').html(this.recoveryCodesText);

    if (this.getUserAgent().isIos()) {
      // iOS does not allow you to directly use the `document.execCommand('copy')` function.
      // The text area must have contentEditable=true and have a range selected before you can copy.
      // https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
      const el = this.window.document.getElementById('recovery-code-copy');
      el.contentEditable = true;
      // convert to readonly to stop iOS keyboard opening
      el.readOnly = true;
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = this.window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el.setSelectionRange(0, 999999);
    } else {
      this.$('textArea.recovery-code-text-area').select().focus();
    }

    try {
      this.window.document.execCommand('copy');
      this._displaySuccess(t('Codes copied'));
    } catch (err) {
      this._displayError(t('Failed to copy codes. Please manually copy them.'));
    }
    this.$('textArea.recovery-code-text-area').remove();
  },

  _downloadCodes() {
    // This dynamically creates a link with a blob data of the recovery
    // codes, clicks it to initiate download and then removes element.
    const codeBlob = new Blob([this.recoveryCodesText], {type: 'text/plain'});
    const href = URL.createObjectURL(codeBlob);
    const template = `
      <a id="recovery-code-download-link" href="${href}" download="${this._getFormatedRecoveryCodeFilename()}"></a>
    `;
    $(template).appendTo('#recovery-codes');
    this.window.document.getElementById('recovery-code-download-link').click();
    this.$('#recovery-code-download-link').remove();
  },

  _printCodes() {
    // We dynamically create a new window with recovery codes and attempt to
    // print it.
    const printWindow = this.window.open('', 'Print', 'height=600,width=800');
    const recoveryCodes = this.recoveryCodes.map((code) => {
      return new RecoveryCode({code}).toJSON();
    });
    const template = RecoveryCodePrintTemplate({recoveryCodes});
    printWindow.document.write(template);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  },

  _displaySuccess(msg) {
    this.$('.error').addClass('hidden');
    this.$('.modal-success').removeClass('hidden');
    this.$('.modal-success').html(msg);
  },

  _displayError(msg) {
    this.$('.error').removeClass('hidden');
    this.$('.modal-success').addClass('hidden');
    this.$('.error').html(msg);
  },

  _replaceRecoveryCodes() {
    const account = this.getSignedInAccount();
    return account.replaceRecoveryCodes()
      .then((result) => {
        this._setupRecoveryCodes(result.recoveryCodes, t('New recovery codes generated'));
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

  initialize() {
    this._setupRecoveryCodes(this.model.get('recoveryCodes'));
    this.listenTo(this.model, 'change', this.render);
  },

  setInitialContext(context) {
    let recoveryCodes = this.model.get('recoveryCodes');
    if (recoveryCodes) {
      recoveryCodes = recoveryCodes.map((code) => {
        return new RecoveryCode({code}).toJSON();
      });
    } else {
      recoveryCodes = [];
    }

    let modalSuccessMsg = this.model.get('modalSuccessMsg');
    if (! modalSuccessMsg) {
      if (recoveryCodes.length > 0) {
        modalSuccessMsg = t('Two-step authentication enabled');
      }
    }

    context.set({
      isIos: this.getUserAgent().isIos(),
      modalSuccessMsg,
      recoveryCodes,
      showRecoveryCodes: recoveryCodes.length > 0
    });
  }
});

Cocktail.mixin(
  View,
  ModalSettingsPanelMixin,
  UserAgentMixin
);

module.exports = View;

