/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox firstrun flow.
 */

define([
  'models/auth_brokers/fx-desktop-v2'
], function (FxDesktopV2AuthenticationBroker) {
  'use strict';

  var proto = FxDesktopV2AuthenticationBroker.prototype;

  var FirstRunAuthenticationBroker = FxDesktopV2AuthenticationBroker.extend({
    _iframeCommands: {
       LOADED: 'loaded',
       LOGIN: 'login',
       SIGNUP_MUST_VERIFY: 'signup_must_verify',
       VERIFICATION_COMPLETE: 'verification_complete'
     },

    haltAfterResetPasswordConfirmationPoll: false,
    haltAfterSignIn: false,
    haltBeforeSignUpConfirmationPoll: false,

    initialize: function (options) {
      options = options || {};

      this._iframeChannel = options.iframeChannel;
      return proto.initialize.call(this, options);
    },

    afterLoaded: function () {
      this._iframeChannel.send(this._iframeCommands.LOADED);

      return proto.afterLoaded.apply(this, arguments);
    },

    afterSignIn: function () {
      this._iframeChannel.send(this._iframeCommands.LOGIN);

      return proto.afterSignIn.apply(this, arguments);
    },

    afterResetPasswordConfirmationPoll: function () {
      this._iframeChannel.send(this._iframeCommands.VERIFICATION_COMPLETE);

      return proto.afterResetPasswordConfirmationPoll.apply(this, arguments);
    },

    beforeSignUpConfirmationPoll: function () {
      this._iframeChannel.send(this._iframeCommands.SIGNUP_MUST_VERIFY);

      return proto.beforeSignUpConfirmationPoll.apply(this, arguments);
    },

    afterSignUpConfirmationPoll: function () {
      this._iframeChannel.send(this._iframeCommands.VERIFICATION_COMPLETE);

      return proto.afterSignUpConfirmationPoll.apply(this, arguments);
    }
  });

  return FirstRunAuthenticationBroker;
});
