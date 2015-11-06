/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Send a message to the browser using a FirefoxAccountsCommand.
 */

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');

  function FxDesktopV1Sender() {
    // nothing to do here.
  }

  FxDesktopV1Sender.prototype = {
    initialize: function (options) {
      options = options || {};

      this._window = options.window;
    },

    send: function (command, data, messageId) {
      var self = this;
      return p().then(function () {
        return self.dispatchCommand(command, data, messageId);
      });
    },

    dispatchCommand: function (command, data, messageId) {
      var win = this._window;
      var event = createEvent(win, command, data, messageId);
      win.dispatchEvent(event);
    },

    teardown: function () {
      // nothing to do.
    }
  };

  // messageId is ignored by FxDesktop
  function createEvent(win, command, data/*, messageId*/) {
    return new win.CustomEvent('FirefoxAccountsCommand', {
      detail: {
        bubbles: true,
        command: command,
        data: data
      }
    });
  }

  module.exports = FxDesktopV1Sender;
});


