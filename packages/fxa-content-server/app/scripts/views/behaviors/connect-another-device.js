/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that sends eligible users to the appropriate
 * connect-another-device screen. If ineligible, fallback
 * to `defaultBehavior`.
 *
 * Do not use for a signin flow, instead use "connect-another-device-on-signin".
 *
 * Requires the view to mixin the ConnectAnotherDeviceMixin
 */

define(function(require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const ConnectAnotherDeviceMixin = require('../mixins/connect-another-device-mixin');
  const p = require('../../lib/promise');

  /**
   * Create a ConnectAnotherDevice behavior.
   *
   * @param {Object} defaultBehavior - behavior to invoke if ineligible
   *   for ConnectAnotherDevice
   * @returns {Function} behavior
   */
  module.exports = function (defaultBehavior) {
    const behavior = function (view, account) {
      return p().then(() => {
        behavior.ensureConnectAnotherDeviceMixin(view);

        if (view.isEligibleForConnectAnotherDevice(account)) {
          return view.navigateToConnectAnotherDeviceScreen(account);
        }
      })
      .then(() => {
        // if the user is not eligible for CAD, or if the .navigateToConnect*
        // function did not navigate, then return the default behavior.
        if (view.hasNavigated()) {
          // Cause the invokeBrokerMethod chain to stop, the screen
          // has already redirected.
          return p.defer().promise;
        }
        return defaultBehavior;
      });
    };

    behavior.ensureConnectAnotherDeviceMixin = function (view) {
      if (! Cocktail.isMixedIn(view, ConnectAnotherDeviceMixin)) {
        Cocktail.mixin(view, ConnectAnotherDeviceMixin);
      }
    };

    behavior.type = 'connect-another-device';

    return behavior;
  };
});
