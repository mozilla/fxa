/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/base',
  'views/form',
  'stache!templates/settings/display_name',
  'views/mixins/settings-mixin',
  'views/mixins/settings-panel-mixin',
  'views/mixins/avatar-mixin'
],
function (Cocktail, BaseView, FormView, Template,
  SettingsMixin, SettingsPanelMixin, AvatarMixin) {
  'use strict';

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'display-name',

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
          self.logScreenEvent('success');
          self.updateDisplayName(displayName);
          self.displaySuccess(t('Display name updated'));
          self.navigate('settings');
        });
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    SettingsMixin,
    SettingsPanelMixin
  );

  return View;
});
