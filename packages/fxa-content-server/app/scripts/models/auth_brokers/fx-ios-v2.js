/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 2.0.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Constants = require('lib/constants');
  var FxDesktopV1AuthenticationBroker = require('models/auth_brokers/fx-desktop-v1');

  var proto = FxDesktopV1AuthenticationBroker.prototype;

  var FxiOSV2AuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: {
        engines: Constants.DEFAULT_DECLINED_ENGINES
      },
      convertExternalLinksToText: true,
      emailVerificationMarketingSnippet: false,
      syncPreferencesNotification: true
    }),

    type: 'fx-ios-v2'
  });

  module.exports = FxiOSV2AuthenticationBroker;
});
