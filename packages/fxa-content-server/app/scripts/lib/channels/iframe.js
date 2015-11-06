/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A channel that takes care of the IFRAME'd OAuth flow.
 *
 * An RPs origin must match the origin registered for the client_id
 * on the URL.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var DuplexChannel = require('lib/channels/duplex');
  var PostMessageReceiver = require('lib/channels/receivers/postmessage');
  var PostMessageSender = require('lib/channels/senders/postmessage');

  function IFrameChannel() {
    // constructor, nothing to do.
  }

  _.extend(IFrameChannel.prototype, new DuplexChannel(), {
    initialize: function (options) {
      options = options || {};

      var win = options.window || window;

      var sender = this._sender = new PostMessageSender();
      sender.initialize({
        origin: options.origin,
        window: win.parent
      });

      var receiver = this._receiver = new PostMessageReceiver();
      receiver.initialize({
        origin: options.origin,
        window: win
      });

      DuplexChannel.prototype.initialize.call(this, {
        receiver: receiver,
        sender: sender,
        window: win
      });
    },

    receiveEvent: function (event) {
      return this._receiver.receiveEvent(event);
    },

    parseMessage: function (message) {
      try {
        return IFrameChannel.parse(message);
      } catch (e) {
        // invalid message, drop it on the ground.
      }
    }
  });

  IFrameChannel.stringify = function (command, data) {
    return JSON.stringify({
      command: command,
      data: data || {}
    });
  };

  IFrameChannel.parse = function (msg) {
    var parsed = JSON.parse(msg);
    if (! parsed.messageId) {
      parsed.messageId = parsed.command;
    }

    return parsed;
  };

  module.exports = IFrameChannel;
});

