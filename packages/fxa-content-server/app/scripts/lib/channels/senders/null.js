/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A null sender. Sends messages nowhere.
 */

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');

  function NullSender() {
    // nothing to do here.
  }

  NullSender.prototype = {
    initialize: function (/*options*/) {
    },

    send: function (/*command, data, messageId*/) {
      return p();
    },

    teardown: function () {
    }
  };

  module.exports = NullSender;
});


