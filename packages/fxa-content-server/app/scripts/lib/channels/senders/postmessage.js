/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Send a message to a window using postMessage. Sent messages
 * will be a JSON.stringify'd object with the following format:
 *
 * {
 *   messageId: <string>,
 *   command: <string>,
 *   data: <object>
 * }
 *
 * `messageId` is sent if Firefox Accounts expects a response. When
 * responding, the `messageId` should be sent with the response.
 *
 * `command` is the message command.
 *
 * `data` is an object with any extra data.
 */

define(function (require, exports, module) {
  'use strict';

  function PostMessageSender() {
    // nothing to do here.
  }

  PostMessageSender.prototype = {
    initialize (options) {
      options = options || {};

      this._origin = options.origin;
      this._window = options.window;
    },

    send (command, data, messageId) {
      return Promise.resolve().then(() => {
        var event = stringify(command, data, messageId);
        this._window.postMessage(event, this._origin);
      });
    },

    teardown () {
    }
  };

  function stringify(command, data, messageId) {
    return JSON.stringify({
      command: command,
      data: data || {},
      messageId: messageId
    });
  }

  module.exports = PostMessageSender;
});


