/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// mock in a channel

'use strict';

define([
], function() {
  function ChannelMock() {
    // nothing to do here.
  }

  ChannelMock.prototype = {
    send: function(message, data) {
      this.message = message;
      this.data = data;
    }
  };

  return ChannelMock;
});

