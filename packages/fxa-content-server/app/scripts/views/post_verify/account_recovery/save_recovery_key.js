/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 */
import Cocktail from 'cocktail';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import FormView from '../../form';
import PrintTemplate from 'templates/settings/account_recovery/recovery_key_print_template.mustache';
import ServiceMixin from '../..//mixins/service-mixin';
import SaveOptionsMixin from '../../mixins/save-options-mixin';
import RecoveryKeyMixin from '../../mixins/recovery-key-mixin';
import Template from 'templates/post_verify/account_recovery/save_recovery_key.mustache';
import { assign } from 'underscore';

const ACCOUNT_RECOVERY_ELEMENT = '.save-recovery-key';

class SaveRecoveryKey extends FormView {
  template = Template;
  viewName = 'save-recovery-key';

  events = assign(this.events, {
    'click .download-option': '_downloadKey',
    'click .copy-option': '_copyKey',
    'click .print-option': '_printKey',
    'click .done-link': 'done',
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }
  }

  _copyKey() {
    return this.copy(this.recoveryKey, ACCOUNT_RECOVERY_ELEMENT);
  }

  _downloadKey() {
    this.download(
      this.recoveryKey,
      this.getFormatedRecoveryKeyFilename(),
      ACCOUNT_RECOVERY_ELEMENT
    );
  }

  _printKey() {
    this.print(PrintTemplate({ recoveryKey: this.recoveryKey }));
  }

  setInitialContext(context) {
    console.log('setInitialContext', context);
    this.recoveryKey = context.get('recoveryKey');
    this.recoveryKeyId = context.get('recoveryKeyId');
    context.set({
      isIos: this.getUserAgent().isIos(),
      recoveryKey: this.formatRecoveryKey(context.get('recoveryKey')),
    });
  }

  done() {
    this.navigate('/post_verify/account_recovery/confirm_recovery_key', {
      recoveryKey: this.recoveryKey,
      recoveryKeyId: this.recoveryKeyId,
    });
  }
}

Cocktail.mixin(
  SaveRecoveryKey,
  FlowEventsMixin,
  ServiceMixin,
  SaveOptionsMixin,
  RecoveryKeyMixin
);

export default SaveRecoveryKey;
