/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Firefox for desktop native=>FxA glue code.

define([
  'underscore',
  'lib/channels/base'
],
function (_, BaseChannel) {
  var DEFAULT_SEND_TIMEOUT_LENGTH_MS = 1000;

  function noOp() {
    // Nothing to do here.
  }

  function createEvent(command, data) {
    /*jshint validthis: true*/
    return new this.window.CustomEvent('FirefoxAccountsCommand', {
      detail: {
        command: command,
        data: data,
        bubbles: true
      }
    });
  }

  function errorIfNoResponse(outstandingRequest) {
    /*jshint validthis: true*/
    outstandingRequest.timeout = setTimeout(function () {
      // only called if the request has not been responded to.
      console.error('no response from browser');
      outstandingRequest.done(new Error('Unexpected error'));
    }, this.sendTimeoutLength);
  }

  function receiveMessage(event) {
    /*jshint validthis: true*/
    var result = event.data.content;
    if (! result) {
      return;
    }

    var type = event.data.type;
    var command = result.status;

    if (type === 'message') {
      var outstandingRequest = this.outstandingRequests[command];
      if (outstandingRequest) {
        clearTimeout(outstandingRequest.timeout);
        delete this.outstandingRequests[command];

        outstandingRequest.done(null, result);
      }

      this.trigger(command, result);
    }
  }

  function Channel() {
    // nothing to do here.
  }

  _.extend(Channel.prototype, new BaseChannel(), {
    init: function init(options) {
      options = options || {};

      this.outstandingRequests = {};

      this.window = options.window || window;

      this._boundReceiveMessage = _.bind(receiveMessage, this);
      this.window.addEventListener('message', this._boundReceiveMessage, false);

      this.sendTimeoutLength = options.sendTimeoutLength || DEFAULT_SEND_TIMEOUT_LENGTH_MS;
    },

    teardown: function () {
      for (var key in this.outstandingRequests) {
        var item = this.outstandingRequests[key];
        clearTimeout(item.timeout);
      }

      this.window.removeEventListener('message', this._boundReceiveMessage, false);
    },

    send: function (command, data, done) {
      done = done || noOp;

      if (command === 'should_auto_complete_after_email_verification') {
        return done(null, { should_auto_complete_after_email_verification: false }); //jshint ignore: line
      }

      var outstanding = this.outstandingRequests[command];
      if (! outstanding) {
        // if this is a resend, retriesCompleted has already been updated
        // and none of the other data needs to be updated.
        outstanding = this.outstandingRequests[command] = {
          done: done,
          command: command,
          data: data
        };
      }

      try {
        // Browsers can blow up dispatching the event.
        // Ignore the blowups and return without retrying.
        var event = createEvent.call(this, command, data);
        this.window.dispatchEvent(event);
      } catch (e) {
        // something went wrong sending the message and we are not going to
        // retry, no need to keep track of it any longer.
        delete this.outstandingRequests[command];
        return done && done(e);
      }

      errorIfNoResponse.call(this, outstanding);
    }
  });

  return Channel;

});

