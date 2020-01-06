/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import allowOnlyOneSubmit from './decorators/allow_only_one_submit';
import AccountByUidMixin from './mixins/account-by-uid-mixin';
import AccountRecoveryView from './settings/account_recovery/account_recovery';
import AccountRecoveryConfirmPasswordView from './settings/account_recovery/confirm_password';
import AccountRecoveryConfirmRevokeView from './settings/account_recovery/confirm_revoke';
import AccountRecoveryKeyView from './settings/account_recovery/recovery_key';
import AvatarCameraView from './settings/avatar_camera';
import AvatarChangeView from './settings/avatar_change';
import AvatarCropView from './settings/avatar_crop';
import AvatarMixin from './mixins/avatar-mixin';
import AvatarView from './settings/avatar';
import BaseView from './base';
import ChangePasswordView from './settings/change_password';
import ClientDisconnectView from './settings/client_disconnect';
import ClientsView from './settings/clients';
import Cocktail from 'cocktail';
import CommunicationPreferencesView from './settings/communication_preferences';
import Constants from '../lib/constants';
import DeleteAccountView from './settings/delete_account';
import DisplayNameView from './settings/display_name';
import Duration from 'duration';
import EmailsView from './settings/emails';
import LoadingMixin from './mixins/loading-mixin';
import 'modal';
import preventDefaultThen from './decorators/prevent_default_then';
import SettingsHeaderTemplate from 'templates/partial/settings-header.mustache';
import SignedOutNotificationMixin from './mixins/signed-out-notification-mixin';
import SubPanels from './sub_panels';
import SubscriptionView from './settings/subscription';
import Template from 'templates/settings.mustache';
import UserAgentMixin from '../lib/user-agent-mixin';

import TwoStepAuthenticationView from './settings/two_step_authentication';
import TotpSecretView from './settings/totp_secret';
import RecoveryCodesView from './settings/recovery_codes';

var PANEL_VIEWS = [
  AvatarView,
  DisplayNameView,
  SubscriptionView,
  EmailsView,
  AccountRecoveryView,
  AccountRecoveryConfirmPasswordView,
  AccountRecoveryConfirmRevokeView,
  AccountRecoveryKeyView,
  TwoStepAuthenticationView,
  TotpSecretView,
  RecoveryCodesView,
  ClientsView,
  ClientDisconnectView,
  ChangePasswordView,
  DeleteAccountView,
  AvatarChangeView,
  AvatarCropView,
  AvatarCameraView,
  CommunicationPreferencesView,
];

