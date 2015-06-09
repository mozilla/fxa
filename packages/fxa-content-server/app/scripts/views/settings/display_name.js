/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'views/form',
  'lib/auth-errors',
  'stache!templates/settings/display_name',
  'views/mixins/settings-mixin',
  'views/mixins/settings-panel-mixin'
],
function (Cocktail, BaseView, FormView, AuthErrors, Template,
  SettingsMixin, SettingsPanelMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'display-name',

    events: {
      'click .settings-unit-toggle': '_openSettingsUnit'
    },

    _openSettingsUnit: function () {
      this.navigate('/settings/display_name');
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      var displayName = self.getElementValue('input.text');

      return account.postDisplayName(displayName)
        .then(function (result) {
          self.displaySuccess(t('Display name updated'));
          self.navigate('settings');
        });
    }
  });

  Cocktail.mixin(
    View,
    SettingsMixin,
    SettingsPanelMixin
  );

  return View;
});
