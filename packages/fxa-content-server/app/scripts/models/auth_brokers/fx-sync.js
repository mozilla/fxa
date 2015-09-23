/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A generic broker that can communicate with Firefox when used to sign in
 * to Sync. Concrete sub-classes should define the function `createChannel`
 * and a `commands` object.
 *
 * The functions `afterResetPasswordConfirmationPoll`, `afterSignIn`, and
 * `beforeSignUpConfirmationPoll` all return `halt: true` by default.
 *
 * A subclass/instance can override this behavior by specifying
 * `false` for any of:
 *   `haltAfterResetPasswordConfirmationPoll`
 *   `haltAfterSignIn`
 *   `haltBeforeSignUpConfirmationPoll`
 */

define([
  'cocktail',
  'underscore',
  'models/auth_brokers/base',
  'models/auth_brokers/mixins/channel',
  'lib/auth-errors'
], function (Cocktail, _, BaseAuthenticationBroker, ChannelMixin, AuthErrors) {
  'use strict';

  var FxSyncAuthenticationBroker = BaseAuthenticationBroker.extend({
    type: 'fx-sync',

    /**
     * Must be overridden with an object that contains:
     *
     * {
     *   CAN_LINK_ACCOUNT: <specify in subclass>,
     *   CHANGE_PASSWORD: <specify in subclass>,
     *   DELETE_ACCOUNT: <specify in subclass>,
     *   LOADED: <specify in subclass>,
     *   LOGIN: <specify in subclass>\
     * }
     *
     * @property commands
     */
    commands: null,

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
     */
    initialize: function (options) {
      options = options || {};
      var self = this;

      // channel can be passed in for testing.
      self._channel = options.channel;

      var optionsToImport = [
        'haltAfterResetPasswordConfirmationPoll',
        'haltAfterSignIn',
        'haltBeforeSignUpConfirmationPoll'
      ];
      optionsToImport.forEach(function (optionName) {
        if (optionName in options) {
          self[optionName] = options[optionName];
        }
      });

      if (options.commands) {
        this.commands = options.commands;
      }

      return BaseAuthenticationBroker.prototype.initialize.call(
          self, options);
    },

    afterLoaded: function () {
      return this.send(this.getCommand('LOADED'));
    },

    beforeSignIn: function (email) {
      var self = this;
      // This will send a message over the channel to determine whether
      // we should cancel the login to sync or not based on Desktop
      // specific checks and dialogs. It throws an error with
      // message='USER_CANCELED_LOGIN' and errno=1001 if that's the case.
      return self.request(self.getCommand('CAN_LINK_ACCOUNT'), { email: email })
        .then(function (response) {
          if (response && ! response.ok) {
            throw AuthErrors.toError('USER_CANCELED_LOGIN');
          }

          self._verifiedCanLinkAccount = true;
        }, function (err) {
          console.error('beforeSignIn failed with', err);
          // If the browser doesn't implement this command, then it will
          // handle prompting the relink warning after sign in completes.
          // This can likely be changed to 'reject' after Fx31 hits nightly,
          // because all browsers will likely support 'can_link_account'
        });
    },

    haltAfterSignIn: false,
    afterSignIn: function (account) {
      var self = this;
      return self._notifyRelierOfLogin(account)
        .then(function () {
          // the browser will take over from here,
          // don't let the screen transition.
          return { halt: self.haltAfterSignIn };
        });
    },

    haltBeforeSignUpConfirmationPoll: false,
    beforeSignUpConfirmationPoll: function (account) {
      // The Sync broker notifies the browser of an unverified login
      // before the user has verified her email. This allows the user
      // to close the original tab or open the verification link in
      // the about:accounts tab and have Sync still successfully start.
      var self = this;
      return this._notifyRelierOfLogin(account)
        .then(function () {
          // the browser is already polling, no need for the content server
          // code to poll as well, otherwise two sets of polls are going on
          // for the same user.
          return { halt: self.haltBeforeSignUpConfirmationPoll };
        });
    },

    haltAfterResetPasswordConfirmationPoll: false,
    afterResetPasswordConfirmationPoll: function (account) {
      var self = this;
      return self._notifyRelierOfLogin(account)
        .then(function () {
          // the browser will take over from here,
          // don't let the screen transition.
          return { halt: self.haltAfterResetPasswordConfirmationPoll };
        });
    },

    afterChangePassword: function (account) {
      return this.send(
          this.getCommand('CHANGE_PASSWORD'), this._getLoginData(account));
    },

    afterDeleteAccount: function (account) {
      // no response is expected, so do not wait for one
      return this.send(this.getCommand('DELETE_ACCOUNT'), {
        email: account.get('email'),
        uid: account.get('uid')
      });
    },

    /**
     * Get a reference to a channel. If a channel has already been created,
     * the cached channel will be returned. Used by the ChannelMixin.
     *
     * @method getChannel
     * @returns {object} channel
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
     * @returns {object} channel
     */
    createChannel: function () {
      throw new Error('createChannel must be overridden');
    },

    _notifyRelierOfLogin: function (account) {
      return this.send(this.getCommand('LOGIN'), this._getLoginData(account));
    },

    _getLoginData: function (account) {
      var ALLOWED_FIELDS = [
        'email',
        'uid',
        'sessionToken',
        'unwrapBKey',
        'keyFetchToken',
        'customizeSync',
        'verified'
      ];

      var loginData = {};
      _.each(ALLOWED_FIELDS, function (field) {
        loginData[field] = account.get(field);
      });

      loginData.verified = !! loginData.verified;
      loginData.verifiedCanLinkAccount = !! this._verifiedCanLinkAccount;
      return loginData;
    }
  });

  Cocktail.mixin(
    FxSyncAuthenticationBroker,
    ChannelMixin
  );

  return FxSyncAuthenticationBroker;
});

