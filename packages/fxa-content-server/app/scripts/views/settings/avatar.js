/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'jquery',
  'modal',
  'cocktail',
  'views/form',
  'stache!templates/settings/avatar',
  'views/mixins/avatar-mixin',
  'views/mixins/settings-mixin',
  'views/mixins/settings-panel-mixin'
],
function ($, modal, Cocktail, FormView, Template, AvatarMixin, SettingsMixin,
    SettingsPanelMixin) {
  'use strict';

  var View = FormView.extend({
    template: Template,
    className: 'avatar',

    initialize: function (options) {
      this._notifications = options.notifications;
      if (this._notifications) {
        this._notifications.on(this._notifications.EVENTS.PROFILE_CHANGE,
          this._onProfileUpdate.bind(this));
      }
    },

    _onProfileUpdate: function () {
      this.render();
    },

    context: function () {
      var account = this.getSignedInAccount();
      return {
        avatar: account.has('profileImageUrl')
      };
    }

  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin, SettingsPanelMixin);

  return View;
});
