/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that communicates with the
 * browser via WebChannels. Each command is prefixed with `fxaccounts:`
 */

import _ from 'underscore';
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import FxSyncChannelAuthenticationBroker from './fx-sync-channel';
import WebChannel from '../../lib/channels/web';
import ChannelMixin from './mixins/channel';

const proto = FxSyncChannelAuthenticationBroker.prototype;

const FxSyncWebChannelAuthenticationBroker = FxSyncChannelAuthenticationBroker.extend(
  {
    type: 'fx-sync-web-channel',

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      sendChangePasswordNotice: false,
    }),

    commands: _.pick(
      WebChannel,
      'CAN_LINK_ACCOUNT',
      'CHANGE_PASSWORD',
      'DELETE_ACCOUNT',
      'LOADED',
      'LOGIN',
      'VERIFIED'
    ),

    createChannel() {
      var channel = new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
      channel.initialize({
        window: this.window,
      });

      return channel;
    },

    afterCompleteResetPassword(account) {
      // This method is not in the fx-sync-channel because only the initiating
      // tab can send a login message for fx-desktop-v1 and it's descendents.
      // Messages from other tabs are ignored.
      return Promise.resolve()
        .then(() => {
          if (
            account.get('verified') &&
            !account.get('verificationReason') &&
            !account.get('verificationMethod')
          ) {
            // only notify the browser of the login if the user does not have
            // to verify their account/session
            return this._notifyRelierOfLogin(account);
          }
        })
        .then(() => proto.afterCompleteResetPassword.call(this, account));
    },

    afterCompleteSignInWithCode(account) {
      return this._notifyRelierOfLogin(account).then(() =>
        proto.afterSignInConfirmationPoll.call(this, account)
      );
    },

    beforeForcePasswordChange(account) {
      return this._notifyRelierOfLogin(account).then(() =>
        proto.beforeForcePasswordChange.call(this, account)
      );
    },
  }
);

Cocktail.mixin(FxSyncWebChannelAuthenticationBroker, ChannelMixin);

export default FxSyncWebChannelAuthenticationBroker;
