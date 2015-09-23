/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox firstrun flow.
 */

define([
  'lib/auth-errors',
  'models/auth_brokers/fx-desktop-v1'
], function (AuthErrors, FxDesktopV1AuthenticationBroker) {
  'use strict';

  var FxiOSAuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    fetch: function () {
      var self = this;
      return FxDesktopV1AuthenticationBroker.prototype.fetch.call(self)
        .then(function () {
          if (self.getSearchParam('exclude_signup') === '1') {
            self._isSignupDisabled = true;
          }
        });
    },

    _isSignupDisabled: false,
    isSignupDisabled: function () {
      return this._isSignupDisabled;
    },

    SIGNUP_DISABLED_REASON: AuthErrors.toError('IOS_SIGNUP_DISABLED')
  });

  return FxiOSAuthenticationBroker;
});
