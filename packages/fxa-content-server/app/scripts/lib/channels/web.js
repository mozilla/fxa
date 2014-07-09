/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// A web channel to send Custom Events.

define([
    'underscore',
    'backbone'
  ],
  function (_, Backbone) {
    function WebChannel(webChannelId, context) {
      this.webChannelId = webChannelId || 'message';
      this.window = context || window;
      this._messageCallbacks = [];
      this._messageListenerAttached = false;
    }

    _.extend(WebChannel.prototype, Backbone.Events, {
      init: function () {
      },
      /**
       * Teardown function for the WebChannel
       */
      teardown: function () {
        this.window.removeEventListener('WebChannelMessageToContent', this._messageListener);
        this._messageCallbacks = [];
        this._messageListenerAttached = false;
      },
      /**
       * Send Custom Event on 'this.window'
       * @param message {Object}
       *        Message Data
       * @param [done] {Function}
       *        Callback function
       */
      send: function (message, done) {
        done = done || noOp;

        try {
          // Browsers can blow up dispatching the event.
          // Ignore the blowups and return without retrying.
          this.window.dispatchEvent(this.event(message));
        } catch (e) {
          return done(e);
        }
        return done();
      },
      /**
       * Subscribe to listen on events
       *
       * @param name {String}
       *        Event name
       * @param callback
       *        Callback for the event
       */
      on: function (name, callback) {
        if (name && callback && name === 'message') {
          // only add one message listener
          if (!this._messageListenerAttached) {
            this._messageListenerAttached = true;
            this.window.addEventListener("WebChannelMessageToContent", this._messageListener.bind(this), true);
          }
          this._messageCallbacks.push(callback);
        }
      },
      /**
       * Custom event to send custom events named 'WebChannelMessageToChrome'
       *
       * @param [message] {Object}
       *        Message object
       * @returns {CustomEvent}
       */
      event: function (message) {
        return new this.window.CustomEvent('WebChannelMessageToChrome', {
          detail: {
            webChannelId: this.webChannelId,
            message: message ? message : {}
          }
        });
      },
      /**
       * Event handler for "WebChannelMessageToContent" events
       *
       * @param e {Event}
       * @private
       */
      _messageListener: function (e) {
        var data = e.detail;

        if (data.webChannelId === this.webChannelId && data.message) {
          this._messageCallbacks.forEach(function(callback) {
            callback(data.webChannelId, data.message);
          });
        }
      }
    });

    function noOp() {
    }

    return WebChannel;
  });

