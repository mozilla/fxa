/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module represents a user of the fxa-content-server site.
// It persists accounts the user has logged in with and potentially
// other state about the user that might be useful.
//
// i.e. User hasMany Accounts.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Account = require('models/account');
  var Backbone = require('backbone');
  var Cocktail = require('cocktail');
  var p = require('lib/promise');
  var ResumeTokenMixin = require('models/mixins/resume-token');
  var Storage = require('lib/storage');

  var User = Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};
      this._oAuthClientId = options.oAuthClientId;
      this._oAuthClient = options.oAuthClient;
      this._profileClient = options.profileClient;
      this._fxaClient = options.fxaClient;
      this._marketingEmailClient = options.marketingEmailClient;
      this._assertion = options.assertion;
      this._notifier = options.notifier;
      this._storage = options.storage || Storage.factory();

      // For now, the uniqueUserId is passed in from app-start instead of
      // being initialized from the resume token or localStorage.
      this.set('uniqueUserId', options.uniqueUserId);

      // We cache the signed-in account instance to share across
      // consumers so that they don't have to refetch the account's
      // ephemeral data, e.g. OAuth access tokens.
      this._cachedSignedInAccount = null;
    },

    defaults: {
      // uniqueUserId is a stable identifier for this User on this computer.
      uniqueUserId: null
    },

    resumeTokenFields: ['uniqueUserId'],

    _accounts: function () {
      return this._storage.get('accounts') || {};
    },

    _getAccount: function (uid) {
      if (! uid) {
        return null;
      } else {
        return this._accounts()[uid] || null;
      }
    },

    _setSignedInAccountUid: function (uid) {
      this._storage.set('currentAccountUid', uid);
      // Clear the in-memory cache if the uid has changed
      if (this._cachedSignedInAccount && this._cachedSignedInAccount.get('uid') !== uid) {
        this._cachedSignedInAccount = null;
      }
    },

    clearSignedInAccountUid: function () {
      this._storage.remove('currentAccountUid');
      this._cachedSignedInAccount = null;
    },

    _getSignedInAccountData: function () {
      return this._getAccount(this._storage.get('currentAccountUid'));
    },

    // persists account data
    _persistAccount: function (account) {
      var accounts = this._accounts();
      accounts[account.uid] = account;
      this._storage.set('accounts', accounts);
    },

    // A conveinience method that initializes an account instance from
    // raw account data.
    initAccount: function (accountData) {
      if (accountData instanceof Account) {
        // we already have an account instance
        return accountData;
      }

      return new Account({
        accountData: accountData,
        assertion: this._assertion,
        fxaClient: this._fxaClient,
        marketingEmailClient: this._marketingEmailClient,
        oAuthClient: this._oAuthClient,
        oAuthClientId: this._oAuthClientId,
        profileClient: this._profileClient
      });
    },

    isSyncAccount: function (account) {
      return this.initAccount(account).isFromSync();
    },

    getSignedInAccount: function () {
      if (! this._cachedSignedInAccount) {
        this._cachedSignedInAccount = this.initAccount(this._getSignedInAccountData());
      }

      return this._cachedSignedInAccount;
    },

    isSignedInAccount: function (account) {
      return account.get('uid') === this.getSignedInAccount().get('uid');
    },

    setSignedInAccountByUid: function (uid) {
      if (this._accounts()[uid]) {
        this._setSignedInAccountUid(uid);
      }
    },

    getAccountByUid: function (uid) {
      var account = this._accounts()[uid];
      return this.initAccount(account);
    },

    getAccountByEmail: function (email) {
      // Reverse the list so newest accounts are first
      var uids = Object.keys(this._accounts()).reverse();
      var accounts = this._accounts();

      var uid = _.find(uids, function (uid) {
        return accounts[uid].email === email;
      });

      return this.initAccount(accounts[uid]);
    },

    // Return the account selected in the account chooser.
    // Defaults to the last logged in account unless a desktop session
    // has been stored.
    getChooserAccount: function () {
      var self = this;

      var account = _.find(self._accounts(), function (account) {
        return self.isSyncAccount(account);
      }) || self.getSignedInAccount();

      return self.initAccount(account);
    },

    // Used to clear the current account, but keeps the account details
    clearSignedInAccount: function () {
      var uid = this.getSignedInAccount().get('uid');
      this.clearSignedInAccountUid();
      this._notifier.triggerRemote(this._notifier.EVENTS.SIGNED_OUT, {
        uid: uid
      });
    },

    removeAllAccounts: function () {
      this.clearSignedInAccountUid();
      this._storage.remove('accounts');
    },

    // Delete the account from storage
    removeAccount: function (accountData) {
      var account = this.initAccount(accountData);

      if (this.isSignedInAccount(account)) {
        this.clearSignedInAccount();
      }

      var accounts = this._accounts();
      var uid = account.get('uid');
      delete accounts[uid];
      this._storage.set('accounts', accounts);
    },

    // Stores a new account and sets it as the current account.
    setSignedInAccount: function (accountData) {
      var self = this;

      var account = self.initAccount(accountData);
      account.set('lastLogin', Date.now());

      return self.setAccount(account)
        .then(function (account) {
          self._cachedSignedInAccount = account;
          self._setSignedInAccountUid(account.get('uid'));
          return account;
        });
    },

    // Hydrate the account then persist it
    setAccount: function (accountData) {
      var self = this;
      var account = self.initAccount(accountData);
      return account.fetch()
        .then(function () {
          self._persistAccount(account.toPersistentJSON());
          return account;
        });
    },

    // Old sessions store two accounts: The last account the
    // user logged in to FxA with, and the account they logged in to
    // Sync with. If they are different accounts, we'll save both accounts.
    upgradeFromSession: function (Session, fxaClient) {
      var self = this;

      return p()
        .then(function () {
          if (! self.getSignedInAccount().isDefault()) {
            // We've already upgraded the session
            return;
          }

          var promise = p();

          // add cached Sync account credentials if available
          if (Session.cachedCredentials) {
            promise = self.setSignedInAccount({
              email: Session.cachedCredentials.email,
              sessionToken: Session.cachedCredentials.sessionToken,
              sessionTokenContext: Session.cachedCredentials.sessionTokenContext,
              uid: Session.cachedCredentials.uid
            });
            Session.clear('cachedCredentials');
          }

          if (self._shouldAddOldSessionAccount(Session)) {
            promise = promise
              // The uid was not persisted in localStorage so get it from the auth server
              .then(_.bind(fxaClient.sessionStatus, fxaClient, Session.sessionToken))
              .then(function (result) {
                return self.setSignedInAccount({
                  email: Session.email,
                  sessionToken: Session.sessionToken,
                  sessionTokenContext: Session.sessionTokenContext,
                  uid: result.uid
                })
                .then(function () {
                  Session.clear('email');
                  Session.clear('sessionToken');
                  Session.clear('sessionTokenContext');
                });
              }, function () {
                // if there's an error, just ignore the account
              }); /* HACK: See eslint/eslint#1801 */ // eslint-disable-line indent
          }

          return promise;
        });
    },

    // Add the last signed in account (if it's different from the Sync account).
    // If the email is the same we assume it's the same account since users can't change email yet.
    _shouldAddOldSessionAccount: function (Session) {
      return (Session.email && Session.sessionToken &&
        (! Session.cachedCredentials ||
        Session.cachedCredentials.email !== Session.email));
    },

    signInAccount: function (account, relier, options) {
      var self = this;
      return account.signIn(relier, options)
        .then(function () {
          // If there's an account with the same uid in localStorage we merge
          // its attributes with the new account instance to retain state
          // used across sign-ins, such as granted permissions.
          var oldAccount = self.getAccountByUid(account.get('uid'));
          if (! oldAccount.isDefault()) {
            // allow new account attributes to override old ones
            oldAccount.set(_.omit(account.attributes, function (val) {
              return typeof val === 'undefined';
            }));
            account = oldAccount;
          }
          return self.setSignedInAccount(account)
            .then(function (account) {
              self._notifier.triggerRemote(self._notifier.EVENTS.SIGNED_IN, account.toJSON());
              return account;
            });
        });
    },

    signUpAccount: function (account, relier, options) {
      var self = this;
      return account.signUp(relier, options)
        .then(function () {
          return self.setSignedInAccount(account);
        });
    },

    signOutAccount: function (account) {
      var self = this;

      return account.signOut()
        .fin(function () {
          // Clear the session, even on failure. Everything is A-OK.
          // See issue #616
          if (self.isSignedInAccount(account)) {
            self.clearSignedInAccount();
          }
        });
    },

    changeAccountPassword: function (account, oldPassword, newPassword, relier) {
      var self = this;
      return account.changePassword(oldPassword, newPassword, relier)
        .then(function () {
          return self.setSignedInAccount(account);
        });
    },

    completeAccountPasswordReset: function (account, token, code, relier) {
      var self = this;
      return account.completePasswordReset(token, code, relier)
        .then(function () {
          return self.setSignedInAccount(account);
        });
    },

    /**
     * Fetch the devices for the given account, populated the passed in
     * Devices collection.
     *
     * @param {object} account - account for which device list is requested
     * @param {object} devices - Devices collection used to store list.
     * @returns {promise} resolves when the action completes
     */
    fetchAccountDevices: function (account, devices) {
      return account.fetchDevices(devices);
    },

    /**
     * Destroy a device on the given account. If the current device
     * is destroyed, sign out the user.
     *
     * @param {object} account - account with the device
     * @param {object} device - device to destroy
     * @returns {promise} resolves when the action completes
     */
    destroyAccountDevice: function (account, device) {
      var self = this;
      return account.destroyDevice(device)
        .then(function () {
          if (self.isSignedInAccount(account) && device.get('isCurrentDevice')) {
            self.clearSignedInAccount();
          }
        });
    }
  });

  Cocktail.mixin(
    User,
    ResumeTokenMixin
  );

  module.exports = User;
});