const proto = BaseView.prototype;
const View = BaseView.extend({
  template: Template,
  className: 'settings',
  layoutClassName: 'settings',
  viewName: 'settings',

  mustVerify: true,

  initialize(options = {}) {
    this._childView = options.childView;
    this._createView = options.createView;
    this._experimentGroupingRules = options.experimentGroupingRules;
    this._language = options.config.lang;
    this._marketingEmailEnabled = options.marketingEmailEnabled !== false;
    this._subscriptionsManagementEnabled =
      options.subscriptionsManagementEnabled !== false;

    this.getUidAndSetSignedInAccount();
  },

  notifications: {
    'navigate-from-child-view': '_onNavigateFromChildView',
  },

  setInitialContext(context) {
    const account = this.getSignedInAccount();

    context.set({
      ccExpired: !!this._ccExpired,
      escapedCcExpiredLinkAttrs: 'href="/subscriptions" class="alert-link"',
      securityEventsVisible: this.displaySecurityEvents(),
      showSignOut: !account.isFromSync(),
      unsafeHeaderHTML: this._getHeaderHTML(account),
    });
  },

  events: {
    'click #signout': preventDefaultThen('signOut'),
  },

  // Triggered by AvatarMixin
  onProfileUpdate() {
    this._showAvatar();
  },

  showChildView(ChildView, options) {
    return this._subPanels.showChildView(ChildView, options);
  },

  // When we navigate to settings from a childView
  // close the modal, show any ephemeral messages passed to `navigate`
  _onNavigateFromChildView() {
    if ($.modal.isActive()) {
      $.modal.close();
    } else if (this.currentPage.indexOf('settings') >= 0) {
      // Close all panels if the event came from any settings view.
      $('.settings-unit').removeClass('open');
    }
    this.displayStatusMessages();
  },

  beforeRender() {
    const account = this.getSignedInAccount();

    return Promise.all([account.fetchProfile(), account.settingsData()])
      .then(([, data]) => {
        if (data && Array.isArray(data.subscriptions)) {
          this._ccExpired = data.subscriptions.some(
            s => s.failure_code === Constants.CC_EXPIRED
          );
        }
      })
      .catch(err => {
        this.model.set('error', err);
      });
  },

  _onAccountUpdate(account) {
    this.$('#fxa-settings-profile-header').html(this._getHeaderHTML(account));
  },

  _getHeaderHTML(account) {
    return SettingsHeaderTemplate(account.pick('displayName', 'email'));
  },

  afterRender() {
    const account = this.getSignedInAccount();

    this.listenTo(account, 'change:displayName', this._onAccountUpdate);
    this.listenTo(account, 'change:email', this._onAccountUpdate);

    this.logViewEvent(
      'communication-prefs-link.visible.' +
        String(this._areCommunicationPrefsVisible())
    );

    const subPanels = this._initializeSubPanels(this.$('#sub-panels')[0]);
    return subPanels.render().then(proto.afterRender.bind(this));
  },

  afterVisible() {
    // Clients may link to the settings page with a `setting` query param
    // so that that field can be displayed/focused.
    if (this.relier.get('setting') === 'avatar') {
      this.relier.set('setting', null);
      this.navigate('settings/avatar/change');
    }

    return proto.afterVisible.call(this).then(this._showAvatar.bind(this));
  },

  _setupAvatarChangeLinks() {
    if (this.supportsAvatarUpload()) {
      this.$('.avatar-wrapper > *').wrap(
        '<a href="/settings/avatar/change" class="change-avatar"></a>'
      );
    } else {
      this.$('.avatar-wrapper').addClass('nohover');
    }
  },

  _showAvatar() {
    var account = this.getSignedInAccount();
    return this.displayAccountProfileImage(account).then(() =>
      this._setupAvatarChangeLinks()
    );
  },

  /**
   * Initialize the SubPanels view if not already initialized
   *
   * @param {Object} rootEl root element for SubPanels view.
   * @returns {Object} SubPanels instance
   * @private
   */
  _initializeSubPanels(rootEl) {
    if (!this._subPanels) {
      this._subPanels = new SubPanels({
        createView: this._createView,
        el: rootEl,
        initialChildView: this._childView,
        panelViews: this._getPanelsToDisplay(),
        parent: this,
      });
    }

    return this._subPanels;
  },

  /**
   * Get the panels to display.
   *
   * @returns {Object[]} Array of views to display.
   * @private
   */
  _getPanelsToDisplay() {
    const areCommunicationPrefsVisible = this._areCommunicationPrefsVisible();
    return PANEL_VIEWS.filter(ChildView => {
      if (ChildView === CommunicationPreferencesView) {
        return areCommunicationPrefsVisible;
      }
      if (ChildView === SubscriptionView) {
        return this._subscriptionsManagementEnabled;
      }
      return true;
    });
  },

  /**
   * Should the communication preferences panel be displayed?
   *
   * @returns {Boolean}
   * @private
   */
  _areCommunicationPrefsVisible() {
    if (!this._marketingEmailEnabled) {
      return false;
    }

    if (
      !this._experimentGroupingRules.choose('communicationPrefsVisible', {
        lang: this.navigator.language,
      })
    ) {
      return false;
    }

    // Firefox for iOS cannot link out to the basket. Disable
    // the view until we figure out a good solution. See
    // https://github.com/mozilla/fxa-content-server/pull/5551
    if (this.getUserAgent().isFirefoxIos()) {
      return false;
    }

    return true;
  },

  signOut: allowOnlyOneSubmit(function() {
    var accountToSignOut = this.getSignedInAccount();

    this.logViewEvent('signout.submit');
    return this.user
      .signOutAccount(accountToSignOut)
      .catch(() => {
        // log and ignore the error.
        this.logViewEvent('signout.error');
      })
      .then(() => {
        this.logViewEvent('signout.success');
        this.clearSessionAndNavigateToSignIn();
      });
  }),

  SUCCESS_MESSAGE_DELAY_MS: new Duration('5s').milliseconds(),

  displaySuccess() {
    this.clearTimeout(this._successTimeout);
    this._successTimeout = this.setTimeout(() => {
      this.hideSuccess();
    }, this.SUCCESS_MESSAGE_DELAY_MS);
    return BaseView.prototype.displaySuccess.apply(this, arguments);
  },

  unsafeDisplaySuccess() {
    this.clearTimeout(this._successTimeout);
    this._successTimeout = this.setTimeout(() => {
      this.hideSuccess();
    }, this.SUCCESS_MESSAGE_DELAY_MS);
    return BaseView.prototype.unsafeDisplaySuccess.apply(this, arguments);
  },

  displaySecurityEvents() {
    if (this.broker.hasCapability('showSecurityEvents')) {
      return true;
    }

    return false;
  },
});

Cocktail.mixin(
  View,
  AccountByUidMixin,
  AvatarMixin,
  LoadingMixin,
  SignedOutNotificationMixin,
  UserAgentMixin
);

export default View;
