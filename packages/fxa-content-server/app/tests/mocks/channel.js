/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// mock in a channel

'use strict';

define([
], function() {
  function ChannelMock() {
    this.canLinkAccountOk = true;
    this.messageCount = {};
  }

  ChannelMock.prototype = {
    send: function(message, data, done) {
      this.message = message;
      this.data = data;
      if (!this.messageCount[message]) {
        this.messageCount[message] = 0;
      }
      this.messageCount[message] += 1;
      switch (message)
      {
      case 'can_link_account':
        this.onCanLinkAccount(data, done);
        break;
      default:
        if (done) {
          done();
        }
      }
    },

    onCanLinkAccount: function(data, done) {
      done(null, { data: { ok: this.canLinkAccountOk } });
    }
  };

  return ChannelMock;
});

