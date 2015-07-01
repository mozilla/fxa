/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
  'views/base'
], function (BaseView) {
  return {
    initialize: function (options) {
      this.superView = options.superView;
    },
    events: {
      'click .settings-unit-toggle': BaseView.preventDefaultThen('openPanel'),
      'click .cancel': BaseView.preventDefaultThen('closePanelReturnToSettings')
    },

    openPanel: function () {
      this.$('.settings-unit').addClass('open');
      this.$('.settings-unit').removeClass('setting-updated');
    },

    closePanelReturnToSettings: function () {
      this.closePanel();
      this.navigate('settings');
    },

    closePanel: function () {
      this.$('.settings-unit').removeClass('open');
      this.$('.settings-unit').removeClass('setting-updated');
    },

    displaySuccess: function (msg) {
      var self = this;
      self.superView.displaySuccess(msg);
      self.$('.settings-unit').addClass('setting-updated');
      self.$('.settings-unit').removeClass('open');

      clearTimeout(self._successTimeout);
      self._successTimeout = setTimeout(function () {
        self.superView.hideSuccess(msg);
      }, 3000);
    }
  };
});
