/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'jquery',
  'cocktail',
  'lib/session',
  'views/form',
  'views/base',
  'views/mixins/avatar-mixin',
  'views/settings/avatar',
  'views/settings/avatar_change',
  'views/settings/avatar_crop',
  'views/settings/avatar_camera',
  'views/settings/communication_preferences',
  'views/change_password',
  'views/settings/display_name',
  'views/delete_account',
  'views/mixins/settings-mixin',
  'views/decorators/allow_only_one_submit',
  'stache!templates/settings'
],
function ($, Cocktail, Session, FormView, BaseView, AvatarMixin,
  AvatarView, AvatarChangeView, AvatarCropView, AvatarCameraView, CommunicationPreferencesView,
  ChangePasswordView, DisplayNameView, DeleteAccountView, SettingsMixin, allowOnlyOneSubmit,
  Template) {
  'use strict';

  var t = BaseView.t;

  var SUBVIEWS = [
    AvatarView,
    DisplayNameView,
    //CommunicationPreferencesView,
    ChangePasswordView,
    DeleteAccountView
  ];

  // Avatar views are stateful so they require special handling
  var AVATAR_VIEWS = [
    AvatarChangeView,
    AvatarCropView,
    AvatarCameraView
  ];

  var View = FormView.extend({
    template: Template,
    className: 'settings',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;
      this._subViewToShow = options.subView;
      this._subViews = [];

      this.on('navigate-from-subview', this._closeAvatarView.bind(this));
    },

    context: function () {
      var account = this.getSignedInAccount();

      return {
        email: account.get('email'),
        displayName: account.get('displayName'),
        showSignOut: !account.isFromSync(),
        communicationPrefsVisible: this._areCommunicationPrefsVisible()
      };
    },

    events: {
      'click #signout': BaseView.preventDefaultThen('submit')
    },

    showSubView: function (SubView, options) {
      if (SUBVIEWS.indexOf(SubView) === -1 && AVATAR_VIEWS.indexOf(SubView) === -1) {
        return;
      }
      var self = this;

      self._closeAvatarView();

      // Avatar views depend on state so we have to render them on-demand.
      if (self._isAvatarView(SubView)) {
        return self._renderSubView(SubView, options)
          .then(function (view) {
            view.openPanel();
          });
      }

      var subView = self.subviewInstanceFromClass(SubView);
      subView.openPanel();

      // TODO log screen here?
    },

    subviewInstanceFromClass: function (SubView) {
      return this.subviews.filter(function (subView) {
        if (subView instanceof SubView) {
          return true;
        }
      })[0];
    },

    _closeAvatarView: function () {
      // Destroy any previous avatar view
      if (this._avatarView) {
        this._avatarView.destroy(true);
      }
    },

    _closeSubViews: function () {
      var self = this;

      SUBVIEWS.forEach(function (subView) {
        var selector = '.' + self._subViewClass(subView);
        if (self.$(selector).hasClass('open')) {
          self.$(selector).removeClass('open');
        }
      });
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
        self.$(selector).addClass('avatar-view');
      }

      self.trackSubview(view);

      return view.render()
        .then(function (shown) {
          if (! shown) {
            return;
          }
          view.afterVisible();

          return view;
        });
    },

    beforeRender: function () {
      if (this.relier.get('setting') === 'avatar') {
        this.navigate('/settings/avatar/change');
        return false;
      }

      $('body').addClass('settings');
    },

    afterRender: function () {
      var self = this;

      self.logScreenEvent('communication-prefs-link.visible.' +
          String(self._areCommunicationPrefsVisible()));

      SUBVIEWS.forEach(function (SubView) {
        self._renderSubView(SubView);
      });
    },

    afterVisible: function () {
      if (this._subViewToShow) {
        this.showSubView(this._subViewToShow);
      }
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

    _isAvatarLinkVisible: function (account) {
      var email = account.get('email');
      // For automated testing accounts, emails begin with "avatarAB-" and end with "restmail.net"
      var isTestAccount = /^avatarAB-.+@restmail\.net$/.test(email);

      return true || isTestAccount ||
             this.hasDisplayedAccountProfileImage() ||
             account.get('hadProfileImageSetBefore') ||
             this._able.choose('avatarLinkVisible', { email: email });
    },

    _areCommunicationPrefsVisible: function () {
      return this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    },

    _setupAvatarChangeLinks: function (show) {
      if (show) {
        this.$('.change-avatar-text').css('visibility', 'visible');
        this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
      }
    },

    afterVisible: function () {
      var self = this;
      var account = self.getSignedInAccount();

      FormView.prototype.afterVisible.call(self);
      return self.displayAccountProfileImage(account)
        .then(function () {
          self._setupAvatarChangeLinks(self._isAvatarLinkVisible(account));
        });
    }
  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
