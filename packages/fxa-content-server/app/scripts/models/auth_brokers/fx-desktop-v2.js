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
  const HaltBehavior = require('views/behaviors/halt');
  const NullBehavior = require('views/behaviors/null');
  const p = require('lib/promise');

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
      chooseWhatToSyncWebV1: true,
      openWebmailButtonVisible: true
    }),

    type: 'fx-desktop-v2',

    afterResetPasswordConfirmationPoll (/*account*/) {
      // this is only called if the user verifies in the same browser.
      // With Fx's E10s enabled, the account data only contains an
      // unwrapBKey and keyFetchToken, not enough to sign in the user.
      // Luckily, with WebChannels, the verification page can send
      // the data to the browser and everybody is happy
      return p(new HaltBehavior());
    },

    afterCompleteResetPassword (account) {
      // See the note in afterResetPasswordConfirmationPoll
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterCompleteResetPassword.call(this, account));
    },

    fetch () {
      return proto.fetch.call(this).then(() => {
        if (! this.environment.isAboutAccounts()) {
          // The default behavior of FxDesktop brokers is to halt before
          // the signup confirmation poll because about:accounts takes care
          // of polling and updating the UI. However if we are not in about:accounts
          // we do not want the halting behavior.
          this._behaviors.keys().forEach((behaviorName) => {
            if (this.getBehavior(behaviorName).type === 'halt') {
              this.setBehavior(behaviorName, new NullBehavior());
            }
          });
        }
      });
    }
  });

  module.exports = FxDesktopV2AuthenticationBroker;
});

