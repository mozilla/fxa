/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Get a window's origin from a postMessage `message` event.
 * This scheme is used instead of checking the referrer header or
 * document.referrer because the referrer header can be disabled/spoofed.
 * A postMessage event's origin is set by the browser and is trusted.
 *
 * A list of allowed origins are passed to getOrigin. If embedded
 * in an oauth flow, the list will have a length of 1. If used for sync,
 * the list can be >1. We do not know which parent we are talking to so
 * must query all possible parents to figure out which parent is framing.
 *
 * The protocol is:
 * Send a `{ command: 'ping' }` postMessage to all of the allowed origins.
 * Wait for a `{ command: 'ping' }` postMessage response. Only one response
 * should be received.
 *
 * The received message event's origin is checked against the list of
 * allowed origins. If the origin is allowed, it is returned. If no origin
 * is found after a short period, return `null`.
 */

define(function (require, exports, module) {
  'use strict';

  var IFrameChannel = require('lib/channels/iframe');
  var p = require('lib/promise');
  var Raven = require('raven');

  // This timeout needs to be long enough for slow machines to able to respond to
  // See https://github.com/mozilla/fxa-content-server/issues/2946 for details
  var RESPONSE_TIMEOUT_MS = 5000;

  function OriginCheck(options) {
    options = options || {};

    this._window = options.window || window;
    if ('responseTimeoutMS' in options) {
      this._responseTimeoutMS = options.responseTimeoutMS;
    }
  }

  OriginCheck.prototype = {
    /**
     * Amount of time in milliseconds to wait for a response
     * from the parent before giving up.
     */
    _responseTimeoutMS: RESPONSE_TIMEOUT_MS,

    /**
     * Get the origin of a targetWindow
     *
     * @method getOrigin
     * @param {Window} targetWindow
     * @param {Array of Strings} allowedOrigins - a list of allowed origins.
     * @returns {Promise}
     *          Resolves to the parent's origin, if the parent's origin is in
     *          the list of allowed origins.
     *          Resolves to `null` if no allowed origin found.
     */
    getOrigin: function (targetWindow, allowedOrigins) {
      var win = this._window;
      var deferred = p.defer();

      var onMessage = function onMessage(event) {
        if (allowedOrigins.indexOf(event.origin) === -1) {
          // unexpected domain, ignore.
          return;
        }

        var data = OriginCheck.parse(event.data);
        if (data && data.command === 'ping') {
          deferred.resolve(event.origin);
        }
      };

      win.addEventListener('message', onMessage, true);

      // ping the target window, sending a message to each of the allowed origins.
      allowedOrigins.forEach(function (allowedOrigin) {
        targetWindow.postMessage(OriginCheck.stringify('ping'), allowedOrigin);
      });
      return deferred.promise
        // timeout after a short period. If no response is received,
        // no parent is listening.
        .timeout(this._responseTimeoutMS)
        .fail(function (err) {
          if (/Timed out/.test(String(err))) {
            // a timeout is A-OK, no allowed origins are listening.
            Raven.captureException(new Error('Origin check timed out'));

            return null;
          } else {
            Raven.captureException(err);
          }
        })
        .fin(function () {
          win.removeEventListener('message', onMessage, true);
        });
    }
  };


  OriginCheck.stringify = function (command) {
    return IFrameChannel.stringify(command);
  };

  OriginCheck.parse = function (data) {
    try {
      return IFrameChannel.parse(data);
    } catch (e) {
      // malformed message, drop it on the ground.
    }
  };

  module.exports = OriginCheck;
});


