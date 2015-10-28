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
  'lib/constants',
  'lib/promise',
  'underscore',
  'views/behaviors/navigate'
], function (FxSyncAuthenticationBroker, WebChannel, Constants, p, _, NavigateBehavior) {
  'use strict';

  var proto = FxSyncAuthenticationBroker.prototype;

  var FxDesktopV2AuthenticationBroker = FxSyncAuthenticationBroker.extend({
    afterSignUp: function (account) {
      var self = this;
      return p().then(function () {
        if (self.hasCapability('chooseWhatToSyncWebV1')) {
          return new NavigateBehavior('choose_what_to_sync', {
            data: {
              account: account
            }
          });
        }
      });
    },

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
      }
    }),

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

