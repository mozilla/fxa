/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel that completes the OAuth flow using Firefox WebChannel events
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/FxAccountsOAuthClient.jsm

'use strict';

define([
  'underscore',
  'lib/url',
  'lib/channels/base'
], function (_, Url, BaseChannel) {

  function noOp() {
    // it's a noOp, nothing to do.
  }

  function WebChannel(id) {
    if (! id) {
      throw new Error('WebChannel must have an id');
    }

    this.id = id;
  }

  _.extend(WebChannel.prototype, new BaseChannel(), {
    init: function (options) {
      options = options || {};

      this._window = options.window || window;
    },

    /**
     * Creates a new WebChannelMessageToChrome CustomEvent and dispatches it.
     * The event is received by a content script in Firefox
     *
     * @param {String} command
     *        Command name
     * @param {Object} data
     *        Message Object
     * @param {Function} [done]
     *        Optional callback function
     */
    send: function (command, data, done) {
      done = done || noOp;

      try {
        // Browsers can blow up dispatching the event.
        // Ignore the blowups and return without retrying.
        var event = this.createEvent(command, data);
        this._window.dispatchEvent(event);
      } catch (e) {
        return done && done(e);
      }

      done(null);
    },
    /**
     * Create a WebChannel compatible custom event
     * @param {String} command
     *        Command name
     * @param {Object} data
     *        Message object
     * @returns CustomEvent
     */
    createEvent: function(command, data) {
      return new this._window.CustomEvent('WebChannelMessageToChrome', {
        detail: {
          id: this.id,
          message: {
            command: command,
            data: data
          }
        }
      });
    }
  });

  return WebChannel;
});
