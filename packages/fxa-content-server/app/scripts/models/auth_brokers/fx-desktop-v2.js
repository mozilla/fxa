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

  const _ = require('underscore');
  const FxSyncWebChannelAuthenticationBroker = require('./fx-sync-web-channel');
  const HaltIfBrowserTransitions = require('../../views/behaviors/halt-if-browser-transitions');

  const proto = FxSyncWebChannelAuthenticationBroker.prototype;
  const defaultBehaviors = proto.defaultBehaviors;

  const FxDesktopV2AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend({
    defaultBehaviors: _.extend({}, defaultBehaviors, {
      afterForceAuth: new HaltIfBrowserTransitions(defaultBehaviors.afterForceAuth),
      afterResetPasswordConfirmationPoll: new HaltIfBrowserTransitions(defaultBehaviors.afterResetPasswordConfirmationPoll),
      afterSignIn: new HaltIfBrowserTransitions(defaultBehaviors.afterSignIn),
      afterSignInConfirmationPoll: new HaltIfBrowserTransitions(defaultBehaviors.afterSignInConfirmationPoll),
      afterSignUpConfirmationPoll: new HaltIfBrowserTransitions(defaultBehaviors.afterSignUpConfirmationPoll)
    }),

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: true,
      openWebmailButtonVisible: true
    }),

    type: 'fx-desktop-v2',

    fetch () {
      return proto.fetch.call(this).then(() => {
        if (! this.environment.isAboutAccounts()) {
          this.setCapability('browserTransitionsAfterEmailVerification', false);
        }
      });
    }
  });

  module.exports = FxDesktopV2AuthenticationBroker;
});
