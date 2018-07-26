/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import BaseView from '../../base';
import SettingsPanelMixin from '../../mixins/settings-panel-mixin';
import Template from 'templates/settings/account_recovery/account_recovery.mustache';
import showProgressIndicator from '../../decorators/progress_indicator';
import LastCheckedTimeMixin from '../../mixins/last-checked-time-mixin';

const CODE_REFRESH_SELECTOR = 'button.settings-button.refresh-status';
const CODE_REFRESH_DELAY_MS = 350;
const ACCOUNT_RECOVERY_SUPPORT_URL = '#';

const View = BaseView.extend({
  template: Template,
  className: 'account-recovery',
  viewName: 'settings.account-recovery',

  events: {
    'click .confirm-password': '_confirmPassword',
    'click .confirm-revoke': '_confirmRevoke',
    'click .refresh-status': 'refresh'
  },

  _confirmPassword() {
    this.navigate('settings/account_recovery/confirm_password');
  },

  _confirmRevoke() {
    this.navigate('settings/account_recovery/confirm_revoke');
  },

  _isPanelEnabled() {
    if (this.broker.hasCapability('showAccountRecovery')) {
      return true;
    }
    return false;
  },

  initialize() {
    this.listenTo(this.model, 'change:hasRecoveryKey', this.render);
  },

  beforeRender() {
    const account = this.getSignedInAccount();
    if (! this._isPanelEnabled()) {
      return this.remove();
    }

    return account.checkRecoveryKeyExists()
      .then((status) => {
        this.model.set('hasRecoveryKey', status.exists);
      });
  },

  setInitialContext(context) {
    const hasRecoveryKey = this.model.get('hasRecoveryKey');
    context.set({
      escapedLearnMoreLinkAttributes: `target="_blank" href="${encodeURI(ACCOUNT_RECOVERY_SUPPORT_URL)}"`,
      hasRecoveryKey: !! hasRecoveryKey,
      isPanelOpen: this.isPanelOpen(),
    });
  },

  refresh: showProgressIndicator(function () {
    this.setLastCheckedTime();
    return this.render();
  }, CODE_REFRESH_SELECTOR, CODE_REFRESH_DELAY_MS)
});

Cocktail.mixin(
  View,
  SettingsPanelMixin,
  LastCheckedTimeMixin
);

module.exports = View;
