/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that speaks "v2" of the protocol.
 * Communication with the browser is done via WebChannels and each
 * command is prefixed with `fxaccounts:`
 *
 * If Sync is iframed by web content, v2 of the protocol is assumed.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var FxSyncWebChannelAuthenticationBroker = require('./fx-sync-web-channel');
  var HaltBehavior = require('views/behaviors/halt');

  var proto = FxSyncWebChannelAuthenticationBroker.prototype;

  var FxDesktopV2AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend({
    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterForceAuth: new HaltBehavior(),
      // about:accounts displays its own screen after password reset, no
      // need to show anything.
      afterResetPasswordConfirmationPoll: new HaltBehavior(),
      // about:accounts displays its own screen after sign in, no need
      // to show anything.
      afterSignIn: new HaltBehavior(),
      // the browser is already polling, no need for the content server
      // code to poll as well, otherwise two sets of polls are going on
      // for the same user.
      beforeSignUpConfirmationPoll: new HaltBehavior()
    }),

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: {
        engines: [
          'bookmarks',
          'history',
          'passwords',
          'tabs',
          'desktop-addons',
          'desktop-preferences'
        ]
      },
      openGmailButtonVisible: true
    }),

    type: 'fx-desktop-v2'
  });

  module.exports = FxDesktopV2AuthenticationBroker;
});

