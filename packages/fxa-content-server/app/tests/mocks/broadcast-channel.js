/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the BroadcastChannel object for testing.
// See https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API

define(function (require, exports, module) {
  'use strict';

  var sinon = require('sinon');

  function BroadcastChannelMock (name) {
    this._name = name;
  }

  BroadcastChannelMock.prototype = {
    postMessage: sinon.spy()
  };

  module.exports = BroadcastChannelMock;
});

