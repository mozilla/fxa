/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A generic broker that can communicate with Firefox when used to sign in
 * to Sync. Concrete sub-classes should define the function `createChannel`
 * and a `commands` object.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const BaseAuthenticationBroker = require('models/auth_brokers/base');
  const ChannelMixin = require('models/auth_brokers/mixins/channel');
  const Cocktail = require('cocktail');
  const p = require('lib/promise');
  const Logger = require('lib/logger');

  const proto = BaseAuthenticationBroker.prototype;

  const FxSyncAuthenticationBroker = BaseAuthenticationBroker.extend({
    type: 'fx-sync',

    /**
     * Must be overridden with an object that contains:
     *
     * {
     *   CAN_LINK_ACCOUNT: <specify in subclass>,
     *   CHANGE_PASSWORD: <specify in subclass>,
     *   DELETE_ACCOUNT: <specify in subclass>,
     *   LOADED: <specify in subclass>,
     *   LOGIN: <specify in subclass>
     * }
     *
     * @property commands
     */
    commands: null,

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      sendChangePasswordNotice: true
    }),

    getCommand: function (commandName) {
      if (! this.commands) {
        throw new Error('this.commands must be specified');
      }

      var command = this.commands[commandName];
      if (! command) {
        throw new Error('command not found for: ' + commandName);
      }

      return command;
    },

    /**
     * Initialize the broker
     *
     * @param {Object} options
     * @param {String} [options.channel]
     *        Channel used to send commands to remote listeners.
     * @returns {undefined}
     */
    initialize: function (options = {}) {
      this._logger = new Logger();

      // channel can be passed in for testing.
      this._channel = options.channel;

      if (options.commands) {
        this.commands = options.commands;
      }

      return proto.initialize.call(this, options);
    },

    afterLoaded: function () {
      return this.send(this.getCommand('LOADED'))
        .then(() => proto.afterLoaded.call(this));
    },

    beforeSignIn: function (account) {
      var email = account.get('email');
      // This will send a message over the channel to determine whether
      // we should cancel the login to sync or not based on Desktop
      // specific checks and dialogs. It throws an error with
      // message='USER_CANCELED_LOGIN' and errno=1001 if that's the case.
      return this.request(this.getCommand('CAN_LINK_ACCOUNT'), { email: email })
        .then((response) => {
          if (response && ! response.ok) {
            throw AuthErrors.toError('USER_CANCELED_LOGIN');
          }

          this._verifiedCanLinkAccount = true;
          return proto.beforeSignIn.call(this, account);
        }, (err) => {
          this._logger.error('beforeSignIn failed with', err);
          // If the browser doesn't implement this command, then it will
          // handle prompting the relink warning after sign in completes.
          // This can likely be changed to 'reject' after Fx31 hits nightly,
          // because all browsers will likely support 'can_link_account'
        });
    },

    afterSignIn: function (account) {
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterSignIn.call(this, account));
    },

    afterForceAuth: function (account) {
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterForceAuth.apply(this, account));
    },

    beforeSignUpConfirmationPoll: function (account) {
      // The Sync broker notifies the browser of an unverified login
      // before the user has verified her email. This allows the user
      // to close the original tab or open the verification link in
      // the about:accounts tab and have Sync still successfully start.
      return this._notifyRelierOfLogin(account)
        .then(() => proto.beforeSignUpConfirmationPoll.call(this, account));
    },

    afterResetPasswordConfirmationPoll: function (account) {
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterResetPasswordConfirmationPoll.call(this, account));
    },

    afterChangePassword: function (account) {
      // If the message is sent over the WebChannel by the global WebChannel,
      // no need to send it from within the auth broker too.
      if (this.hasCapability('sendChangePasswordNotice')) {
        return this.send(
          this.getCommand('CHANGE_PASSWORD'),
          this._getLoginData(account)
        )
        .then(() => {
          return proto.afterChangePassword.call(this, account);
        });
      } else {
        return proto.afterChangePassword.call(this, account);
      }
    },

    afterDeleteAccount: function (account) {
      return this.send(this.getCommand('DELETE_ACCOUNT'), {
        email: account.get('email'),
        uid: account.get('uid')
      })
      .then(() => proto.afterDeleteAccount.call(this, account));
    },

    /**
     * Get a reference to a channel. If a channel has already been created,
     * the cached channel will be returned. Used by the ChannelMixin.
     *
     * @method getChannel
     * @returns {Object} channel
     */
    getChannel: function () {
      if (! this._channel) {
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
    createChannel: function () {
      throw new Error('createChannel must be overridden');
    },

    _notifyRelierOfLogin: function (account) {
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
      var loginData = this._getLoginData(account);
      if (! this._hasRequiredLoginFields(loginData)) {
        return p();
      }

      return this.send(this.getCommand('LOGIN'), loginData);
    },

    _hasRequiredLoginFields: function (loginData) {
      var requiredFields = FxSyncAuthenticationBroker.REQUIRED_LOGIN_FIELDS;
      var loginFields = Object.keys(loginData);
      return ! _.difference(requiredFields, loginFields).length;
    },

    _getLoginData: function (account) {
      var ALLOWED_FIELDS = [
        'customizeSync',
        'declinedSyncEngines',
        'email',
        'keyFetchToken',
        'sessionToken',
        'uid',
        'unwrapBKey',
        'verified'
      ];

      var loginData = account.pick(ALLOWED_FIELDS);
      loginData.verified = !! loginData.verified;
      loginData.verifiedCanLinkAccount = !! this._verifiedCanLinkAccount;
      return loginData;
    },

    /**
     * Notify the browser that it should open sync preferences
     *
     * @method openSyncPreferences
     * @param {String} entryPoint - where Sync Preferences is opened from
     * @returns {Promise} resolves when notification is sent.
     */
    openSyncPreferences: function (entryPoint) {
      if (this.hasCapability('syncPreferencesNotification')) {
        return this.send(this.getCommand('SYNC_PREFERENCES'), {
          entryPoint: entryPoint
        });
      }
    }
  }, {
    REQUIRED_LOGIN_FIELDS: [
      'customizeSync',
      'email',
      'keyFetchToken',
      'sessionToken',
      'uid',
      'unwrapBKey',
      'verified'
    ]
  });

  Cocktail.mixin(
    FxSyncAuthenticationBroker,
    ChannelMixin
  );

  module.exports = FxSyncAuthenticationBroker;
});

