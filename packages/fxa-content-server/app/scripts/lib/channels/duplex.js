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

  const _ = require('underscore');
  const BaseChannel = require('lib/channels/base');
  const Duration = require('duration');
  const Logger = require('lib/logger');
  const p = require('lib/promise');

  var DEFAULT_SEND_TIMEOUT_LENGTH_MS = new Duration('90s').milliseconds();

  function OutstandingRequests(options) {
    this._window = options.window;
    this._sendTimeoutLength = options.sendTimeoutLength || DEFAULT_SEND_TIMEOUT_LENGTH_MS;
    this._requests = {};
    this._logger = new Logger(this._window);
  }

  OutstandingRequests.prototype = {
    add (messageId, request) {
      // remove any old outstanding messages with the same messageId
      this.remove(messageId);

      request.timeout = this._window.setTimeout(function (command) {
        this._logger.error('Response not received for: ' + command);
      }.bind(this, request.command), this._sendTimeoutLength);

      this._requests[messageId] = request;
    },

    remove (messageId) {
      var outstanding = this.get(messageId);
      if (outstanding) {
        this._window.clearTimeout(outstanding.timeout);
        delete this._requests[outstanding.messageId];
      }
    },

    get (messageId) {
      return this._requests[messageId];
    },

    clear () {
      for (var messageId in this._requests) {
        this.remove(this._requests[messageId]);
      }
    }
  };

  function DuplexChannel() {
  }

  _.extend(DuplexChannel.prototype, new BaseChannel(), {
    initialize (options) {
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
      this._receiver.on('error', (err) => this.onErrorReceived(err));
      this._receiver.on('message', (resp) => this.onMessageReceived(resp));

      this._outstandingRequests = new OutstandingRequests({
        sendTimeoutLength: options.sendTimeoutLength,
        window: options.window
      });
    },

    teardown () {
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
    send (command, data) {
      return p().then(() => {
        return this._sender.send(command, data, null);
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
    request (command, data) {
      var messageId = this.createMessageId(command, data);
      var outstanding = {
        command: command,
        data: data,
        deferred: p.defer(),
        messageId: messageId
      };

      // save the data beforehand in case the response is synchronous.
      this._outstandingRequests.add(messageId, outstanding);

      return p().then(() => {
        return this._sender.send(command, data, messageId);
      })
      .then(() => outstanding.deferred.promise)
      .fail((err) => {
        // The request is no longer considered outstanding if
        // there was a problem sending.
        this._outstandingRequests.remove(messageId);
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
    createMessageId (command, data) {
      return Date.now();
    },

    onMessageReceived (message) {
      var { command, data, messageId } = this.parseMessage(message);
      if (messageId) {
        // A message is not necessarily in response to a sent request.
        // If the message is in response to a request, then it should
        // have a messageId.
        var outstanding = this._outstandingRequests.get(messageId);
        if (outstanding) {
          this._outstandingRequests.remove(messageId);
          outstanding.deferred.resolve(data);
        }
      }

      // Even if the message is not in response to a request, trigger an
      // event for any listeners that are waiting for it.
      this.trigger(command, data);
    },

    /**
     * Parse an incoming message into `command`, `data`, and `messageId`
     *
     * @param {Object} message
     * @returns {Object} parsedMessage
     *   @param {String} parsedMessage.command - message command
     *   @param {Object} parsedMessage.data - data
     *   @param {String} [parsedMessage.messageId] - message id, if
     *    a response.
     */
    parseMessage (message) {
      return _.pick(message, 'command', 'data', 'messageId');
    },

    onErrorReceived (message) {
      var { error, messageId } = this.parseError(message);

      if (messageId) {
        // A message is not necessarily in response to a sent request.
        // If the message is in response to a request, then it should
        // have a messageId.
        var outstanding = this._outstandingRequests.get(messageId);
        if (outstanding) {
          this._outstandingRequests.remove(messageId);
          outstanding.deferred.reject(error);
        }
      }

      // Even if the message is not in response to a request, trigger an
      // event for any listeners that are waiting for it.
      this.trigger('error', error);
    },

    /**
     * Parse an incoming message into `command`, `error`, and `messageId`
     *
     * @param {Object} message
     * @returns {Object} parsedMessage={}
     *   @param {String} parsedMessage.error - message error
     *   @param {String} [parsedMessage.messageId] - message id, if
     *    a response.
     */
    parseError (message) {
      return _.pick(message, 'error', 'messageId');
    }
  });

  module.exports = DuplexChannel;
});
