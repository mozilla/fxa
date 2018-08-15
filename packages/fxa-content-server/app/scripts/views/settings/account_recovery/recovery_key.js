/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Cocktail from 'cocktail';
import BaseView from '../../base';
import ModalSettingsPanelMixin from '../../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/account_recovery/recovery_key.mustache';
import RecoveryKeyPrintTemplate from 'templates/settings/account_recovery/recovery_key_print.mustache';

const {t} = BaseView;

const View = BaseView.extend({
  template: Template,
  className: 'account-recovery-key',
  viewName: 'settings.account-recovery.recovery-key',

  events: {
    'click .done-link': '_done',
    'click .download-key': '_downloadKey',
    'click .print-key': '_printKey'
  },

  _formatRecoveryKey(key) {
    if (key) {
      // Insert spaces every 4 characters and remove trailing space
      return key.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '');
    }
  },

  _getFormatedRecoveryKeyFilename() {
    const account = this.getSignedInAccount();
    let formattedFilename = account.get('email') + ' ' + t('Firefox Recovery Key');
    if (formattedFilename.length > 200) { // 200 bytes (close to filesystem max) - 4 for '.txt' extension
      formattedFilename = formattedFilename.substring(0, 196);
    }
    return `${formattedFilename}.txt`;
  },

  _downloadKey() {
    // This dynamically creates a link with a blob data of the recovery
    // codes, clicks it to initiate download and then removes element.
    const codeBlob = new Blob([this.recoveryKey], {type: 'text/plain'});
    const href = URL.createObjectURL(codeBlob);
    const template = `
      <a id="recovery-key-download-link" href="${href}" download="${this._getFormatedRecoveryKeyFilename()}"></a>
    `;
    $(template).appendTo('#account-recovery-key');
    this.window.document.getElementById('recovery-key-download-link').click();
    this.$('#recovery-key-download-link').remove();
    this.logFlowEvent('download-key', this.viewName);
  },

  _printKey() {
    // We dynamically create a new window with recovery key and attempt to
    // print it.
    const printWindow = this.window.open('', 'Print', 'height=600,width=800');
    const template = RecoveryKeyPrintTemplate({recoveryKey: this.recoveryKey});
    printWindow.document.write(template);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    this.logFlowEvent('print-key', this.viewName);
  },

  _done() {
    this.navigate('settings/account_recovery', {
      hasRecoveryKey: true
    });
  },

  setInitialContext(context) {
    this.recoveryKey = this._formatRecoveryKey(context.get('recoveryKey'));
    context.set({
      recoveryKey: this.recoveryKey
    });
  },

  beforeRender() {
    const account = this.getSignedInAccount();
    return account.checkRecoveryKeyExists()
      .then((status) => {
        if (! status.exists) {
          this.navigate('/settings/account_recovery');
        } else {
          this.recoveryKey = this.model.get('recoveryKey');
        }
      });
  },
});

Cocktail.mixin(
  View,
  ModalSettingsPanelMixin
);

module.exports = View;

