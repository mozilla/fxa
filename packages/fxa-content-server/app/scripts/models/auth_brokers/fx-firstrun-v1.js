/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox firstrun flow.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxSyncWebChannelAuthenticationBroker = require('models/auth_brokers/fx-sync-web-channel');
  const HaltBehavior = require('views/behaviors/halt');

  var proto = FxSyncWebChannelAuthenticationBroker.prototype;

  var FxFirstrunV1AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend({
    type: 'fx-firstrun-v1',

    _iframeCommands: {
      LOADED: 'loaded',
      LOGIN: 'login',
      SIGNUP_MUST_VERIFY: 'signup_must_verify',
      VERIFICATION_COMPLETE: 'verification_complete'
    },

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      cadAfterSignInConfirmationPoll: true,
      cadAfterSignUpConfirmationPoll: true,
      chooseWhatToSyncCheckbox: true,
      chooseWhatToSyncWebV1: false,
      openWebmailButtonVisible: true
    }),

    initialize (options) {
      options = options || {};

      this._iframeChannel = options.iframeChannel;
      return proto.initialize.call(this, options);
    },

    fetch () {
      return proto.fetch.call(this).then(() => {
        // Some settings do not work in an iframe due to x-frame and
        // same-origin policies. Allow the firstrun flow to decide whether
        // they want to display the settings page after the `login` message
        // is sent. If `haltAfterSignIn` is set to true, the firstrun page
        // will take care of displaying an update to the user.
        if (this.getSearchParam('haltAfterSignIn') === 'true') {
          this.setBehavior('afterSignIn', new HaltBehavior());
        }
      });
    },

    afterLoaded () {
      this._iframeChannel.send(this._iframeCommands.LOADED);

      return proto.afterLoaded.apply(this, arguments);
    },

    afterSignIn () {
      this._iframeChannel.send(this._iframeCommands.LOGIN);

      return proto.afterSignIn.apply(this, arguments);
    },

    afterSignInConfirmationPoll () {
      this._iframeChannel.send(this._iframeCommands.VERIFICATION_COMPLETE);

      return proto.afterSignInConfirmationPoll.apply(this, arguments);
    },

    afterResetPasswordConfirmationPoll () {
      this._iframeChannel.send(this._iframeCommands.VERIFICATION_COMPLETE);

      return proto.afterResetPasswordConfirmationPoll.apply(this, arguments);
    },

    beforeSignUpConfirmationPoll (account) {
      this._iframeChannel.send(this._iframeCommands.SIGNUP_MUST_VERIFY, {
        emailOptIn: !! account.get('needsOptedInToMarketingEmail')
      });

      return proto.beforeSignUpConfirmationPoll.apply(this, arguments);
    },

    afterSignUpConfirmationPoll () {
      this._iframeChannel.send(this._iframeCommands.VERIFICATION_COMPLETE);

      return proto.afterSignUpConfirmationPoll.apply(this, arguments);
    }
  });

  module.exports = FxFirstrunV1AuthenticationBroker;
});
