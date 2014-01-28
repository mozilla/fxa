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
    // nothing to do here.
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
    location: {
      href: window.location.href,
      search: window.location.search
    }
  });

  return WindowMock;
});
