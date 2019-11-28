/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 1.0 ... < 2.0.
 */

import _ from 'underscore';
import FxDesktopChannel from '../../lib/channels/fx-desktop-v1';
import FxSyncChannelAuthenticationBroker from '../auth_brokers/fx-sync-channel';
import HaltBehavior from '../../views/behaviors/halt';
import NavigateBehavior from '../../views/behaviors/navigate';

const proto = FxSyncChannelAuthenticationBroker.prototype;

export default FxSyncChannelAuthenticationBroker.extend({
  type: 'fx-ios-v1',

  commands: {
    CAN_LINK_ACCOUNT: 'can_link_account',
    CHANGE_PASSWORD: 'change_password',
    DELETE_ACCOUNT: 'delete_account',
    LOADED: 'loaded',
    LOGIN: 'login',
  },

  defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
    afterCompleteSignInWithCode: new NavigateBehavior('signin_confirmed'),
    // about:accounts displays its own screen after sign in, no need
    // to show anything.
    afterForceAuth: new HaltBehavior(),
    // about:accounts displays its own screen after password reset, no
    // need to show anything.
    afterResetPasswordConfirmationPoll: new HaltBehavior(),
    // about:accounts displays its own screen after sign in, no need
    // to show anything.
    afterSignIn: new HaltBehavior(),
    // about:accounts display the "Signin confirmed" screen after
    // the user signin is successful
    afterSignInConfirmationPoll: new NavigateBehavior('signin_confirmed'),
    // about:accounts display the "Signup complete!" screen after
    // the users verify their email
    afterSignUpConfirmationPoll: new NavigateBehavior('signup_confirmed'),
  }),

  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    disableLegacySigninSignup: true,
    emailFirst: true,
  }),

  createChannel() {
    var channel = new FxDesktopChannel();

    channel.initialize({
      // Fx on iOS and functional tests will send messages from the
      // content server itself. Accept messages from the content
      // server to handle these cases.
      origin: this.window.location.origin,
      window: this.window,
    });

    channel.on('error', this.trigger.bind(this, 'error'));

    return channel;
  },

  afterResetPasswordConfirmationPoll(account) {
    // fx-ios-v1 send a login message after reset password complete,
    // assuming the user verifies in the same browser. fx-ios-v1
    // do not support WebChannels, and the login message must be
    // sent within about:accounts for the browser to receive it.
    // Integrations that support WebChannel messages will send
    // the login message from the verification tab, and for users
    // of either integration that verify in a different browser,
    // they will be asked to signin in this browser using the
    // new password.
    return this._notifyRelierOfLogin(account).then(() =>
      proto.afterResetPasswordConfirmationPoll.call(this, account)
    );
  },

  /**
   * Notify the relier of login.
   *
   * @param {Object} account
   * @returns {Promise}
   * @private
   */
  _notifyRelierOfLogin(account) {
    return proto._notifyRelierOfLogin.call(this, account);
  },

  /**
   * Notify the relier that a sign-in with a code was performed.
   *
   * @param {Object} account
   * @returns {Promise}
   * @private
   */
  afterCompleteSignInWithCode(account) {
    return this._notifyRelierOfLogin(account).then(() =>
      proto.afterCompleteSignInWithCode.call(this, account)
    );
  },
});
