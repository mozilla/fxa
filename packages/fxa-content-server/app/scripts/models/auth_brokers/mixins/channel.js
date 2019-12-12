/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An AuthenticationBroker mixin that allows
 * the mixin to send messages to a channel.
 *
 * A default channel can be used (useful for testing), if
 * the broker contains this._channel, that will be used, otherwise
 * the this.ChannelConstructor will be used to create a new
 * instance
 */

import p from '../../../lib/promise';

// normalize the channel action. New channels return promises, old
// channels use NodeJS style callbacks. Convert the old channel style
// to return promises.
function ensureActionReturnsPromise(action) {
  // new channels are already set up to return promises. If so,
  // no need to denodeify.
  if (action.length === 3) {
    return p.denodeify(action);
  }

  return action;
}

const ChannelMixin = {
  initialize(options = {}) {
    this._metrics = options.metrics;
  },

  /**
   * Get a reference to a channel. If a channel has already been created,
   * the cached channel will be returned. Used by the ChannelMixin.
   *
   * @method getChannel
   * @returns {Object} channel
   */
  getChannel() {
    if (!this._channel) {
      this._channel = this.createChannel();
    }

    return this._channel;
  },

  /**
   * Get a command by commandName
   * @param commandName
   * @returns {String} command
   */
  getCommand(commandName) {
    if (!this.commands) {
      throw new Error('this.commands must be specified');
    }

    const command = this.commands[commandName];
    if (!command) {
      throw new Error('command not found for: ' + commandName);
    }

    return command;
  },

  /**
   * Send a message to the remote listener, expect no response.
   * Flushes metrics before sending to ensure outstanding events
   * are reported in case the message causes the UA to close
   * the FxA window.
   *
   * @param {String} message
   * @param {Object} [data]
   * @returns {Promise}
   *        The promise will resolve if the value was successfully sent.
   */
  send(message, data) {
    const channel = this.getChannel();
    const send = ensureActionReturnsPromise(channel.send.bind(channel));

    return this._metrics.flush().then(() => send(message, data));
  },

  /**
   * Request information from the remote listener.
   * Flushes metrics before sending to ensure outstanding events
   * are reported in case the message causes the UA to close
   * the FxA window.
   *
   * @param {String} message
   * @param {Object} [data]
   * @returns {Promise}
   *        The promise will resolve with the value returned by the remote
   *        listener, or reject if there was an error.
   */
  request(message, data) {
    const channel = this.getChannel();
    // only new channels have a request. If not, fall back to send.
    const action = (channel.request || channel.send).bind(channel);
    const request = ensureActionReturnsPromise(action);

    return this._metrics.flush().then(() => request(message, data));
  },
};

export default ChannelMixin;
