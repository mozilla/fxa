/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module represents a user of the fxa-content-server site.
// It persists accounts the user has logged in with and potentially
// other state about the user that might be useful.
//
// i.e. User hasMany Accounts.


'use strict';

define([
  'backbone',
  'underscore',
  'lib/promise',
  'lib/assertion',
  'lib/oauth-client',
  'models/account',
  'lib/storage',
  'lib/null-storage'
], function (Backbone, _, p, Assertion, OAuthClient, Account, Storage, NullStorage) {

  var User = Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};
      this._oAuthClientId = options.oAuthClientId;
      this._oAuthClient = options.oAuthClient;
      this._profileClient = options.profileClient;
      this._fxaClient = options.fxaClient;
      this._assertion = options.assertion;

      this._storage = options.storage;
      var win = options.window || window;
      if (! this._storage) {
        try {
          this._storage = new Storage(win.localStorage);
        } catch (e) {
          // if cookies are disabled, accessing localStorage will blow up.
          this._storage = new Storage(new NullStorage());
        }
      }
    },

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

    _getCurrentAccount: function () {
      return this._getAccount(this._storage.get('currentAccountUid'));
    },

    // persists account data
    _setAccount: function (account) {
      var accounts = this._accounts();
      accounts[account.uid] = account;
      this._storage.set('accounts', accounts);
    },

    // A conveinience method that initializes an account instance from
    // raw account data.
    createAccount: function (accountData) {
      if (accountData instanceof Account) {
        // we already have an account instance
        return accountData;
      }

      return new Account({
        accountData: accountData,
        assertion: this._assertion,
        oAuthClient: this._oAuthClient,
        profileClient: this._profileClient,
        fxaClient: this._fxaClient,
        oAuthClientId: this._oAuthClientId
      });
    },

    isSyncAccount: function (account) {
      return this.createAccount(account).isFromSync();
    },

    getCurrentAccount: function () {
      return this.createAccount(this._getCurrentAccount());
    },

    setCurrentAccountByUid: function (uid) {
      if (this._accounts()[uid]) {
        this._storage.set('currentAccountUid', uid);
      }
    },

    getAccountByUid: function (uid) {
      var account = this._accounts()[uid];
      return this.createAccount(account);
    },

    getAccountByEmail: function (email) {
      var account = _.find(this._accounts(), function (account) {
        return account.email === email;
      });
      return this.createAccount(account);
    },

    // Return the account selected in the account chooser.
    // Defaults to the last logged in account unless a desktop session
    // has been stored.
    getChooserAccount: function () {
      var self = this;

      var account = _.find(self._accounts(), function (account) {
        return self.isSyncAccount(account);
      }) || self._getCurrentAccount();

      return self.createAccount(account);
    },

    // Used to clear the current account, but keeps the account details
    clearCurrentAccount: function () {
      this._storage.remove('currentAccountUid');
    },

    removeAllAccounts: function () {
      this._storage.remove('currentAccountUid');
      this._storage.remove('accounts');
    },

    // Delete the account from storage
    removeAccount: function (accountData) {
      var account = this.createAccount(accountData);
      var uid = account.get('uid');
      var accounts = this._accounts();

      if (uid === this.getCurrentAccount().get('uid')) {
        this.clearCurrentAccount();
      }
      delete accounts[uid];
      this._storage.set('accounts', accounts);
    },

    // Stores a new account and sets it as the current account.
    setCurrentAccount: function (accountData) {
      var self = this;

      var account = self.createAccount(accountData);
      account.set('lastLogin', Date.now());

      return self.setAccount(account)
        .then(function (account) {
          self._storage.set('currentAccountUid', account.get('uid'));
          return account;
        });
    },

    // Hydrate the account then persist it
    setAccount: function (accountData) {
      var self = this;
      var account = self.createAccount(accountData);
      return account.fetch()
        .then(function () {
          self._setAccount(account.toJSON());
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
          if (! self.getCurrentAccount().isEmpty()) {
            // We've already upgraded the session
            return;
          }

          var promise = p();

          // add cached Sync account credentials if available
          if (Session.cachedCredentials) {
            promise = self.setCurrentAccount({
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
                return self.setCurrentAccount({
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
              });
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
    }

  });

  return User;
});
