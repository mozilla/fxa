/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * WebChannel OAuth broker that speaks 'v1' of the protocol.
 */
import _ from 'underscore';
import ChannelMixin from './mixins/channel';
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import HaltBehavior from '../../views/behaviors/halt';
import OAuthRedirectAuthenticationBroker from './oauth-redirect';
import ScopedKeys from 'lib/crypto/scoped-keys';
import WebChannel from '../../lib/channels/web';
import SyncEngines from '../sync-engines';

const proto = OAuthRedirectAuthenticationBroker.prototype;

const OAuthWebChannelBroker = OAuthRedirectAuthenticationBroker.extend({
  defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
    afterForceAuth: new HaltBehavior(),
    afterSignIn: new HaltBehavior(),
  }),

  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    chooseWhatToSyncWebV1: true,
    openWebmailButtonVisible: false,
  }),

  commands: _.pick(WebChannel, 'FXA_STATUS', 'OAUTH_LOGIN'),

  type: Constants.OAUTH_WEBCHANNEL_BROKER,

  initialize(options = {}) {
    this.session = options.session;
    this._channel = options.channel;
    this._scopedKeys = ScopedKeys;
    options.fxaStatus = true;

    proto.initialize.call(this, options);
    // the Base broker determines if fxaStatus is supported based on UA
    // after we initialize we want to explicitly set that this broker supports the status
    this.setCapability('fxaStatus', true);
    this.on('fxa_status', (response) => this.onFxaStatus(response));
  },

  /**
   * Handle a response to the `fxa_status` message.
   *
   * @param {any} [response={}]
   * @private
   */
  onFxaStatus(response = {}) {
    const cwtsStatus =
      (response.capabilities && response.capabilities.choose_what_to_sync) ||
      false;

    if (!cwtsStatus) {
      // applications may choose to skip the CWTS screen
      return this.set('chooseWhatToSyncWebV1Engines', null);
    }

    const supportedEngines =
      response.capabilities && response.capabilities.engines;
    if (supportedEngines) {
      // supportedEngines override the defaults
      const syncEngines = new SyncEngines(null, {
        engines: supportedEngines,
        window: this.window,
      });
      return this.set('chooseWhatToSyncWebV1Engines', syncEngines);
    }
    return proto.onFxaStatus.call(this, response);
  },

  createChannel() {
    const channel = new WebChannel(Constants.ACCOUNT_UPDATES_WEBCHANNEL_ID);
    channel.initialize({
      window: this.window,
    });

    return channel;
  },

  DELAY_BROKER_RESPONSE_MS: 100,

  /**
   * Send a WebChannel message with the necessary OAuth data
   * @param result {Object}
   *   @param {String} [result.code] - OAuth token code
   *   @param {String} [result.state] - OAuth state
   *   @param {String} [result.action] - Action taken by the user, such as 'signin' or 'signup'
   * @param account {Object} - User's account object
   * @returns {Promise}
   */
  sendOAuthResultToRelier(result, account) {
    result.redirect = Constants.OAUTH_WEBCHANNEL_REDIRECT;
    if (account && account.get('declinedSyncEngines')) {
      result.declinedSyncEngines = account.get('declinedSyncEngines');
      result.offeredSyncEngines = account.get('offeredSyncEngines');
    }

    // Always use the state the RP passed in.
    // This is necessary to complete the prompt=none
    // flow error cases where no interaction with
    // the server occurs to get the state from
    // the redirect_uri returned when creating
    // the token or code.
    const state = this.relier.get('state');
    if (state) {
      result.state = state;
    }
    return this.send(this.getCommand('OAUTH_LOGIN'), result);
  },
});

Cocktail.mixin(OAuthWebChannelBroker, ChannelMixin);

export default OAuthWebChannelBroker;
