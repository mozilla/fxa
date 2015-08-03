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
  'stache!templates/subpanels'
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
    className: 'subpanels',

    initialize: function (options) {
      options = options || {};

      this._SubViewToShow = options.selectedSubView;
      this._SubViews = options.SubViews;
      this._DynamicSubViews = options.DynamicSubViews;
      this.notifications = options.notifications;
    },

    context: function () {
      var account = this.getSignedInAccount();

      return {
        username: account.get('email'),
        showSignOut: ! account.isFromSync(),
        communicationPrefsVisible: this._areCommunicationPrefsVisible()
      };
    },

    _onProfileChange: function () {
      // re-render views that depend on profile data
      renderView(this.subviewInstanceFromClass(AvatarView));
      renderView(this.subviewInstanceFromClass(DisplayNameView));
    },

    // When we navigate to settings from a subview
    // close the modal, destroy any avatar view, and
    // show any ephemeral messages passed to `navigate`
    _onNavigateFromSubview: function () {
      this._closeAvatarView();
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

      var subView = self.subviewInstanceFromClass(SubView);
      subView.openPanel();
      subView.logScreen();
    },

    subviewInstanceFromClass: function (SubView) {
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
      this.subviewInstanceFromClass(AvatarView).closePanelReturnToSettings();
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

    afterRender: function () {
      var self = this;
      return p.all(self._subviews.map(function (SubView) {
        return self._renderSubView(SubView);
      }));
    },

    afterVisible: function () {
      var self = this;
      FormView.prototype.afterVisible.call(self);

      if (self._SubViewToShow) {
        self.showSubView(self._SubViewToShow);
      }

      return self._showAvatar();
    },

  });

  return View;
});
