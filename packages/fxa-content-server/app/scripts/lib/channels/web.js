/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel that completes the OAuth flow using Firefox WebChannel events
// https://developer.mozilla.org/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
// https://developer.mozilla.org/docs/Mozilla/JavaScript_code_modules/FxAccountsOAuthClient.jsm

import _ from 'underscore';
import AuthErrors from 'lib/auth-errors';
import Cocktail from 'cocktail';
import DuplexChannel from 'lib/channels/duplex';
import UrlMixin from 'lib/url-mixin';
import UserAgentMixin from 'lib/user-agent-mixin';
import WebChannelReceiver from 'lib/channels/receivers/web-channel';
import WebChannelSender from 'lib/channels/senders/web-channel';

const FXA_STATUS_MIN_FIREFOX_DESKTOP_VERSION = 55;

// The corresponding Firefox list is in
// https://dxr.mozilla.org/mozilla-central/rev/8a7d0b15595f9916123848ca906f29c62d4914c9/services/fxaccounts/FxAccountsWebChannel.jsm#30
const COMMANDS = {
  CAN_LINK_ACCOUNT: 'fxaccounts:can_link_account',
  CHANGE_PASSWORD: 'fxaccounts:change_password',
  // Fx Desktop expects fxaccounts:delete, Fennec expects fxaccounts:delete_account.
  // See https://github.com/mozilla/fxa-content-server/issues/3432
  DELETE: 'fxaccounts:delete',
  DELETE_ACCOUNT: 'fxaccounts:delete_account',
  FXA_STATUS: 'fxaccounts:fxa_status',
  LOADED: 'fxaccounts:loaded',
  LOGIN: 'fxaccounts:login',
  LOGOUT: 'fxaccounts:logout',
  PAIR_AUTHORIZE: 'fxaccounts:pair_authorize',
  PAIR_COMPLETE: 'fxaccounts:pair_complete',
  PAIR_DECLINE: 'fxaccounts:pair_decline',
  PAIR_HEARTBEAT: 'fxaccounts:pair_heartbeat',
  PAIR_PREFERENCES: 'fxaccounts:pair_preferences',
  PAIR_REQUEST_SUPPLICANT_METADATA: 'fxaccounts:pair_supplicant_metadata',
  PROFILE_CHANGE: 'profile:change',
  /*
    SYNC_PREFERENCES: 'fxaccounts:sync_preferences', // Removed in issue #4250
    */
  VERIFIED: 'fxaccounts:verified',
};

function WebChannel(id) {
  if (!id) {
    throw new Error('WebChannel must have an id');
  }

  this._id = id;
}

_.extend(WebChannel, COMMANDS);

_.extend(WebChannel.prototype, new DuplexChannel(), {
  COMMANDS,

  initialize(options = {}) {
    const win = (this.window = options.window || window);
    const webChannelId = this._id;

    var sender = (this._sender = new WebChannelSender());
    sender.initialize({
      webChannelId,
      window: win,
    });

    var receiver = (this._receiver = new WebChannelReceiver());
    receiver.initialize({
      webChannelId,
      window: win,
    });

    DuplexChannel.prototype.initialize.call(this, {
      receiver,
      sender,
      window: win,
    });
  },

  /**
   * Check if the browser supports the FXA_STATUS request.
   *
   * @param {String} [userAgent] UA string to check.
   *   Defaults to `this.getUserAgentString()`
   * @returns {Boolean}
   */
  isFxaStatusSupported(userAgent = this.getUserAgentString()) {
    const uap = this.getUserAgent(userAgent);
    return (
      uap.isFirefoxDesktop() &&
      uap.parseVersion().major >= FXA_STATUS_MIN_FIREFOX_DESKTOP_VERSION
    );
  },

  onErrorReceived(message) {
    const { error } = this.parseError(message);
    const errorMessage = error && error.message;

    // Browser does not support WebChannels sent on this channel,
    // or from this domain.
    if (/no such channel/i.test(errorMessage)) {
      // Since the channel is not supported, reject all outstanding
      // requests to avoid hanging until the requests time out.
      this.rejectAllOutstandingRequests(
        AuthErrors.toError('INVALID_WEB_CHANNEL')
      );
    }

    DuplexChannel.prototype.onErrorReceived.call(this, message);
  },
});

Cocktail.mixin(WebChannel, UrlMixin, UserAgentMixin);

export default WebChannel;
