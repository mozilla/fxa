/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel that completes the OAuth flow using Firefox WebChannel events
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/FxAccountsOAuthClient.jsm

define([
  'underscore',
  'lib/channels/duplex',
  'lib/channels/senders/web-channel',
  'lib/channels/receivers/web-channel'
], function (_, DuplexChannel, WebChannelSender, WebChannelReceiver) {
  'use strict';

  function WebChannel(id) {
    if (! id) {
      throw new Error('WebChannel must have an id');
    }

    this._id = id;
  }

  _.extend(WebChannel.prototype, new DuplexChannel(), {
    initialize: function (options) {
      options = options || {};

      var win = options.window || window;
      var webChannelId = this._id;

      var sender = this._sender = new WebChannelSender();
      sender.initialize({
        webChannelId: webChannelId,
        window: win
      });

      var receiver = this._receiver = new WebChannelReceiver();
      receiver.initialize({
        webChannelId: webChannelId,
        window: win
      });

      DuplexChannel.prototype.initialize.call(this, {
        receiver: receiver,
        sender: sender,
        window: win
      });
    }
  });

  return WebChannel;
});
