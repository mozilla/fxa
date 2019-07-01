/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a special channel that communicates between two
 * tabs of the same browser, using BroadcastChannels
 * to communicate.
 *
 * See https://developer.mozilla.org/docs/Web/API/Broadcast_Channel_API.
 *
 * If BroadcastChannel is not supported, no inter-tab communication occurs.
 */

import _ from 'underscore';
import Backbone from 'backbone';

const BROADCAST_CHANNEL_ID = 'firefox_accounts';

function BroadcastChannelAdapter(options = {}) {
  const win = options.window || window;

  if ('BroadcastChannel' in win) {
    this._broadcastChannel = new win.BroadcastChannel(BROADCAST_CHANNEL_ID);
    this._broadcastChannel.onmessage = this.onMessage.bind(this);
  }
}

BroadcastChannelAdapter.prototype = {
  onMessage(event) {
    const envelope = JSON.parse(event.data);
    this.trigger(envelope.name, envelope.data);
  },

  send(name, data) {
    if (this._broadcastChannel) {
      this._broadcastChannel.postMessage(this.stringify(name, data));
    }
  },

  /**
   * stringify a message, exposed for testing
   *
   * @param {String} name
   * @param {Object} [data]
   * @returns {String}
   */
  stringify(name, data = {}) {
    return JSON.stringify({
      data: data,
      name: name,
    });
  },
};

_.extend(BroadcastChannelAdapter.prototype, Backbone.Events);
export default BroadcastChannelAdapter;
