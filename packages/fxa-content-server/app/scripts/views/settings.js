/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exceptsPaths: modal */
define([
  'jquery',
  'modal',
  'cocktail',
  'lib/session',
  'views/base',
  'views/mixins/avatar-mixin',
  'views/settings/avatar',
  'views/settings/avatar_change',
  'views/settings/avatar_crop',
  'views/settings/avatar_camera',
  'views/settings/avatar_gravatar',
  'views/settings/gravatar_permissions',
  'views/settings/communication_preferences',
  'views/settings/change_password',
  'views/settings/delete_account',
  'views/settings/display_name',
  'views/sub_panels',
  'views/mixins/settings-mixin',
  'views/mixins/loading-mixin',
  'views/decorators/allow_only_one_submit',
  'stache!templates/settings'
],
function ($, modal, Cocktail, Session, BaseView, AvatarMixin,
  AvatarView, AvatarChangeView, AvatarCropView, AvatarCameraView, GravatarView,
  GravatarPermissionsView, CommunicationPreferencesView, ChangePasswordView,
  DeleteAccountView, DisplayNameView, SubPanels, SettingsMixin, LoadingMixin,
  allowOnlyOneSubmit, Template) {
  'use strict';

  var t = BaseView.t;

  var PANEL_VIEWS = [
    AvatarView,
    DisplayNameView,
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

    initialize: function (options) {
      options = options || {};

      this._able = options.able;
      this._subPanels = options.subPanels || this._initializeSubPanels(options);
      this._formPrefill = options.formPrefill;

      this.router.on(this.router.NAVIGATE_FROM_SUBVIEW, this._onNavigateFromSubview.bind(this));
    },

    _initializeSubPanels: function (options) {
      var areCommunicationPrefsVisible = false;
      var panelViews = options.panelViews || PANEL_VIEWS;

      if (panelViews.indexOf(CommunicationPreferencesView) !== -1) {
        areCommunicationPrefsVisible = this._areCommunicationPrefsVisible();
        panelViews = panelViews.filter(function (SubView) {
          if (SubView === CommunicationPreferencesView) {
            return areCommunicationPrefsVisible;
          }
          return true;
        });
      }

      this.logScreenEvent('communication-prefs-link.visible.' +
          String(areCommunicationPrefsVisible));

      return new SubPanels({
        router: this.router,
        panelViews: panelViews,
        initialSubView: options.subView
      });
    },

    context: function () {
      var account = this.getSignedInAccount();

      return {
        username: account.get('email'),
        showSignOut: ! account.isFromSync()
      };
    },

    events: {
      'click #signout': BaseView.preventDefaultThen('signOut')
    },

    // Triggered by AvatarMixin
    onProfileUpdate: function () {
      this._showAvatar();
    },

    showSubView: function (SubView) {
      return this._subPanels.showSubView(SubView);
    },

    // When we navigate to settings from a subview
    // close the modal, show any ephemeral messages passed to `navigate`
    _onNavigateFromSubview: function () {
      if ($.modal.isActive()) {
        $.modal.close();
      }
      this.showEphemeralMessages();
      this.logScreen();
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
      var sessionToken = self.getSignedInAccount().get('sessionToken');

      self.logScreenEvent('signout.submit');
      return self.fxaClient.signOut(sessionToken)
        .fail(function () {
          // ignore the error.
          // Clear the session, even on failure. Everything is A-OK.
          // See issue #616
          self.logScreenEvent('signout.error');
        })
        .fin(function () {
          self.logScreenEvent('signout.success');
          self.user.clearSignedInAccount();
          // The user has manually signed out, a pretty strong indicator
          // the user does not want any of their information pre-filled
          // on the signin page. Clear any remaining formPrefill info
          // to ensure their data isn't sticking around in memory.
          self._formPrefill.clear();
          Session.clear();
          self.navigate('signin', {
            success: t('Signed out successfully')
          });
        });
    }),

    SUCCESS_MESSAGE_DELAY_MS: 3000, // show success message for 3 seconds

    displaySuccess: function () {
      var self = this;
      clearTimeout(self._successTimeout);
      self._successTimeout = setTimeout(function () {
        self.hideSuccess();
      }, self.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.displaySuccess.apply(this, arguments);
    },

    displaySuccessUnsafe: function () {
      var self = this;
      clearTimeout(self._successTimeout);
      self._successTimeout = setTimeout(function () {
        self.hideSuccess();
      }, self.SUCCESS_MESSAGE_DELAY_MS);
      return BaseView.prototype.displaySuccessUnsafe.apply(this, arguments);
    }

  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    LoadingMixin,
    SettingsMixin
  );

  return View;
});
