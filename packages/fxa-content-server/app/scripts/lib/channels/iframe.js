/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

/**
 * A channel that takes care of the IFRAME'd OAuth flow.
 *
 * An RPs origin must match the origin registered for the client_id
 * on the URL.
 */

define([
  'underscore',
  'lib/channels/base',
  'lib/channels/mixins/postmessage_receiver'
], function (_, BaseChannel, PostMessageReceiverMixin) {
  function IFrameChannel() {
    // constructor, nothing to do.
  }

  _.extend(IFrameChannel.prototype, new BaseChannel(), {
    parseMessage: function (message) {
      try {
        return IFrameChannel.parse(message);
      } catch(e) {
        // drop the message on the ground
      }
    },

    dispatchCommand: function (command, data) {
      var msg = IFrameChannel.stringify(command, data);
      this.window.parent.postMessage(msg, this.getOrigin());
    }
  }, PostMessageReceiverMixin);

  IFrameChannel.stringify = function (command, data) {
    return JSON.stringify({
      command: command,
      data: data || {}
    });
  };

  IFrameChannel.parse = function (msg) {
    return JSON.parse(msg);
  };

  return IFrameChannel;
});

