/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'jquery',
  'modal',
  'cocktail',
  'lib/promise',
  'lib/session',
  'views/form',
  'views/base',
  'views/mixins/avatar-mixin',
  'views/settings/avatar',
  'views/settings/avatar_change',
  'views/settings/avatar_crop',
  'views/settings/avatar_camera',
  'views/settings/avatar_gravatar',
  'views/settings/gravatar_permissions',
  'views/settings/communication_preferences',
  'views/change_password',
  'views/settings/display_name',
  'views/delete_account',
  'views/mixins/settings-mixin',
  'views/decorators/allow_only_one_submit',
  'stache!templates/settings'
],
function ($, modal, Cocktail, p, Session, FormView, BaseView, AvatarMixin,
  AvatarView, AvatarChangeView, AvatarCropView, AvatarCameraView, GravatarView,
  GravatarPermissionsView, CommunicationPreferencesView, ChangePasswordView,
  DisplayNameView, DeleteAccountView, SettingsMixin, allowOnlyOneSubmit,
  Template) {
  'use strict';

  var FADE_OUT_SETTINGS = 250;

  var t = BaseView.t;

  var SUBVIEWS = [
    AvatarView,
    DisplayNameView,
    CommunicationPreferencesView,
    ChangePasswordView,
    DeleteAccountView
  ];

  // Avatar views are stateful so they require special handling
  var AVATAR_VIEWS = [
    AvatarChangeView,
    AvatarCropView,
    AvatarCameraView,
    GravatarView,
    GravatarPermissionsView
  ];

  function renderView(view) {
    return view.render()
      .then(function (shown) {
        if (! shown) {
          return;
        }
        view.afterVisible();

        return view;
      });
  }

  var View = FormView.extend({
    template: Template,
    className: 'settings',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;
      this._subViewToShow = options.subView;
      this.notifications = options.notifications;

      this.on('navigate-from-subview', this._onNavigateFromSubview.bind(this));
      this.notifications.on('profile:change', this._onProfileChange.bind(this));
    },

    context: function () {
      var account = this.getSignedInAccount();

      return {
        username: account.get('email'),
        showSignOut: ! account.isFromSync(),
        communicationPrefsVisible: this._areCommunicationPrefsVisible()
      };
    },

    events: {
      'click #signout': BaseView.preventDefaultThen('submit')
    },

    _onProfileChange: function () {
      this._showAvatar();

      // re-render views that depend on profile data
      renderView(this._subviewInstanceFromClass(AvatarView));
      renderView(this._subviewInstanceFromClass(DisplayNameView));
    },

    // When we navigate to settings from a subview
    // close the modal, destroy any avatar view, and
    // show any ephemeral messages passed to `navigate`
    _onNavigateFromSubview: function () {
      if ($.modal.isActive()) {
        $.modal.close();
      }
      this._closeAvatarView();
      this.showEphemeralMessages();
    },

    showSubView: function (SubView, options) {
      if (SUBVIEWS.indexOf(SubView) === -1 && AVATAR_VIEWS.indexOf(SubView) === -1) {
        return;
      }
      var self = this;

      self._closeAvatarView();

      if (self._isAvatarView(SubView)) {
        // Avatar views depend on state so we have to render them on-demand.
        return self._renderSubView(SubView, options)
          .then(function (view) {
            view.openPanel();
            self._openModal(view);
          });
      }

      var subView = self._subviewInstanceFromClass(SubView);
      subView.openPanel();
      subView.logScreen();
    },

    _subviewInstanceFromClass: function (SubView) {
      return this.subviews.filter(function (subView) {
        if (subView instanceof SubView) {
          return true;
        }
      })[0];
    },

    _openModal: function (view) {
      var self = this;
      $(view.el).modal({
        zIndex: 999,
        opacity: 0.75,
        showClose: false
      });
      $(view.el).on($.modal.CLOSE, function () {
        self._onCloseModal();
      });
    },

    _onCloseModal: function () {
      this._subviewInstanceFromClass(AvatarView).closePanelReturnToSettings();
    },

    _closeAvatarView: function () {
      var view;
      // Destroy any previous avatar view
      if (this._avatarView) {
        view = this._avatarView;
        this._avatarView = null;
        view.closePanel();
        view.destroy(true);
      }
    },

    _subViewClass: function (SubView) {
      return SubView.prototype.className;
    },

    _isAvatarView: function (SubView) {
      return (AVATAR_VIEWS.indexOf(SubView) !== -1);
    },

    _renderSubView: function (SubView) {
      var self = this;
      var className = self._subViewClass(SubView);
      var selector = '.' + className;

      self.$('#subviews').append('<div class="settings-subview ' + className + '"></div>');

      var view = self.router.createView(SubView, {
        el: self.$(selector),
        superView: self
      });

      if (self._isAvatarView(SubView)) {
        self._avatarView = view;
      }

      self.trackSubview(view);

      return renderView(view);
    },

    beforeRender: function () {
      var self = this;
      if (self.relier.get('setting') === 'avatar') {
        self.relier.set('setting', null);
        self.navigate('/settings/avatar/change');
      }

      $('body').addClass('settings');
      var account = self.getSignedInAccount();

      return account.fetchProfile()
        .then(function () {
          self.user.setAccount(account);
        });
    },

    afterRender: function () {
      var self = this;
      var areCommunicationPrefsVisible = self._areCommunicationPrefsVisible();
      var SubViews = SUBVIEWS.filter(function (SubView) {
        return SubView !== CommunicationPreferencesView ||
                areCommunicationPrefsVisible;
      });

      self.logScreenEvent('communication-prefs-link.visible.' +
          String(areCommunicationPrefsVisible));

      return p.all(SubViews.map(function (SubView) {
        return self._renderSubView(SubView);
      }));
    },

    submit: allowOnlyOneSubmit(function () {
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
          Session.clear();
          self.navigate('signin', {
            success: t('Signed out successfully')
          });
        });
    }),

    beforeDestroy: function () {
      $('.settings').fadeOut(FADE_OUT_SETTINGS, function (){
        $('body').removeClass('settings').show();
      });
    },

    afterVisible: function () {
      var self = this;
      FormView.prototype.afterVisible.call(self);

      if (self._subViewToShow) {
        self.showSubView(self._subViewToShow);
      }

      return self._showAvatar();
    },

    _isAvatarLinkVisible: function (account) {
      var email = account.get('email');
      // For automated testing accounts, emails begin with "avatarAB-" and end with "restmail.net"
      var isTestAccount = /^avatarAB-.+@restmail\.net$/.test(email);

      return isTestAccount ||
             this.hasDisplayedAccountProfileImage() ||
             account.get('hadProfileImageSetBefore') ||
             this._able.choose('avatarLinkVisible', { email: email });
    },

    _setupAvatarChangeLinks: function (show) {
      if (show) {
        this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
      }
    },

    _showAvatar: function () {
      var self = this;
      var account = self.getSignedInAccount();
      return self.displayAccountProfileImage(account)
        .then(function () {
          self._setupAvatarChangeLinks(self._isAvatarLinkVisible(account));
        });
    },

    _areCommunicationPrefsVisible: function () {
      return this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    }
  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
