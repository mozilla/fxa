/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * For iOS apps that integrate with the standalone Sync library.
 * Communicates with the app using WebChannels.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxSyncWebChannelAuthenticationBroker = require('./fx-sync-web-channel');

  const proto = FxSyncWebChannelAuthenticationBroker.prototype;

  module.exports = FxSyncWebChannelAuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      // No CWTS - see https://github.com/mozilla/fxa-content-server/issues/5029#issuecomment-306928551
      chooseWhatToSyncWebV1: false,
      openWebmailButtonVisible: false,
      sendAfterSignInConfirmationPollNotice: true,
      sendAfterSignUpConfirmationPollNotice: true,
    }),

    type: 'mob-ios-v1'
  });
});

