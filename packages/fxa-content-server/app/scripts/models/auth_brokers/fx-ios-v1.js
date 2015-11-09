/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 1.0 ... < 2.0.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var AuthErrors = require('lib/auth-errors');
  var FxDesktopV1AuthenticationBroker = require('models/auth_brokers/fx-desktop-v1');

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

  module.exports = FxiOSV1AuthenticationBroker;
});
