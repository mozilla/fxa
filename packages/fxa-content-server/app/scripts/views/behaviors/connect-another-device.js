/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that sends eligible users to the appropriate
 * connect-another-device screen. If ineligible, fallback
 * to `defaultBehavior`.
 *
 * Requires the view to mixin the ConnectAnotherDeviceMixin
 */

define((require, exports, module) => {
  'use strict';

  /**
   * Create a ConnectAnotherDevice behavior.
   *
   * @param {Object} defaultBehavior - behavior to invoke if ineligible
   *   for ConnectAnotherDevice
   * @returns {Function} behavior
   */
  module.exports = function (defaultBehavior) {
    const behavior = function (view, account) {
      if (view.isEligibleForConnectAnotherDevice(account)) {
        return view.navigateToConnectAnotherDeviceScreen(account);
      }

      return view.invokeBehavior(defaultBehavior, account);
    };

    behavior.type = 'connect-another-device';

    return behavior;
  };
});
