/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Polls for a new device being connected to an account.
 *
 * Triggers a `device-connected` on detection.
 *
 * Triggers an `error` message if there was an error.
 */

import Backbone from 'backbone';
import { DEVICE_CONNECTED_POLL_IN_MS } from '../../lib/constants';

export default class DeviceConnectedPoll extends Backbone.Model {
  constructor(data, options = {}) {
    super(options, data);

    if (!options.account) {
      throw new Error('options.account required');
    }

    this._account = options.account;
    this._pollIntervalInMS =
      options.pollIntervalInMS || DEVICE_CONNECTED_POLL_IN_MS;
    this._window = options.window;
    this._previousDevices = undefined;
  }

  destroy() {
    this.stop();
    super.destroy();
  }

  /**
   * Start polling for a new devices
   */
  start() {
    if (!this._isWaiting) {
      this._isWaiting = true;
      this._poll();
    }
  }

  /**
   * Stop polling
   */
  stop() {
    if (this._pollTimeout) {
      this._window.clearTimeout(this._pollTimeout);
      this._pollTimeout = null;
    }
    this._isWaiting = false;
  }

  _poll() {
    if (!this._isWaiting) {
      return;
    }

    // This PR attempts to build the device polling logic from the
    // account's device list. This request is faster than polling the
    // `attached_clients` endpoint, but not as fast as checking
    // if the sign-in code was consumed. I plan on deferring
    // the check for sign-in code consumption and will examine it more
    // in a follow up PR.
    this._account.fetchDeviceList().then(
      (result) => this._onStatusComplete(result),
      (err) => this._onStatusError(err)
    );
  }

  _onStatusComplete(currentDevices) {
    if (!this._isWaiting) {
      // no longer care about the result, abort.
      return;
    }

    if (!this._previousDevices) {
      this._previousDevices = currentDevices;
    }

    // Check to see if there is any new device from devices returned by
    // auth-server. This gives a hint that the user either connected a new device
    // or connected a previous device.
    //
    // A "new device" is considered new if and only if it exists in `currentDevices`.
    const newDevice = currentDevices.filter((device) => {
      const found = this._previousDevices.find((item) => item.id === device.id);
      return found ? null : device;
    });

    if (newDevice.length > 0) {
      this.trigger('device-connected', newDevice);
      this._pollTimeout = null;
      this.stop();
    } else {
      this._pollTimeout = this._window.setTimeout(
        () => this._poll(),
        this._pollIntervalInMS
      );
    }
  }

  _onStatusError(err) {
    this.trigger('error', err);
    this.stop();
  }
}
