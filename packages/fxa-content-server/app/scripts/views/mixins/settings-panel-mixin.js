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
      'click .settings-unit-toggle': BaseView.cancelEventThen('openPanel'),
      'click .cancel': BaseView.cancelEventThen('cancelPanel')
    },

    openPanel: function () {
      this.$('.settings-unit').addClass('open');
      this.$('.settings-unit').removeClass('setting-updated');
    },

    cancelPanel: function () {
      this.$('.settings-unit').removeClass('open');
      this.$('.settings-unit').removeClass('setting-updated');
      this.navigate('settings');
    },

    displaySuccess: function (msg) {
      this.superView.displaySuccess(msg);
      this.$('.settings-unit').addClass('setting-updated');
      this.$('.settings-unit').removeClass('open');
    }
  };
});
