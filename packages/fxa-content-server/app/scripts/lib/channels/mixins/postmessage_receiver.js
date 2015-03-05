/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * A channel mixin that expects responses to sent messages. Responses
 * are expected to be received via a postMessage to the window.
 */

define([
  'underscore',
  'lib/auth-errors'
], function (_, AuthErrors) {
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
      this._origin = options.origin;
      this._metrics = options.metrics;

      this._boundReceiveMessage = _.bind(this.receiveMessage, this);
      this.window.addEventListener('message', this._boundReceiveMessage, false);

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

    isEventFromExpectedOrigin: function (event) {
      // `message` events that come from the Fx Desktop browser have an
      // origin of the string constant 'null'. See
      // https://developer.mozilla.org/docs/Web/API/Window/postMessage#Using_win.postMessage_in_extensions
      // and
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1040257
      //
      // Events from the browser are trusted by default.
      if (event.origin === 'null') {
        return true;
      }

      // If the event is not from the browser, it must be from
      // the expected origin.
      return this._origin === event.origin;
    },

    receiveMessage: function (event) {
      if (! this.isEventFromExpectedOrigin(event)) {
        // from an unexpected origin, drop it on the ground.
        var err = AuthErrors.toError('UNEXPECTED_POSTMESSAGE_ORIGIN');
        // set the unexpected origin as the context, this will be logged.
        err.context = event.origin;
        this._metrics.logError(err);

        this.window.console.error(
          'postMessage received from %s, expected %s', event.origin, this._origin);
        return;
      }

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
    },

    /**
     * Get the origin from which messages are accepted.
     *
     * @method getOrigin.
     */
    getOrigin: function () {
      return this._origin;
    }
  };

  return PostMessageReceiverMixin;
});

