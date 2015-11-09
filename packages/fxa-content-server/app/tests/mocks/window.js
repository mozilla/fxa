/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the window object for testing.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var NullStorage = require('lib/null-storage');
  var sinon = require('sinon');

  function MutationObserver (notifier) {
    return {
      observe: sinon.spy(),
      disconnect: sinon.spy(),
      // test function to call notifier.
      mockNotify: function (mutations) {
        notifier(mutations);
      }
    };
  }

  function WindowMock() {
    var self = this;

    this.translator = window.translator;
    this.location = {
      host: window.location.host,
      href: window.location.href,
      origin: window.location.origin,
      pathname: '/',
      search: window.location.search
    };

    this.document = {
      body: window.document.body,
      documentElement: {
        className: '',
        clientHeight: window.document.documentElement.clientHeight
      },
      referrer: window.document.referrer,
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
      },
      sendBeacon: function () {}
    };

    this.URL = {
      createObjectURL: function (/*stream*/) {
        return '';
      }
    };

    // Create a console wrapper whose members can be safely
    // stubbed in using sinon.
    this.console = {
      error: console.error.bind(console),
      info: console.info.bind(console),
      log: console.log.bind(console),
      trace: console.trace ? console.trace.bind(console) : console.log.bind(console),
      warn: console.warn.bind(console)
    };

    this.localStorage = new NullStorage();
    this.sessionStorage = new NullStorage();
    this.top = this;


    this.MutationObserver = MutationObserver;
  }

  _.extend(WindowMock.prototype, Backbone.Events, {
    dispatchEvent: function (event) {
      var msg = event.detail.command || event.detail.message;

      var listenerEvent = {
        data: {
          content: event.detail.data,
          type: msg
        },
        origin: event.origin
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

    addEventListener: function (msg, callback/*, bubbles*/) {
      this.on(msg, callback);
    },

    removeEventListener: function (msg, callback/*, bubbles*/) {
      this.off(msg, callback);
    },

    CustomEvent: function (command, data) {
      return data;
    },

    scrollTo: function (/*x, y*/) {
    },

    setTimeout: function (/*callback, timeoutMS*/) {
      this._isTimeoutSet = true;
      return 'timeout';
    },

    isTimeoutSet: function () {
      return !! this._isTimeoutSet;
    },

    clearTimeout: function (/*timeout*/) {
    },

    navigator: {
      language: 'en-US'
    },

    open: function (url/*, target, windowName*/) {
      console.log('window.open was called with', url);
    },

    postMessage: function (/*msg, targetOrigin*/) {
    }
  });

  module.exports = WindowMock;
});
