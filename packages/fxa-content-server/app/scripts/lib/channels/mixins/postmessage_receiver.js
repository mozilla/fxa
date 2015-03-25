/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * A channel mixin that expects responses to sent messages. Responses
 * are expected to be received via a postMessage to the window.
 */

define([
  'underscore'
], function (_) {
  var DEFAULT_SEND_TIMEOUT_LENGTH_MS = 90 * 1000;

  function noOp() {
    // it's a noOp, nothing to do.
  }

  function getOutstandingRequest(command) {
    /*jshint validthis: true*/
    return this._outstandingRequests[command];
  }

  function clearOutstandingRequest(command) {
    /*jshint validthis: true*/
    var outstandingRequest = getOutstandingRequest.call(this, command);
    if (outstandingRequest) {
      this.window.clearTimeout(outstandingRequest.timeout);
      delete this._outstandingRequests[command];
    }
  }

  function setResponseTimeoutTimer(outstandingRequest) {
    /*jshint validthis: true*/
    outstandingRequest.timeout = this.window.setTimeout(function (command) {
      this.window.console.error('Response not received for: ' + command);
    }.bind(this, outstandingRequest.command), this._sendTimeoutLength);
  }

  var PostMessageReceiverMixin = {
    init: function (options) {
      options = options || {};

      this.window = options.window || window;

      this._boundReceiveMessage = _.bind(this.receiveMessage, this);
      this.window.addEventListener('message', this._boundReceiveMessage, true);

      this._outstandingRequests = {};
      this._sendTimeoutLength = options.sendTimeoutLength || DEFAULT_SEND_TIMEOUT_LENGTH_MS;
    },

    teardown: function () {
      for (var key in this._outstandingRequests) {
        clearOutstandingRequest.call(this, key);
      }

      this.window.removeEventListener('message', this._boundReceiveMessage, false);
    },

    send: function (command, data, done) {
      done = done || noOp;

      var outstanding = this._outstandingRequests[command];
      if (! outstanding) {
        // if this is a resend, retriesCompleted has already been updated
        // and none of the other data needs to be updated.
        outstanding = this._outstandingRequests[command] = {
          done: done,
          command: command,
          data: data
        };
      }

      try {
        // Browsers can blow up dispatching the event.
        // Ignore the blowups and return without retrying.
        this.dispatchCommand(command, data);
      } catch (e) {
        // something went wrong sending the message and we are not going to
        // retry, no need to keep track of it any longer.
        delete this._outstandingRequests[command];
        return done(e);
      }

      setResponseTimeoutTimer.call(this, outstanding);
    },

    receiveMessage: function (event) {
      // TODO - Ensure the event.origin is one we trust,
      // esp in the iframe case

      var components = this.parseMessage(event.data);
      if (components) {
        var command = components.command;
        var data = components.data || {};

        var outstandingRequest = getOutstandingRequest.call(this, command);
        clearOutstandingRequest.call(this, command);
        if (outstandingRequest) {
          data.origin = event.origin;
          outstandingRequest.done(null, data);
        }

        this.trigger(command, data);
      }
    }
  };

  return PostMessageReceiverMixin;
});

