/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Send a message to the browser over a WebChannel. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
 */

define(function (require, exports, module) {
  'use strict';

  const p = require('lib/promise');

  function WebChannelSender() {
    // nothing to do here.
  }

  WebChannelSender.prototype = {
    initialize: function (options) {
      options = options || {};

      this._window = options.window;
      this._webChannelId = options.webChannelId;
    },

    send: function (command, data, messageId) {
      return p().then(() => {
        // save command name for testing purposes
        this._saveEventName(command);

        var event = createEvent(
          this._window, this._webChannelId, command, data, messageId);
        this._window.dispatchEvent(event);
      });
    },

    teardown: function () {
    },

    _saveEventName: function (command) {
      var storedEvents;
      try {
        storedEvents = JSON.parse(this._window.sessionStorage.getItem('webChannelEvents')) || [];
      } catch (e) {
        storedEvents = [];
      }

      storedEvents.push(command);
      try {
        this._window.sessionStorage.setItem('webChannelEvents', JSON.stringify(storedEvents));
      } catch (e) {
      }
    }
  };

  function createEvent(win, webChannelId, command, data, messageId) {
    return new win.CustomEvent('WebChannelMessageToChrome', {
      detail: {
        id: webChannelId,
        message: {
          command: command,
          data: data,
          messageId: messageId
        }
      }
    });
  }

  module.exports = WebChannelSender;
});


