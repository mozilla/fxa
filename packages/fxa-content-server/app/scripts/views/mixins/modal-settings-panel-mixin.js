/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// This is a mixin used by Modal views that are subviews of Settings
// Non-modal subviews of Settings use settings-panel-mixin instead.

define([
  'jquery',
  'views/base'
], function ($, BaseView) {
  'use strict';

  return {
    isModal: true,

    initialize: function (options) {
      this.superView = options.superView;
    },

    events: {
      'click .avatar-panel #back': BaseView.preventDefaultThen('_returnToAvatarChange'),
      'click .cancel': BaseView.preventDefaultThen('_closePanelReturnToSettings')
    },

    openPanel: function (event) {
      var self = this;
      $(self.el).modal({
        zIndex: 999,
        opacity: 0.75,
        showClose: false
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
      self.superView.displaySuccess(msg);
    }
  };
});
