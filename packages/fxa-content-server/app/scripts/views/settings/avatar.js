/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AvatarMixin = require('views/mixins/avatar-mixin');
  const Cocktail = require('cocktail');
  const FormView = require('views/form');
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const Template = require('stache!templates/settings/avatar');

  var View = FormView.extend({
    template: Template,
    className: 'avatar',
    viewName: 'settings.avatar',

    onProfileUpdate () {
      this.render();
    },

    setInitialContext (context) {
      var account = this.getSignedInAccount();
      context.set('avatar', account.has('profileImageUrl'));
    }

  });

  Cocktail.mixin(View, AvatarMixin, SettingsPanelMixin);

  module.exports = View;
});
