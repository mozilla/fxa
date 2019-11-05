/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import BaseView from '../../base';
import SettingsPanelMixin from '../../mixins/settings-panel-mixin';
import Template from 'templates/settings/account_recovery/account_recovery.mustache';
import showProgressIndicator from '../../decorators/progress_indicator';
import LastCheckedTimeMixin from '../../mixins/last-checked-time-mixin';
import UpgradeSessionMixin from '../../mixins/upgrade-session-mixin';

const t = msg => msg;

const CODE_REFRESH_SELECTOR = 'button.settings-button.refresh-status';
const CODE_REFRESH_DELAY_MS = 350;
const ACCOUNT_RECOVERY_SUPPORT_URL =
  'https://support.mozilla.org/kb/reset-your-firefox-account-password-recovery-keys';

const View = BaseView.extend({
  template: Template,
  className: 'account-recovery',
  viewName: 'settings.account-recovery',

  events: {
    'click .account-recovery-support-link': '_clickedSupportLink',
    'click .confirm-password': '_confirmPassword',
    'click .confirm-revoke': '_confirmRevoke',
    'click .refresh-status': 'refresh',
  },

  _clickedSupportLink() {
    this.logFlowEvent('clicked-support-link', this.viewName);
  },

  _confirmPassword() {
    this.navigate('settings/account_recovery/confirm_password');
  },

  _confirmRevoke() {
    this.navigate('settings/account_recovery/confirm_revoke');
  },

  initialize() {
    this.listenTo(this.model, 'change:hasRecoveryKey', this.render);
  },

  beforeRender() {
    const account = this.getSignedInAccount();
    return this.setupSessionGateIfRequired().then(isEnabled => {
      if (isEnabled) {
        return account.checkRecoveryKeyExists().then(status => {
          this.model.set('hasRecoveryKey', status.exists);
        });
      }
    });
  },

  setInitialContext(context) {
    const hasRecoveryKey = this.model.get('hasRecoveryKey');
    context.set({
      escapedLearnMoreLinkAttributes: `class="account-recovery-support-link" target="_blank" href="${encodeURI(
        ACCOUNT_RECOVERY_SUPPORT_URL
      )}"`,
      hasRecoveryKey: !! hasRecoveryKey,
      isPanelOpen: this.isPanelOpen(),
    });

    this.metrics.logUserPreferences(this.className, !!hasRecoveryKey);
  },

  refresh: showProgressIndicator(
    function() {
      this.setLastCheckedTime();
      this.logFlowEvent('refresh', this.viewName);
      return this.render();
    },
    CODE_REFRESH_SELECTOR,
    CODE_REFRESH_DELAY_MS
  ),
});

Cocktail.mixin(
  View,
  UpgradeSessionMixin({
    gatedHref: 'settings/account_recovery',
    title: t('Account Recovery'),
  }),
  SettingsPanelMixin,
  LastCheckedTimeMixin
);

export default View;
