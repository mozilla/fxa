/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from '../../mixins/flow-events-mixin';
import FormView from '../../form';
import PasswordMixin from '../../mixins/password-mixin';
import preventDefaultThen from '../../decorators/prevent_default_then';
import ModalSettingsPanelMixin from '../../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/account_recovery/confirm_revoke.mustache';

const t = msg => msg;

const View = FormView.extend({
  template: Template,
  className: 'account-recovery-confirm-revoke',
  viewName: 'settings.account-recovery.confirm-revoke',

  events: _.extend({}, FormView.prototype.events, {
    'click .cancel-button': preventDefaultThen('_returnToAccountRecovery'),
  }),

  beforeRender() {
    const account = this.getSignedInAccount();
    return account.checkRecoveryKeyExists().then(status => {
      if (!status.exists) {
        this.navigate('/settings/account_recovery');
      }
    });
  },

  submit() {
    const account = this.getSignedInAccount();
    return account.deleteRecoveryKey().then(() => {
      this.displaySuccess(t('Account recovery revoked'));
      this.logFlowEvent('success', this.viewName);
      this.navigate('settings/account_recovery', {
        hasRecoveryKey: false,
      });
    });
  },
});

Cocktail.mixin(View, FlowEventsMixin, ModalSettingsPanelMixin, PasswordMixin);

export default View;
