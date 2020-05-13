/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import DeviceConnectedPoll from '../../models/polls/device-connected';
import { DEVICE_CONNECTED_POLL_IN_MS } from '../../lib/constants';

export default {
  // used by unit tests
  DEVICE_CONNECTED_POLL_IN_MS,

  initialize(options = {}) {
    this._deviceConnectedPoll = options.deviceConnectedPoll;
  },

  beforeDestroy() {
    if (this._deviceConnectedPoll) {
      this._deviceConnectedPoll.destroy();
      this._deviceConnectedPoll = null;
    }
  },

  waitForDeviceConnected(account, onConnected) {
    const deviceConnectedPoll = this.getDeviceConnectedPoll(account);

    this.listenTo(deviceConnectedPoll, 'device-connected', onConnected);
    this.listenTo(deviceConnectedPoll, 'error', err =>
      this._handlePollErrors(account, err)
    );

    deviceConnectedPoll.start();
  },

  getDeviceConnectedPoll(account) {
    if (!this._deviceConnectedPoll) {
      this._deviceConnectedPoll = new DeviceConnectedPoll(
        {},
        {
          account,
          pollIntervalInMS: this.DEVICE_CONNECTED_POLL_IN_MS,
          window: this.window,
        }
      );
    }
    return this._deviceConnectedPoll;
  },

  _handlePollErrors(account) {
    // TODO: Figure out how we want to handle errors. If the endpoint
    // is overloaded, maybe we retry?
    this.getDeviceConnectedPoll(account).stop();
  },
};
