/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/form',
  'stache!templates/settings/gravatar_permissions',
  'lib/promise',
  'views/mixins/modal-settings-panel-mixin',
  'views/mixins/settings-mixin',
  'views/mixins/service-mixin'
],
function (Cocktail, FormView, Template, p,
  ModalSettingsPanelMixin, SettingsMixin, ServiceMixin) {
  'use strict';

  var View = FormView.extend({
    template: Template,
    className: 'gravatar-permissions',

    context: function () {
      var account = this.getSignedInAccount();
      var serviceName = this.translator.get('Gravatar');
      return {
        email: account.get('email'),
        serviceName: serviceName
      };
    },

    beforeRender: function () {
      var account = this.getSignedInAccount();
      if (account.hasGrantedPermissions(View.GRAVATAR_MOCK_CLIENT_ID, View.PERMISSIONS)) {
        this.logScreenEvent('already-accepted');
        this.navigate('settings/avatar/gravatar');
        return false;
      }
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      self.logScreenEvent('accept');

      return p().then(function () {
        account.saveGrantedPermissions(View.GRAVATAR_MOCK_CLIENT_ID, View.PERMISSIONS);
        self.user.setAccount(account);
        self.navigate('settings/avatar/gravatar');
      });
    }

  });

  View.PERMISSIONS = ['profile:email'];
  View.GRAVATAR_MOCK_CLIENT_ID = 'gravatar';

  Cocktail.mixin(
    View,
    ModalSettingsPanelMixin,
    SettingsMixin,
    ServiceMixin
  );

  return View;
});
