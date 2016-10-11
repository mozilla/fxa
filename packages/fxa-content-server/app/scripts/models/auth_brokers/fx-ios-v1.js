/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 1.0 ... < 2.0.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Constants = require('lib/constants');
  const p = require('lib/promise');

  const FxDesktopV1AuthenticationBroker = require('models/auth_brokers/fx-desktop-v1');

  const proto = FxDesktopV1AuthenticationBroker.prototype;

  const FxiOSV1AuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      convertExternalLinksToText: true
    }),

    _notifyRelierOfLogin (account) {
      /**
       * As a workaround for sign-in/sign-up confirmation view disappearing
       * on iOS, delay the login message sent via the channel by LOGIN_MESSAGE_DELAY_MS.
       * This will give the user an indication that they need to verify
       * their email address.
       */
      const loginMessageDelayMS = this.get('loginMessageDelayMS') || Constants.IOS_V1_LOGIN_MESSAGE_DELAY_MS;
      return p().delay(loginMessageDelayMS).then(() => {
        return proto._notifyRelierOfLogin.call(this, account);
      });
    },
  });

  module.exports = FxiOSV1AuthenticationBroker;
});
