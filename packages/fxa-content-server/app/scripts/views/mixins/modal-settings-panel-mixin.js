/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

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
      'click .cancel': BaseView.preventDefaultThen('closePanelReturnToSettings')
    },

    openPanel: function (event) {
      var self = this;
      $(self.el).modal({
        zIndex: 999,
        opacity: 0.75,
        showClose: false
      });
      $(self.el).on($.modal.CLOSE, function () {
        self.closePanelReturnToSettings();
      });
    },

    closePanelReturnToSettings: function () {
      this.navigate('settings');
      this.closePanel();
    },

    closePanel: function () {
      this.destroy(true);
    },

    displaySuccess: function (msg) {
      var self = this;
      if (! self.superView) {
        return;
      }
      self.superView.displaySuccess(msg);
    }
  };
});
