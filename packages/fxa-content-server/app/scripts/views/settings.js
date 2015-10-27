/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  var AvatarCameraView = require('views/settings/avatar_camera');
  var AvatarChangeView = require('views/settings/avatar_change');
  var AvatarCropView = require('views/settings/avatar_crop');
  var AvatarMixin = require('views/mixins/avatar-mixin');
  var AvatarView = require('views/settings/avatar');
  var BaseView = require('views/base');
  var ChangePasswordView = require('views/settings/change_password');
  var Cocktail = require('cocktail');
  var CommunicationPreferencesView = require('views/settings/communication_preferences');
  var DeleteAccountView = require('views/settings/delete_account');
  var DevicesView = require('views/settings/devices');
  var DisplayNameView = require('views/settings/display_name');
  var GravatarPermissionsView = require('views/settings/gravatar_permissions');
  var GravatarView = require('views/settings/avatar_gravatar');
  var LoadingMixin = require('views/mixins/loading-mixin');
  var modal = require('modal'); //eslint-disable-line no-unused-vars
  var SettingsMixin = require('views/mixins/settings-mixin');
  var SignedOutNotificationMixin = require('views/mixins/signed-out-notification-mixin');
  var SubPanels = require('views/sub_panels');
  var Template = require('stache!templates/settings');

  var PANEL_VIEWS = [
    AvatarView,
    DisplayNameView,
    DevicesView,
    CommunicationPreferencesView,
    ChangePasswordView,
    DeleteAccountView,
    AvatarChangeView,
    AvatarCropView,
    AvatarCameraView,
    GravatarView,
    GravatarPermissionsView
  ];

  var View = BaseView.extend({
    template: Template,
    className: 'settings',
    layoutClassName: 'settings',
    viewName: 'settings',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;
      this._subPanels = options.subPanels || this._initializeSubPanels(options);
      this._formPrefill = options.formPrefill;
    },

    notifications: {
      'navigate-from-child-view': '_onNavigateFromChildView'
    },

    _initializeSubPanels: function (options) {
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

    context: function () {
      var account = this.getSignedInAccount();

      return {
        displayName: account.get('displayName'),
        showSignOut: ! account.isFromSync(),
        userEmail: account.get('email')
      };
    },

    events: {
      'click #signout': BaseView.preventDefaultThen('signOut')
    },

    // Triggered by AvatarMixin
    onProfileUpdate: function () {
      this._showAvatar();
    },

    showChildView: function (ChildView) {
      return this._subPanels.showChildView(ChildView);
    },

    // When we navigate to settings from a childView
    // close the modal, show any ephemeral messages passed to `navigate`
    _onNavigateFromChildView: function () {
      if ($.modal.isActive()) {
        $.modal.close();
      }
      this.showEphemeralMessages();
      this.logView();
      this._swapDisplayName();
    },

    beforeRender: function () {
      var self = this;
      var account = self.getSignedInAccount();

      return account.fetchProfile()
        .then(function () {
          self.user.setAccount(account);
        });
    },

    afterRender: function () {
      this._subPanels.setElement(this.$('#sub-panels')[0]);
      return this._subPanels.render();
    },

    afterVisible: function () {
      var self = this;
      BaseView.prototype.afterVisible.call(self);

      // Clients may link to the settings page with a `setting` query param
      // so that that field can be displayed/focused.
      if (self.relier.get('setting') === 'avatar') {
        self.relier.set('setting', null);
        self.navigate('settings/avatar/change');
      }

      return self._showAvatar();
    },

    // When the user adds, removes or changes a display name
    // this gets called and swaps out headers to reflect
    // the updated state of the account
    _swapDisplayName: function () {
      var account = this.getSignedInAccount();
      var displayName = account.get('displayName');
      var email = account.get('email');

      var cardHeader = this.$('.card-header');
      var cardSubheader = this.$('.card-subheader');

      if (displayName) {
        cardHeader.text(displayName);
        cardSubheader.text(email);
      } else {
        cardHeader.text(email);
        cardSubheader.text('');
      }
    },

    _setupAvatarChangeLinks: function () {
      this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
    },

    _showAvatar: function () {
      var self = this;
      var account = self.getSignedInAccount();
      return self.displayAccountProfileImage(account)
        .then(function () {
          self._setupAvatarChangeLinks();
        });
    },

    _areCommunicationPrefsVisible: function () {
      return !! this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    },

    signOut: allowOnlyOneSubmit(function () {
      var self = this;
      var accountToSignOut = self.getSignedInAccount();

      self.logViewEvent('signout.submit');
      return self.user.signOutAccount(accountToSignOut)
        .fail(function () {
          // log and ignore the error.
          self.logViewEvent('signout.error');
        })
        .fin(function () {
          self.logViewEvent('signout.success');
          self.clearSessionAndNavigateToSignIn();
        });
    }),

    SUCCESS_MESSAGE_DELAY_MS: 5000, // show success message for 5 seconds

    displaySuccess: function () {
      var self = this;
      self.clearTimeout(self._successTimeout);
      self._successTimeout = self.setTimeout(function () {
        self.hideSuccess();
      }, self.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.displaySuccess.apply(this, arguments);
    },

    displaySuccessUnsafe: function () {
      var self = this;
      self.clearTimeout(self._successTimeout);
      self._successTimeout = self.setTimeout(function () {
        self.hideSuccess();
      }, self.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.displaySuccessUnsafe.apply(this, arguments);
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    LoadingMixin,
    SettingsMixin,
    SignedOutNotificationMixin
  );

  module.exports = View;
});
