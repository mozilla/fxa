/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * V1 of the broker to communicate with Fx Desktop when signing in to Sync.
 */

define([
  'lib/channels/fx-desktop-v1',
  'lib/url',
  'models/auth_brokers/fx-sync',
  'underscore',
  'views/behaviors/halt'
], function (FxDesktopChannel, Url, FxSyncAuthenticationBroker, _,
  HaltBehavior) {
  'use strict';

  var proto = FxSyncAuthenticationBroker.prototype;

  var FxDesktopV1AuthenticationBroker = FxSyncAuthenticationBroker.extend({
    type: 'fx-desktop-v1',

    commands: {
      CAN_LINK_ACCOUNT: 'can_link_account',
      CHANGE_PASSWORD: 'change_password',
      DELETE_ACCOUNT: 'delete_account',
      LOADED: 'loaded',
      LOGIN: 'login'
    },

    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      afterResetPasswordConfirmationPoll: new HaltBehavior(),
      afterSignIn: new HaltBehavior(),
      beforeSignUpConfirmationPoll: new HaltBehavior()
    }),

    createChannel: function () {
      var channel = new FxDesktopChannel();

      channel.initialize({
        // Fx Desktop browser will send messages with an origin of the string
        // `null`. These messages are trusted by the channel by default.
        //
        // 1) Fx on iOS and functional tests will send messages from the
        // content server itself. Accept messages from the content
        // server to handle these cases.
        // 2) Fx 18 (& FxOS 1.*) do not support location.origin. Build the origin from location.href
        origin: this.window.location.origin || Url.getOrigin(this.window.location.href),
        window: this.window
      });

      channel.on('error', this.trigger.bind(this, 'error'));

      return channel;
    }
  });

  return FxDesktopV1AuthenticationBroker;
});

