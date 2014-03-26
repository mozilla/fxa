/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Firefox for desktop native=>FxA glue code.

define([
  'underscore',
  'backbone',
  'lib/session'
],
function (_, Backbone, Session) {
  var SEND_TIMEOUT_LENGTH_MS = 1000;

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
    outstandingRequest.timeout = setTimeout(_.bind(function () {
      // only called if the request has not been responded to.
      outstandingRequest.done(new Error('too many retries'));
    }, this), this.sendTimeoutLength);
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

  function findInitialPage() {
    /*jshint validthis: true*/

    this.send('session_status', {}, _.bind(function (err, response) {
      // Don't perform any redirection if a pathname is present
      var hasPathName = this.window.location.pathname !== '/';

      if (err) {
        return;
      }

      if (response.data) {
        Session.set('email', response.data.email);
        if (!Session.forceAuth && !hasPathName) {
          this.router.navigate('settings', { trigger: true });
        }
      } else {
        Session.clear();
        if (!hasPathName) {
          this.router.navigate('signup', { trigger: true });
        }
      }
    }, this));
  }

  function Channel() {
    // nothing to do here.
  }

  _.extend(Channel.prototype, Backbone.Events, {
    init: function init(options) {
      options = options || {};

      this.outstandingRequests = {};

      this.window = options.window || window;

      this.window.addEventListener(
              'message', _.bind(receiveMessage, this), false);

      this.sendTimeoutLength = options.sendTimeoutLength || SEND_TIMEOUT_LENGTH_MS;
      this.router = options.router || window.router;

      findInitialPage.call(this);
    },

    teardown: function () {
      for (var key in this.outstandingRequests) {
        var item = this.outstandingRequests[key];
        clearTimeout(item.timeout);
      }
    },

    send: function (command, data, done) {
      done = done || noOp;

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

