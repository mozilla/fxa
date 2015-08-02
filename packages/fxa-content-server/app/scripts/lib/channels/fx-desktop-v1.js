/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel used to communicate with Firefox Desktop using
// a CustomEvent sender and a postMessage receiver. This is
// the v1 way of communicating with the browser for Sync.

define([
  'underscore',
  'lib/channels/duplex',
  'lib/channels/senders/fx-desktop-v1',
  'lib/channels/receivers/postmessage'
], function (_, DuplexChannel, FxDesktopV1Sender, PostMessageReceiver) {
  'use strict';

  function FxDesktopV1Channel() {
  }

  _.extend(FxDesktopV1Channel.prototype, new DuplexChannel(), {
    initialize: function (options) {
      options = options || {};

      var win = options.window || window;

      var sender = this._sender = new FxDesktopV1Sender();
      sender.initialize({
        window: win
      });

      var receiver = this._receiver = new PostMessageReceiver();
      receiver.initialize({
        window: win,
        origin: options.origin
      });

      DuplexChannel.prototype.initialize.call(this, {
        window: win,
        sender: sender,
        receiver: receiver
      });
    },

    createMessageId: function (command) {
      // The browser does not return messageIds, it silently ignores any
      // that are sent. It will return a `status` field that is the same
      // as the command. Use the command (which is returned as status)
      // as the messageId.
      return command;
    },

    parseMessage: function (message) {
      if (! (message && message.content)) {
        throw new Error('malformed message');
      }

      var content = message.content;
      return {
        command: content.status,
        // The browser does not return messageIds, it returns a `status` field
        // in the content. Use the `status` field as the messageId.
        // See
        // https://dxr.mozilla.org/mozilla-central/source/browser/base/content/aboutaccounts/aboutaccounts.js#244
        // and
        // https://dxr.mozilla.org/mozilla-central/source/browser/base/content/aboutaccounts/aboutaccounts.js#193
        messageId: content.status,
        data: content.data
      };
    }
  });

  return FxDesktopV1Channel;
});


