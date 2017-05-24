/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  const AvatarCameraView = require('views/settings/avatar_camera');
  const AvatarChangeView = require('views/settings/avatar_change');
  const AvatarCropView = require('views/settings/avatar_crop');
  const AvatarMixin = require('views/mixins/avatar-mixin');
  const AvatarView = require('views/settings/avatar');
  const BaseView = require('views/base');
  const ChangePasswordView = require('views/settings/change_password');
  const Cocktail = require('cocktail');
  const CommunicationPreferencesView = require('views/settings/communication_preferences');
  const DeleteAccountView = require('views/settings/delete_account');
  const ClientsView = require('views/settings/clients');
  const ClientDisconnectView = require('views/settings/client_disconnect');
  const DisplayNameView = require('views/settings/display_name');
  const EmailsView = require('views/settings/emails');
  const Duration = require('duration');
  const LoadingMixin = require('views/mixins/loading-mixin');
  const modal = require('modal'); //eslint-disable-line no-unused-vars
  const Session = require('lib/session');
  const SettingsHeaderTemplate = require('stache!templates/partial/settings-header');
  const SignedOutNotificationMixin = require('views/mixins/signed-out-notification-mixin');
  const SubPanels = require('views/sub_panels');
  const Template = require('stache!templates/settings');

  var PANEL_VIEWS = [
    EmailsView,
    AvatarView,
    ClientsView,
    ClientDisconnectView,
    DisplayNameView,
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

    initialize (options) {
      options = options || {};

      this._able = options.able;
      this._subPanels = options.subPanels || this._initializeSubPanels(options);
      this._formPrefill = options.formPrefill;

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
      }
    },

    notifications: {
      'navigate-from-child-view': '_onNavigateFromChildView'
    },

    _initializeSubPanels (options) {
      var areCommunicationPrefsVisible = false;
      var panelViews = options.panelViews || PANEL_VIEWS;

      if (panelViews.indexOf(CommunicationPreferencesView) !== -1) {
        areCommunicationPrefsVisible = this._areCommunicationPrefsVisible();
        panelViews = panelViews.filter(function (ChildView) {
          if (ChildView === CommunicationPreferencesView) {
            return areCommunicationPrefsVisible;
          }
          return true;
        });
      }

      this.logViewEvent('communication-prefs-link.visible.' +
        String(areCommunicationPrefsVisible));

      return new SubPanels({
        createView: options.createView,
        initialChildView: options.childView,
        panelViews: panelViews,
        parent: this
      });
    },

    context () {
      const account = this.getSignedInAccount();

      return {
        showSignOut: ! account.isFromSync(),
        unsafeHeaderHTML: this._getHeaderHTML(account)
      };
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

      this.logView();
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

      this._subPanels.setElement(this.$('#sub-panels')[0]);
      return this._subPanels.render()
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
      this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
    },

    _showAvatar () {
      var account = this.getSignedInAccount();
      return this.displayAccountProfileImage(account)
        .then(() => this._setupAvatarChangeLinks());
    },

    _areCommunicationPrefsVisible () {
      return !! this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
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
    SignedOutNotificationMixin
  );

  module.exports = View;
});
