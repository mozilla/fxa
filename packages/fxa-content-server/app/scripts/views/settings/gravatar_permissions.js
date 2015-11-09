/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  var p = require('lib/promise');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/settings/gravatar_permissions');

  var View = FormView.extend({
    template: Template,
    className: 'gravatar-permissions',
    viewName: 'settings.gravatar-permissions',

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
        this.logViewEvent('already-accepted');
        this.navigate('settings/avatar/gravatar');
        return false;
      }
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      self.logViewEvent('accept');

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
    ServiceMixin
  );

  module.exports = View;
});
