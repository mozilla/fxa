/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 1.0 ... < 2.0.
 */

define([
  'lib/auth-errors',
  'models/auth_brokers/fx-desktop-v1',
  'underscore'
], function (AuthErrors, FxDesktopV1AuthenticationBroker, _) {
  'use strict';

  var proto = FxDesktopV1AuthenticationBroker.prototype;

  var FxiOSV1AuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      convertExternalLinksToText: true
    }),
    fetch: function () {
      var self = this;

      return proto.fetch.call(self)
        .then(function () {
          if (self.getSearchParam('exclude_signup') === '1') {
            self.unsetCapability('signup');
            self.SIGNUP_DISABLED_REASON =
                AuthErrors.toError('IOS_SIGNUP_DISABLED');
          }
        });
    }
  });

  return FxiOSV1AuthenticationBroker;
});
