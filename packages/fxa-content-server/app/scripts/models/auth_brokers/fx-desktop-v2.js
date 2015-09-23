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

define([
  './fx-sync',
  'lib/channels/web',
  'lib/constants'

], function (FxSyncAuthenticationBroker, WebChannel, Constants) {
  'use strict';

  var FxDesktopV2AuthenticationBroker = FxSyncAuthenticationBroker.extend({
    type: 'fx-desktop-v2',

    commands: {
      CAN_LINK_ACCOUNT: 'fxaccounts:can_link_account',
      CHANGE_PASSWORD: 'fxaccounts:change_password',
      DELETE_ACCOUNT: 'fxaccounts:delete_account',
      LOADED: 'fxaccounts:loaded',
      LOGIN: 'fxaccounts:login'
    },

    createChannel: function () {
      var channel = new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
      channel.initialize({
        window: this.window
      });

      return channel;
    }
  });

  return FxDesktopV2AuthenticationBroker;
});

