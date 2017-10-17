/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const allowOnlyOneSubmit = require('./decorators/allow_only_one_submit');
  const AvatarCameraView = require('./settings/avatar_camera');
  const AvatarChangeView = require('./settings/avatar_change');
  const AvatarCropView = require('./settings/avatar_crop');
  const AvatarMixin = require('./mixins/avatar-mixin');
  const AvatarView = require('./settings/avatar');
  const BaseView = require('./base');
  const ChangePasswordView = require('./settings/change_password');
  const ClientDisconnectView = require('./settings/client_disconnect');
  const ClientsView = require('./settings/clients');
  const Cocktail = require('cocktail');
  const CommunicationPreferencesView = require('./settings/communication_preferences');
  const DeleteAccountView = require('./settings/delete_account');
  const DisplayNameView = require('./settings/display_name');
  const Duration = require('duration');
  const EmailsView = require('./settings/emails');
  const LoadingMixin = require('./mixins/loading-mixin');
  const modal = require('modal'); //eslint-disable-line no-unused-vars
  const Session = require('../lib/session');
  const SettingsHeaderTemplate = require('stache!templates/partial/settings-header');
  const SignedOutNotificationMixin = require('./mixins/signed-out-notification-mixin');
  const SubPanels = require('./sub_panels');
  const Template = require('stache!templates/settings');
  const UserAgentMixin = require('../lib/user-agent-mixin');

  var PANEL_VIEWS = [
    AvatarView,
    DisplayNameView,
    EmailsView,
    ClientsView,
    ClientDisconnectView,
    CommunicationPreferencesView,
    ChangePasswordView,
    DeleteAccountView,
    AvatarChangeView,
    AvatarCropView,
    AvatarCameraView
  ];

  const proto = BaseView.prototype;
  const View = BaseView.extend({
    template: Template,
    className: 'settings',
    layoutClassName: 'settings',
    viewName: 'settings',

    mustVerify: true,

    initialize (options = {}) {
      this._childView = options.childView;
      this._createView = options.createView;
      this._experimentGroupingRules = options.experimentGroupingRules;

      var uid = this.relier.get('uid');

      // A uid param is set by RPs linking directly to the settings
      // page for a particular account.
      //
      // We set the current account to the one with `uid` if
      // it exists in our list of cached accounts. If the account is
      // not in the list of cached accounts, clear the current account.
      //
      // The `mustVerify` flag will ensure that the account is valid.
      if (! this.user.getAccountByUid(uid).isDefault()) {
        // The account with uid exists; set it to our current account.
        this.user.setSignedInAccountByUid(uid);
      } else if (uid) {
        // session is expired or user does not exist. Force the user
        // to sign in.
        Session.clear();
        this.user.clearSignedInAccount();
        this.logViewEvent('signout.forced');
      }
    },

    notifications: {
      'navigate-from-child-view': '_onNavigateFromChildView'
    },

    setInitialContext (context) {
      const account = this.getSignedInAccount();

      context.set({
        showSignOut: ! account.isFromSync(),
        unsafeHeaderHTML: this._getHeaderHTML(account)
      });
    },

    events: {
      'click #signout': BaseView.preventDefaultThen('signOut')
    },

    // Triggered by AvatarMixin
    onProfileUpdate () {
      this._showAvatar();
    },

    showChildView (ChildView, options) {
      return this._subPanels.showChildView(ChildView, options);
    },

    // When we navigate to settings from a childView
    // close the modal, show any ephemeral messages passed to `navigate`
    _onNavigateFromChildView () {
      if ($.modal.isActive()) {
        $.modal.close();
      }
      this.displayStatusMessages();
    },

    beforeRender () {
      const account = this.getSignedInAccount();

      return account.fetchProfile()
        .then(() => this.user.setAccount(account));
    },

    _onAccountUpdate (account) {
      this.$('#fxa-settings-profile-header').html(this._getHeaderHTML(account));
    },

    _getHeaderHTML (account) {
      return SettingsHeaderTemplate(account.pick('displayName', 'email'));
    },

    afterRender () {
      const account = this.getSignedInAccount();
      this.listenTo(account, 'change:displayName', this._onAccountUpdate);
      this.listenTo(account, 'change:email', this._onAccountUpdate);

      this.logViewEvent('communication-prefs-link.visible.' +
        String(this._areCommunicationPrefsVisible()));

      const subPanels = this._initializeSubPanels(this.$('#sub-panels')[0]);
      return subPanels.render()
        .then(proto.afterRender.bind(this));
    },

    afterVisible () {
      // Clients may link to the settings page with a `setting` query param
      // so that that field can be displayed/focused.
      if (this.relier.get('setting') === 'avatar') {
        this.relier.set('setting', null);
        this.navigate('settings/avatar/change');
      }

      return proto.afterVisible.call(this)
        .then(this._showAvatar.bind(this));
    },

    _setupAvatarChangeLinks () {
      if (this.supportsAvatarUpload()) {
        this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
      } else {
        this.$('.avatar-wrapper').addClass('nohover');
      }
    },

    _showAvatar () {
      var account = this.getSignedInAccount();
      return this.displayAccountProfileImage(account)
        .then(() => this._setupAvatarChangeLinks());
    },

    /**
     * Initialize the SubPanels view if not already initialized
     *
     * @param {Object} rootEl root element for SubPanels view.
     * @returns {Object} SubPanels instance
     * @private
     */
    _initializeSubPanels (rootEl) {
      if (! this._subPanels) {
        this._subPanels = new SubPanels({
          createView: this._createView,
          el: rootEl,
          initialChildView: this._childView,
          panelViews: this._getPanelsToDisplay(),
          parent: this
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
    _getPanelsToDisplay () {
      const areCommunicationPrefsVisible = this._areCommunicationPrefsVisible();
      return PANEL_VIEWS.filter((ChildView) => {
        if (ChildView === CommunicationPreferencesView) {
          return areCommunicationPrefsVisible;
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
    _areCommunicationPrefsVisible () {
      if (! this._experimentGroupingRules.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      })) {
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

    signOut: allowOnlyOneSubmit(function () {
      var accountToSignOut = this.getSignedInAccount();

      this.logViewEvent('signout.submit');
      return this.user.signOutAccount(accountToSignOut)
        .fail(() => {
          // log and ignore the error.
          this.logViewEvent('signout.error');
        })
        .fin(() => {
          this.logViewEvent('signout.success');
          this.clearSessionAndNavigateToSignIn();
        });
    }),

    SUCCESS_MESSAGE_DELAY_MS: new Duration('5s').milliseconds(),

    displaySuccess () {
      this.clearTimeout(this._successTimeout);
      this._successTimeout = this.setTimeout(() => {
        this.hideSuccess();
      }, this.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.displaySuccess.apply(this, arguments);
    },

    unsafeDisplaySuccess () {
      this.clearTimeout(this._successTimeout);
      this._successTimeout = this.setTimeout(() => {
        this.hideSuccess();
      }, this.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.unsafeDisplaySuccess.apply(this, arguments);
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    LoadingMixin,
    SignedOutNotificationMixin,
    UserAgentMixin
  );

  module.exports = View;
});
