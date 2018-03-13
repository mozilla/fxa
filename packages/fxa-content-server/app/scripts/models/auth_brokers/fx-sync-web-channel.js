/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that communicates with the
 * browser via WebChannels. Each command is prefixed with `fxaccounts:`
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Constants = require('../../lib/constants');
  const FxSyncChannelAuthenticationBroker = require('./fx-sync-channel');
  const WebChannel = require('../../lib/channels/web');

  const proto = FxSyncChannelAuthenticationBroker.prototype;

  const FxSyncWebChannelAuthenticationBroker = FxSyncChannelAuthenticationBroker.extend({
    type: 'fx-sync-web-channel',

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      sendChangePasswordNotice: false
    }),

    commands: _.pick(WebChannel,
      'CAN_LINK_ACCOUNT',
      'CHANGE_PASSWORD',
      'DELETE_ACCOUNT',
      'LOADED',
      'LOGIN',
      'VERIFIED'
    ),

    createChannel () {
      var channel = new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
      channel.initialize({
        window: this.window
      });

      return channel;
    },

    afterCompleteSignInWithCode (account) {
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterSignInConfirmationPoll.call(this, account));
    },
  });

  module.exports = FxSyncWebChannelAuthenticationBroker;
});

