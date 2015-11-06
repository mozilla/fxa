/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// This is a mixin used by Modal views that are childViews of Settings
// Non-modal childViews of Settings use settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');

  module.exports = {
    isModal: true,

    initialize: function (options) {
      this.parentView = options.parentView;
    },

    events: {
      'click .avatar-panel #back': BaseView.preventDefaultThen('_returnToAvatarChange'),
      'click .cancel': BaseView.preventDefaultThen('_closePanelReturnToSettings')
    },

    openPanel: function (event) {
      var self = this;
      $(self.el).modal({
        opacity: 0.75,
        showClose: false,
        zIndex: 999
      });
      $(self.el).on($.modal.CLOSE, function () {
        self._closePanelReturnToSettings();
      });
    },

    _returnToAvatarChange: function () {
      this.navigate('settings/avatar/change');
    },

    _closePanelReturnToSettings: function () {
      this.navigate('settings');
      this.closePanel();
    },

    closePanel: function () {
      this.destroy(true);
    },

    displaySuccess: function (msg) {
      var self = this;
      self.parentView.displaySuccess(msg);
    }
  };
});
