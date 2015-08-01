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
    DeleteAccountView,
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
          view.destroy(true);
          return;
        }
        view.afterVisible();

        return view;
      });
  }

  var View = BaseView.extend({
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
      'click #signout': BaseView.preventDefaultThen('signOut')
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
      this._subviewInstanceFromClass(AvatarView).closePanel();
      this.showEphemeralMessages();
    },

    showSubView: function (SubView, options) {
      if (SUBVIEWS.indexOf(SubView) === -1) {
        return;
      }
      var self = this;

      // Destroy any previous modal view
      if (self._currentSubView && self._currentSubView.isModal) {
        self._currentSubView.closePanel();
      }

      return self._createSubViewIfNeeded(SubView, options)
        .then(function (subView) {
          if (subView) {
            self._currentSubView = subView;
            subView.openPanel();
            subView.logScreen();
          }
        });
    },

    _subviewInstanceFromClass: function (SubView) {
      return this.subviews.filter(function (subView) {
        if (subView instanceof SubView) {
          return true;
        }
      })[0];
    },

    _isModalViewClass: function (SubView) {
      return !! SubView.prototype.isModal;
    },

    _subViewClass: function (SubView) {
      return SubView.prototype.className;
    },

    // Render subview if an instance doesn't already exist
    _createSubViewIfNeeded: function (SubView) {
      var subView = this._subviewInstanceFromClass(SubView);
      if (subView) {
        return p(subView);
      }

      var self = this;
      var className = self._subViewClass(SubView);
      var selector = '.' + className;

      self.$('#subviews').append('<div class="settings-subview ' + className + '"></div>');

      var view = self.router.createView(SubView, {
        el: self.$(selector),
        superView: self
      });

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

      // Initial subviews to render; excludes CommunicationPreferencesView if not visible
      // and modal views.
      var initialSubViews = SUBVIEWS.filter(function (SubView) {
        return (SubView !== CommunicationPreferencesView || areCommunicationPrefsVisible) &&
              ! self._isModalViewClass(SubView);
      });

      self.logScreenEvent('communication-prefs-link.visible.' +
          String(areCommunicationPrefsVisible));

      return p.all(initialSubViews.map(function (SubView) {
        return self._createSubViewIfNeeded(SubView);
      }));
    },

    afterVisible: function () {
      var self = this;
      FormView.prototype.afterVisible.call(self);

      if (self._subViewToShow) {
        self.showSubView(self._subViewToShow);
      }

      return self._showAvatar();
    },

    beforeDestroy: function () {
      $('.settings').fadeOut(FADE_OUT_SETTINGS, function (){
        $('body').removeClass('settings').show();
      });
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
          Session.clear();
          self.navigate('signin', {
            success: t('Signed out successfully')
          });
        });
    }),

    displaySuccess: function () {
      var self = this;
      clearTimeout(self._successTimeout);
      self._successTimeout = setTimeout(function () {
        self.hideSuccess();
      }, 3000);
      return BaseView.prototype.displaySuccess.apply(this, arguments);
    },

    displaySuccessUnsafe: function () {
      var self = this;
      clearTimeout(self._successTimeout);
      self._successTimeout = setTimeout(function () {
        self.hideSuccess();
      }, 3000);
      return BaseView.prototype.displaySuccessUnsafe.apply(this, arguments);
    }

  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
