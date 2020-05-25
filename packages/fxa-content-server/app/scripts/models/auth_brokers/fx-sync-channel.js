/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker that communicates with Firefox.
 * Concrete sub-classes should define the function `createChannel`
 * and a `commands` object.
 */

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import ChannelMixin from '../auth_brokers/mixins/channel';
import Cocktail from 'cocktail';
import FxSyncAuthenticationBroker from '../auth_brokers/fx-sync';
import Logger from '../../lib/logger';

const proto = FxSyncAuthenticationBroker.prototype;

const ALLOWED_LOGIN_FIELDS = [
  'declinedSyncEngines',
  'email',
  'keyFetchToken',
  'offeredSyncEngines',
  'sessionToken',
  'services',
  'uid',
  'unwrapBKey',
  'verified',
];

const REQUIRED_LOGIN_FIELDS = [
  'email',
  'keyFetchToken',
  'sessionToken',
  'uid',
  'unwrapBKey',
  'verified',
];

const FxSyncChannelAuthenticationBroker = FxSyncAuthenticationBroker.extend(
  {
    type: 'fx-sync-channel',

    /**
     * Must be overridden with an object that contains:
     *
     * {
     *   CAN_LINK_ACCOUNT: <specify in subclass>,
     *   CHANGE_PASSWORD: <specify in subclass>,
     *   DELETE_ACCOUNT: <specify in subclass>,
     *   FXA_STATUS: <specify in subclass>,
     *   LOADED: <specify in subclass>,
     *   LOGIN: <specify in subclass>,
     *   VERIFIED: <specify in subclass>,
     * }
     *
     * @property commands
     */
    commands: null,

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      sendChangePasswordNotice: true,
    }),

    /**
     * Initialize the broker
     *
     * @param {Object} options
     * @param {String} [options.channel]
     *        Channel used to send commands to remote listeners.
     */
    initialize(options = {}) {
      this._logger = new Logger();

      // channel can be passed in for testing.
      this._channel = options.channel;

      if (options.commands) {
        this.commands = options.commands;
      }

      proto.initialize.call(this, options);
    },

    afterLoaded() {
      return this.send(this.getCommand('LOADED')).then(() =>
        proto.afterLoaded.call(this)
      );
    },

    beforeSignIn(account) {
      const email = account.get('email');
      if (this._verifiedCanLinkEmail === email) {
        // This user has already been asked and responded that
        // they want to link the account. Do not ask again or
        // else the user sees the "can link account" browser
        // dialog twice in the "Signin unblock" flow.
        return proto.beforeSignIn.call(this, account);
      }

      // This will send a message over the channel to determine whether
      // we should cancel the login to sync or not based on Desktop
      // specific checks and dialogs. It throws an error with
      // message='USER_CANCELED_LOGIN' and errno=1001 if that's the case.
      return this.request(this.getCommand('CAN_LINK_ACCOUNT'), { email }).then(
        (response) => {
          if (response && !response.ok) {
            throw AuthErrors.toError('USER_CANCELED_LOGIN');
          }

          this._verifiedCanLinkEmail = email;
          return proto.beforeSignIn.call(this, account);
        },
        (err) => {
          this._logger.error('beforeSignIn failed with', err);
          // If the browser doesn't implement this command, then it will
          // handle prompting the relink warning after sign in completes.
          // This can likely be changed to 'reject' after Fx31 hits nightly,
          // because all browsers will likely support 'can_link_account'
        }
      );
    },

    afterSignIn(account) {
      return this._notifyRelierOfLogin(account).then(() =>
        proto.afterSignIn.call(this, account)
      );
    },

    afterForceAuth(account) {
      return this._notifyRelierOfLogin(account).then(() =>
        proto.afterForceAuth.apply(this, account)
      );
    },

    beforeSignUpConfirmationPoll(account) {
      // The Sync broker notifies the browser of an unverified login
      // before the user has verified their email. This allows the user
      // to close the original tab or open the verification link in
      // the about:accounts tab and have Sync still successfully start.
      return this._notifyRelierOfLogin(account).then(() =>
        proto.beforeSignUpConfirmationPoll.call(this, account)
      );
    },

    afterSignUpConfirmationPoll(account) {
      // The relier is notified of login here because `beforeSignUpConfirmationPoll`
      // is never called for users who verify at CWTS. Without the login notice,
      // the browser will never know the user signed up.
      return this._notifyRelierOfLogin(account).then(() =>
        proto.afterSignUpConfirmationPoll.call(this, account)
      );
    },

    afterChangePassword(account) {
      // If the message is sent over the WebChannel by the global WebChannel,
      // no need to send it from within the auth broker too.
      if (this.hasCapability('sendChangePasswordNotice')) {
        return this.send(
          this.getCommand('CHANGE_PASSWORD'),
          this._getLoginData(account)
        ).then(() => {
          return proto.afterChangePassword.call(this, account);
        });
      } else {
        return proto.afterChangePassword.call(this, account);
      }
    },

    afterDeleteAccount(account) {
      return this.send(this.getCommand('DELETE_ACCOUNT'), {
        email: account.get('email'),
        uid: account.get('uid'),
      }).then(() => proto.afterDeleteAccount.call(this, account));
    },

    /**
     * Get a reference to a channel. If a channel has already been created,
     * the cached channel will be returned. Used by the ChannelMixin.
     *
     * @method getChannel
     * @returns {Object} channel
     */
    getChannel() {
      if (!this._channel) {
        this._channel = this.createChannel();
      }

      return this._channel;
    },

    /**
     * Create a channel used to communicate with the relier. Must
     * be overridden by subclasses.
     *
     * @method createChannel
     * @throws {Error}
     */
    createChannel() {
      throw new Error('createChannel must be overridden');
    },

    _notifyRelierOfLogin(account) {
      /**
       * Workaround for #3078. If the user signs up but does not verify
       * their account, then visit `/` or `/settings`, they are
       * redirected to `/confirm` which attempts to notify the browser of
       * login. Since `unwrapBKey` and `keyFetchToken` are not persisted to
       * disk, the passed in account lacks these items. The browser can't
       * do anything without this data, so don't actually send the message.
       *
       * Also works around #3514. With e10s enabled, localStorage in
       * about:accounts and localStorage in the verification page are not
       * shared. This lack of shared state causes the original tab of
       * a password reset from about:accounts to not have all the
       * required data. The verification tab sends a WebChannel message
       * already, so no need here too.
       */
      const loginData = this._getLoginData(account);
      if (!this._hasRequiredLoginFields(loginData)) {
        return Promise.resolve();
      }

      // Only send one login notification per uid to avoid race
      // conditions within the browser. Two attempts to send
      // a login message occur for users that verify while
      // at the /confirm screen. The first attempt is made when
      // /confirm is first displayed, the 2nd when verification
      // completes.
      if (loginData.uid === this._uidOfLoginNotification) {
        return Promise.resolve();
      }
      this._uidOfLoginNotification = loginData.uid;

      return this.send(this.getCommand('LOGIN'), loginData);
    },

    _hasRequiredLoginFields(loginData) {
      const loginFields = Object.keys(loginData);
      return !_.difference(REQUIRED_LOGIN_FIELDS, loginFields).length;
    },

    /**
     * Get login data from `account` to send to the browser.
     * All returned keys have a defined value.
     *
     * @param {Object} account
     * @returns {Object}
     * @private
     */
    _getLoginData(account) {
      let loginData = account.pick(ALLOWED_LOGIN_FIELDS) || {};
      const isMultiService = this.relier && this.relier.get('multiService');
      if (isMultiService) {
        loginData = this._formatForMultiServiceBrowser(loginData);
      }

      loginData.verified = !!loginData.verified;
      loginData.verifiedCanLinkAccount = !!this._verifiedCanLinkEmail;
      return _.omit(loginData, _.isUndefined);
    },

    /**
     * if browser is multi service capable then we should send 'sync' properties
     * in a different format
     * @param loginData
     * @private
     */
    _formatForMultiServiceBrowser(loginData) {
      loginData.services = {};

      // if the user chose to Sync or enrolled via service parameter
      const syncPreference =
        this.relier.get('syncPreference') ||
        this.relier.get('service') === 'sync';

      if (syncPreference) {
        // sending an empty sync object turns on sync in the browser
        loginData.services.sync = {};

        if (loginData.offeredSyncEngines) {
          loginData.services.sync = {
            offeredEngines: loginData.offeredSyncEngines,
            declinedEngines: loginData.declinedSyncEngines,
          };
        }
      }
      // these should not be sent to a multi-service capable browser
      delete loginData.offeredSyncEngines;
      delete loginData.declinedSyncEngines;

      return loginData;
    },
  },
  {
    REQUIRED_LOGIN_FIELDS,
  }
);

Cocktail.mixin(FxSyncChannelAuthenticationBroker, ChannelMixin);

export default FxSyncChannelAuthenticationBroker;
