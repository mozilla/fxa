/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Device information
 */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');

  var Device = Backbone.Model.extend({
    defaults: {
      id: null,
      isCurrentDevice: null,
      lastConnected: null,
      name: null,
      type: null
    },

    destroy: function () {
      // Both a sessionToken and deviceId are needed to destroy a device.
      // An account `has a` device, therefore account destroys the device.
      this.trigger('destroy', this);
    }
  });

  module.exports = Device;
});

