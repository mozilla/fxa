/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A two way channel. Messages can be sent and received. The channel requires
 * both a sender and a receiver. A sender and a receiver are the concrete
 * strategies used to send and receive messages. The decoupling of each
 * direction allows a channel to e.g., send messages via a CustomEvent and
 * receive messages via a postMessage (Fx Desktop Sync v1).
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var BaseChannel = require('lib/channels/base');
  var p = require('lib/promise');

  var DEFAULT_SEND_TIMEOUT_LENGTH_MS = 90 * 1000;

  function OutstandingRequests(options) {
    this._window = options.window;
    this._sendTimeoutLength = options.sendTimeoutLength || DEFAULT_SEND_TIMEOUT_LENGTH_MS;
    this._requests = {};
  }

  OutstandingRequests.prototype = {
    add: function (messageId, request) {
      // remove any old outstanding messages with the same messageId
      this.remove(messageId);

      request.timeout = this._window.setTimeout(function (command) {
        this._window.console.error('Response not received for: ' + command);
      }.bind(this, request.command), this._sendTimeoutLength);

      this._requests[messageId] = request;
    },

    remove: function (messageId) {
      var outstanding = this.get(messageId);
      if (outstanding) {
        this._window.clearTimeout(outstanding.timeout);
        delete this._requests[outstanding.messageId];
      }
    },

    get: function (messageId) {
      return this._requests[messageId];
    },

    clear: function () {
      for (var messageId in this._requests) {
        this.remove(this._requests[messageId]);
      }
    }
  };

  function DuplexChannel() {
  }

  _.extend(DuplexChannel.prototype, new BaseChannel(), {
    initialize: function (options) {
      options = options || {};

      this._sender = options.sender;
      if (! this._sender) {
        throw new Error('DuplexChannel must have a sender');
      }

      this._receiver = options.receiver;
      if (! this._receiver) {
        throw new Error('DuplexChannel must have a receiver');
      }

      // propagate errors outwards
      this._receiver.on('error', this.trigger.bind(this, 'error'));
      this._receiver.on('message', this.onMessageReceived.bind(this));

      this._outstandingRequests = new OutstandingRequests({
        sendTimeoutLength: options.sendTimeoutLength,
        window: options.window
      });
    },

    teardown: function () {
      this._outstandingRequests.clear();
      if (this._sender) {
        this._sender.teardown();
      }

      if (this._receiver) {
        this._receiver.teardown();
      }
    },

    /**
     * Send a message, do not expect a response.
     *
     * @param {String} command
     * @param {Object} [data]
     * @return {Promise}
     *        Promise will resolve whenever message is sent.
     */
    send: function (command, data) {
      var self = this;
      return p()
        .then(function () {
          return self._sender.send(command, data, null);
        });
    },

    /**
     * Send a message, expect a response.
     *
     * @param {String} command
     * @param {Object} [data]
     * @return {Promise}
     *        Promise will resolve when the response is received.
     */
    request: function (command, data) {
      var self = this;

      var messageId = this.createMessageId(command, data);
      var outstanding = {
        command: command,
        data: data,
        deferred: p.defer(),
        messageId: messageId
      };

      // save the data beforehand in case the response is synchronous.
      self._outstandingRequests.add(messageId, outstanding);

      return p()
        .then(function () {
          return self._sender.send(command, data, messageId);
        })
        .then(function () {
          return outstanding.deferred.promise;
        })
        .fail(function (err) {
          // The request is no longer considered outstanding if
          // there was a problem sending.
          self._outstandingRequests.remove(messageId);
          throw err;
        });
    },

    /**
     * Create a messageId for a given command/data combination.
     *
     * messageId is sent to the relier who is expected to respond
     * with the same messageId. Used to keep track of outstanding requests.
     *
     * @param {String} command
     * @param {Object} [data]
     * @return {String}
     */
    createMessageId: function (command, data) {
      return Date.now();
    },

    onMessageReceived: function (message) {
      var self = this;
      var parsedMessage = self.parseMessage(message);
      var data = parsedMessage.data;
      var messageId = parsedMessage.messageId;

      // A message is not necessarily in response to a sent request.
      // If the message is in response to a request, then it should
      // have a messageId.
      var outstanding = self._outstandingRequests.get(messageId);
      if (outstanding) {
        self._outstandingRequests.remove(messageId);
        outstanding.deferred.resolve(data);
      }

      // Even if the message is not in response to a request, trigger an
      // event for any listeners that are waiting for it.
      self.trigger(parsedMessage.command, data);
    },

    /**
     * Parse an incoming message into `messageId`, `command`, and `data`
     *
     * @param {Object} message
     * @returns {Object} parsedMessage
     *    @param {String} parsedMessage.command - message command
     *    @param {String} [parsedMessage.messageId] - message id, if
     *    a response.
     *    @param {Object} parsedMessage.data - data
     */
    parseMessage: function (message) {
      return {
        command: message.command,
        data: message.data,
        messageId: message.messageId
      };
    }
  });

  module.exports = DuplexChannel;
});
