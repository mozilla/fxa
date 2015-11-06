/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox firstrun flow.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var FxDesktopV2AuthenticationBroker = require('models/auth_brokers/fx-desktop-v2');
  var HaltBehavior = require('views/behaviors/halt');

  var proto = FxDesktopV2AuthenticationBroker.prototype;

  var FirstRunAuthenticationBroker = FxDesktopV2AuthenticationBroker.extend({
    _iframeCommands: {
      LOADED: 'loaded',
      LOGIN: 'login',
      SIGNUP_MUST_VERIFY: 'signup_must_verify',
      VERIFICATION_COMPLETE: 'verification_complete'
    },

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: true,
      chooseWhatToSyncWebV1: false
    }),

    initialize: function (options) {
      options = options || {};

      this._iframeChannel = options.iframeChannel;
      return proto.initialize.call(this, options);
    },

    fetch: function () {
      var self = this;
      return proto.fetch.call(self)
        .then(function () {
          // Some settings do not work in an iframe due to x-frame and
          // same-origin policies. Allow the firstrun flow to decide whether
          // they want to display the settings page after the `login` message
          // is sent. If `haltAfterSignIn` is set to true, the firstrun page
          // will take care of displaying an update to the user.
          if (self.getSearchParam('haltAfterSignIn') === 'true') {
            self.setBehavior('afterSignIn', new HaltBehavior());
          }
        });
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

  module.exports = FirstRunAuthenticationBroker;
});
