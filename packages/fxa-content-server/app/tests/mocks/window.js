/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the window object for testing.

'use strict';

define([
  'underscore',
  'backbone'
],
function (_, Backbone) {
  function WindowMock() {
    this.translator = window.translator;
    this.location = {
      href: window.location.href,
      search: window.location.search,
      pathname: '/',
    };

    this.document = {
      title: window.document.title
    };
  }

  _.extend(WindowMock.prototype, Backbone.Events, {
    dispatchEvent: function (event) {
      var msg = event.detail.command;

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

      this.dispatchedEvents[msg] = true;
    },

    addEventListener: function(msg, callback, bubbles) {
      this.on(msg, callback);
    },

    CustomEvent: function(command, data) {
      return data;
    },

    scrollTo: function(x, y) {
    },

    setTimeout: function (callback, timeoutMS) {
      this._isTimeoutSet = true;
      return 'timeout';
    },

    isTimeoutSet: function () {
      return !!this._isTimeoutSet;
    },

    clearTimeout: function (timeout) {
    }
  });

  return WindowMock;
});
