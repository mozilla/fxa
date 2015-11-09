/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Receive a message from the browser over a WebChannel. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
 */


define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');

  function WebChannelReceiver() {
    // nothing to do
  }
  _.extend(WebChannelReceiver.prototype, Backbone.Events, {
    initialize: function (options) {
      options = options || {};

      this._window = options.window;
      this._boundReceiveMessage = this.receiveMessage.bind(this);
      this._window.addEventListener('WebChannelMessageToContent', this._boundReceiveMessage, true);
      this._webChannelId = options.webChannelId;
    },

    receiveMessage: function (event) {
      var detail = event.detail;

      if (! (detail && detail.id)) {
        // malformed message
        this._window.console.error('malformed WebChannelMessageToContent event', JSON.stringify(detail));
        return;
      }

      if (detail.id !== this._webChannelId) {
        // not from the expected WebChannel, silently ignore.
        return;
      }

      // Fx has an error where error responses are sent with neither
      // an `error` nor a `message` field. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1173830
      //
      // Ignore events with no `message` field.
      var message = detail.message;
      if (message) {
        this.trigger('message', message);
      }
    },

    teardown: function () {
      this._window.removeEventListener('WebChannelMessageToContent', this._boundReceiveMessage, true);
    }
  });

  module.exports = WebChannelReceiver;
});

