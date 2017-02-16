/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Receive a message from the browser over a WebChannel. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
 */


define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Backbone = require('backbone');
  const Logger = require('lib/logger');
  const Raven = require('raven');

  function WebChannelReceiver() {
    // nothing to do
  }
  _.extend(WebChannelReceiver.prototype, Backbone.Events, {
    initialize (options) {
      options = options || {};

      this._window = options.window;
      this._boundReceiveMessage = this.receiveMessage.bind(this);
      this._window.addEventListener('WebChannelMessageToContent', this._boundReceiveMessage, true);
      this._webChannelId = options.webChannelId;
      this._logger = new Logger(this._window);
    },

    receiveMessage (event) {
      const detail = event.detail;

      if (! (detail && detail.id)) {
        // malformed message
        this._logger.error('malformed WebChannelMessageToContent event', JSON.stringify(detail));
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
      const message = detail.message;
      if (message && ! this._reportCaughtErrors(message)) {
        this.trigger('message', message);
      }
    },

    /**
     * Determine if the message received had an error reported.
     *
     * @param {Object} message received from the WebChannel
     * @returns {Boolean}
     * @private
     */
    _reportCaughtErrors (message) {
      // this is super confusing, so read carefully:
      // there are two ways the error can be reported. Either `message.error` or `message.data.error`.
      let errorMsg = 'Unknown error';
      let errorStack = null;
      let reportedError = false;

      if (message.error && _.isString(message.error)) {
        // if it is a String then it is probably an error from WebChannel.jsm
        // Example: https://dxr.mozilla.org/mozilla-central/rev/bad312aefb42982f492ad2cf36f4c6c3d698f4f7/toolkit/modules/WebChannel.jsm#101
        errorMsg = message.error;
        reportedError = true;
      } else if (message.data && message.data.error) {
        // if it has an error Object that means it is a component error with a stack
        errorMsg = message.data.error.message;
        errorStack = message.data.error.stack;
        reportedError = true;
      }

      if (reportedError) {
        this._logger.error('WebChannel error:', errorMsg);
        Raven.captureMessage('WebChannel error: ' + errorMsg, {
          // manually capture the stack as a custom field
          extra: {
            stackTrace: errorStack
          }
        });
      }

      return reportedError;
    },

    teardown () {
      this._window.removeEventListener('WebChannelMessageToContent', this._boundReceiveMessage, true);
    }
  });

  module.exports = WebChannelReceiver;
});
