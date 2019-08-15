/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the window object for testing.

import _ from 'underscore';
import Backbone from 'backbone';
import NullStorage from 'lib/null-storage';
import sinon from 'sinon';

function MutationObserver(notifier) {
  return {
    observe: sinon.spy(),
    disconnect: sinon.spy(),
    // test function to call notifier.
    mockNotify(mutations) {
      notifier(mutations);
    },
  };
}

function WindowMock() {
  var win = this;

  this.location = {
    host: window.location.host,
    href: window.location.href,
    origin: window.location.origin,
    pathname: '/',
    search: window.location.search,
  };

  this.document = {
    body: window.document.body,
    cookie: '',
    documentElement: {
      className: '',
      clientHeight: window.document.documentElement.clientHeight,
      clientWidth: window.document.documentElement.clientWidth,
    },
    referrer: window.document.referrer,
    title: window.document.title,
  };

  this.history = {
    back() {
      win.history.back.called = true;
    },
    replaceState() {},
  };

  this.navigator = {
    userAgent: window.navigator.userAgent,
    mediaDevices: {
      getUserMedia(options) {
        return new Promise((resolve, reject) => {
          var nav = this;
          this._opts = options;

          setTimeout(function() {
            var stream = {
              stop() {},
            };
            if (nav._error) {
              reject(nav._error);
            } else {
              resolve(stream);
            }
            setTimeout(function() {
              win.trigger('stream');
            }, 0);
          }, 0);
        });
      },
    },
    sendBeacon() {},
  };

  this.URL = {
    createObjectURL(/*stream*/) {
      return '';
    },
  };

  // Create a console wrapper whose members can be safely
  // stubbed in using sinon.
  this.console = {
    error: console.error.bind(console),
    info: console.info.bind(console),
    log: console.log.bind(console),
    trace: console.trace
      ? console.trace.bind(console)
      : console.log.bind(console),
    warn: console.warn.bind(console),
  };

  this.localStorage = new NullStorage();
  this.sessionStorage = new NullStorage();
  this.top = this;

  this.MutationObserver = MutationObserver;
}

_.extend(WindowMock.prototype, Backbone.Events, {
  dispatchEvent(event) {
    var msg = event.detail.command || event.detail.message;

    var listenerEvent = {
      data: {
        content: event.detail.data,
        type: msg,
      },
      origin: event.origin,
    };

    this.trigger(msg, listenerEvent);

    if (!this.dispatchedEvents) {
      this.dispatchedEvents = {};
    }

    if (typeof msg === 'object') {
      this.dispatchedEvents[msg.command] = msg;
    } else {
      this.dispatchedEvents[msg] = true;
    }
  },

  isEventDispatched(eventName) {
    return !!(this.dispatchedEvents && this.dispatchedEvents[eventName]);
  },

  addEventListener(msg, callback /*, bubbles*/) {
    this.on(msg, callback);
  },

  removeEventListener(msg, callback /*, bubbles*/) {
    this.off(msg, callback);
  },

  // Cannot be converted to object shorthand notation
  // because it's used as a constructor.
  CustomEvent: function(command, data) {
    return data;
  },

  scrollTo(/*x, y*/) {},

  setTimeout(/*callback, timeoutMS*/) {
    this._isTimeoutSet = true;
    return 'timeout';
  },

  isTimeoutSet() {
    return !!this._isTimeoutSet;
  },

  clearTimeout(/*timeout*/) {},

  navigator: {
    language: 'en-US',
  },

  open(url /*, target, windowName*/) {
    console.log('window.open was called with', url);
  },

  postMessage(/*msg, targetOrigin*/) {},
});

export default WindowMock;
