/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Receive a message from the browser over a WebChannel. See
 * https://developer.mozilla.org/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
 */

import _ from 'underscore';
import Backbone from 'backbone';
import Logger from 'lib/logger';
import Raven from 'raven';

function WebChannelReceiver() {
  // nothing to do
}
_.extend(WebChannelReceiver.prototype, Backbone.Events, {
  initialize(options) {
    options = options || {};

    this._window = options.window;
    this._boundReceiveMessage = this.receiveMessage.bind(this);
    this._window.addEventListener(
      'WebChannelMessageToContent',
      this._boundReceiveMessage,
      true
    );
    this._webChannelId = options.webChannelId;
    this._logger = new Logger(this._window);
  },

  receiveMessage(event) {
    const detail = event.detail;

    if (!(detail && detail.id)) {
      // malformed message
      this._logger.error(
        'malformed WebChannelMessageToContent event',
        JSON.stringify(detail)
      );
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
    if (message) {
      const error = this._extractErrorFromMessage(message);
      if (error) {
        this._reportError(error);
        message.error = error;
        this.trigger('error', message);
      } else {
        this.trigger('message', message);
      }
    }
  },

  /**
   * Report the WebChannel error.
   *
   * @param {Object} error={}
   *   @param {String} message error message
   *   @param {String} stack stack trace
   */
  _reportError(error) {
    this._logger.error('WebChannel error:', error.message);
    Raven.captureMessage('WebChannel error: ' + error.message, {
      // manually capture the stack as a custom field
      extra: {
        stackTrace: error.stack,
      },
    });
  },

  /**
   * Extract any errors from the WebChannel message.
   *
   * @param {Object} message
   * @returns {Object} if an error exists, contains two fields, `message`, `stack`
   */
  _extractErrorFromMessage(message) {
    // this is super confusing, so read carefully:
    // there are two ways the error can be reported. Either `message.error` or `message.data.error`.
    if (message.error && _.isString(message.error)) {
      // if it is a String then it is probably an error from WebChannel.jsm
      // Example: https://dxr.mozilla.org/mozilla-central/rev/bad312aefb42982f492ad2cf36f4c6c3d698f4f7/toolkit/modules/WebChannel.jsm#101
      return {
        message: message.error,
        stack: null,
      };
    } else if (message.data && message.data.error) {
      // if it has an error Object that means it is a component error with a stack
      return {
        message: message.data.error.message,
        stack: message.data.error.stack,
      };
    }
  },

  teardown() {
    this._window.removeEventListener(
      'WebChannelMessageToContent',
      this._boundReceiveMessage,
      true
    );
  },
});

export default WebChannelReceiver;
