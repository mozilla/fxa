/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that communicates with the
 * browser via WebChannels. Each command is prefixed with `fxaccounts:`
 */

define(function (require, exports, module) {
  'use strict';

  var Constants = require('lib/constants');
  var FxSyncAuthenticationBroker = require('./fx-sync');
  var WebChannel = require('lib/channels/web');

  var FxSyncWebChannelAuthenticationBroker = FxSyncAuthenticationBroker.extend({
    type: 'fx-sync-web-channel',

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

  module.exports = FxSyncWebChannelAuthenticationBroker;
});

