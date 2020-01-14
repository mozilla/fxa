/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import BaseView from '../../base';
import ModalSettingsPanelMixin from '../../mixins/modal-settings-panel-mixin';
import PrintTemplate from 'templates/settings/account_recovery/recovery_key_print_template.mustache';
import RecoveryKeyMixin from '../../mixins/recovery-key-mixin';
import SaveOptionsMixin from '../../mixins/save-options-mixin';
import Template from 'templates/settings/account_recovery/recovery_key.mustache';
import UserAgentMixin from '../../../lib/user-agent-mixin';

const ACCOUNT_RECOVERY_ELEMENT = '#account-recovery-key';

const View = BaseView.extend({
  template: Template,
  className: 'account-recovery-key',
  viewName: 'settings.account-recovery.recovery-key',

  events: {
    'click .copy-option': '_copyKey',
    'click .done-link': '_done',
    'click .download-option': '_downloadKey',
    'click .print-option': '_printKey',
  },

  _copyKey() {
    this.logFlowEvent('copy-option', this.viewName);
    return this.copy(this.recoveryKey, ACCOUNT_RECOVERY_ELEMENT);
  },

  _downloadKey() {
    this.logFlowEvent('download-option', this.viewName);
    this.download(
      this.recoveryKey,
      this.getFormatedRecoveryKeyFilename(),
      ACCOUNT_RECOVERY_ELEMENT
    );
  },

  _printKey() {
    this.logFlowEvent('print-option', this.viewName);
    this.print(PrintTemplate({ recoveryKey: this.recoveryKey }));
  },

  _done() {
    this.navigate('settings/account_recovery', { hasRecoveryKey: true });
  },

  setInitialContext(context) {
    this.recoveryKey = this.formatRecoveryKey(context.get('recoveryKey'));
    context.set({
      isIos: this.getUserAgent().isIos(),
      recoveryKey: this.recoveryKey,
    });
  },

  beforeRender() {
    const account = this.getSignedInAccount();
    return account.checkRecoveryKeyExists().then(status => {
      if (!status.exists) {
        this.navigate('/settings/account_recovery');
      } else {
        this.recoveryKey = this.model.get('recoveryKey');
      }
    });
  },
});

Cocktail.mixin(
  View,
  ModalSettingsPanelMixin,
  RecoveryKeyMixin,
  SaveOptionsMixin,
  UserAgentMixin
);

export default View;
