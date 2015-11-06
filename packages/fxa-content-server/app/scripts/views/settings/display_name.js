/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AvatarMixin = require('views/mixins/avatar-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  var FormView = require('views/form');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var Template = require('stache!templates/settings/display_name');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'display-name',
    viewName: 'settings.display-name',

    onProfileUpdate: function () {
      this.render();
    },

    context: function () {
      return {
        displayName: this._displayName
      };
    },

    beforeRender: function () {
      var self = this;
      var account = self.getSignedInAccount();
      return account.fetchProfile()
        .then(function () {
          self.user.setAccount(account);
          self._displayName = account.get('displayName');
        });
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      var displayName = self.getElementValue('input.display-name').trim();

      return account.postDisplayName(displayName)
        .then(function () {
          self.logViewEvent('success');
          self.updateDisplayName(displayName);
          self.displaySuccess(t('Display name updated'));
          self.navigate('settings');
        });
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    SettingsPanelMixin,
    FloatingPlaceholderMixin
  );

  module.exports = View;
});
