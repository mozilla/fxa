/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the window object for testing.

define([
  'underscore',
  'backbone'
],
function (_, Backbone) {
  'use strict';

  function WindowMock() {
    var self = this;

    this.translator = window.translator;
    this.location = {
      href: window.location.href,
      search: window.location.search,
      pathname: '/'
    };

    this.document = {
      title: window.document.title
    };

    this.history = {
      back: function () {
        self.history.back.called = true;
      }
    };

    this.navigator = {
      userAgent: window.navigator.userAgent,
      getUserMedia: function (options, cb, errb) {
        var nav = this;
        this._opts = options;
        setTimeout(function () {
          var stream = {
            stop: function () {
            }
          };
          if (nav._error) {
            errb(nav._error);
          } else {
            cb(stream);
          }
          self.trigger('stream');
        }, 0);
      }
    };

    this.URL = {
      createObjectURL: function (stream) {
        return '';
      }
    };

    this.console = window.console;
  }

  _.extend(WindowMock.prototype, Backbone.Events, {
    dispatchEvent: function (event) {
      var msg = event.detail.command || event.detail.message;

      var listenerEvent = {
        data: {
          type: msg,
          content: event.detail.data
        }
      };

      this.trigger(msg, listenerEvent);

      if (! this.dispatchedEvents) {
        this.dispatchedEvents = {};
      }

      if (typeof msg === 'object') {
        this.dispatchedEvents[msg.command] = msg;
      } else {
        this.dispatchedEvents[msg] = true;
      }
    },

    isEventDispatched: function (eventName) {
      return !! (this.dispatchedEvents && this.dispatchedEvents[eventName]);
    },

    addEventListener: function (msg, callback, bubbles) {
      this.on(msg, callback);
    },

    removeEventListener: function (msg, callback, bubbles) {
      this.off(msg, callback);
    },

    CustomEvent: function (command, data) {
      return data;
    },

    scrollTo: function (x, y) {
    },

    setTimeout: function (callback, timeoutMS) {
      this._isTimeoutSet = true;
      return 'timeout';
    },

    isTimeoutSet: function () {
      return !!this._isTimeoutSet;
    },

    clearTimeout: function (timeout) {
    },

    navigator: {
      language: 'en-US'
    }
  });

  return WindowMock;
});
