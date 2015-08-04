/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox firstrun flow.
 */

define([
  'lib/auth-errors',
  'models/auth_brokers/fx-desktop'
], function (AuthErrors, FxDesktopV1AuthenticationBroker) {
  'use strict';

  var FxiOSAuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    // Signup is disabled on first version of Fx for iOS.
    isSignupDisabled: function () {
      return true;
    },
    SIGNUP_DISABLED_REASON: AuthErrors.toError('IOS_SIGNUP_DISABLED')
  });

  return FxiOSAuthenticationBroker;
});
