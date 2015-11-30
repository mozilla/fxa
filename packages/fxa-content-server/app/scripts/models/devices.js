/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A collection of devices
 */


define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var Device = require('models/device');

  var Devices = Backbone.Collection.extend({
    model: Device,

    initialize: function (models, options) {
      options = options || {};
    },

    comparator: function (a, b) {
      // 1. the current device is first.
      // 2. the rest sorted in alphabetical order.
      if (a.get('isCurrentDevice')) {
        return -1;
      }

      var aName = (a.get('name') || '').trim().toLowerCase();
      var bName = (b.get('name') || '').trim().toLowerCase();

      if (aName < bName) {
        return -1;
      } else if (a === b) {
        return 0;
      }

      return 1;
    }
  });

  module.exports = Devices;
});


