/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module represents a user of the fxa-content-server site.
// It persists accounts the user has logged in with and potentially
// other state about the user that might be useful.
//
// i.e. User hasMany Accounts.

'use strict';

import _ from 'underscore';
import Account from './account';
import AuthErrors from '../lib/auth-errors';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import MarketingEmailErrors from '../lib/marketing-email-errors';
import ResumeTokenMixin from './mixins/resume-token';
import UrlMixin from './mixins/url';
import Storage from '../lib/storage';
import vat from '../lib/vat';

var User = Backbone.Model.extend({
  initialize (options = {}) {
    this._oAuthClientId = options.oAuthClientId;
    this._oAuthClient = options.oAuthClient;
    this._profileClient = options.profileClient;
    this._fxaClient = options.fxaClient;
    this._marketingEmailClient = options.marketingEmailClient;
    this._metrics = options.metrics;
    this._assertion = options.assertion;
    this._notifier = options.notifier;
    this._storage = options.storage || Storage.factory();

    this.sentryMetrics = options.sentryMetrics;

    // For now, the uniqueUserId is passed in from app-start instead of
    // being initialized from the resume token or localStorage.
    this.set('uniqueUserId', options.uniqueUserId);

    // We cache the signed-in account instance to share across
    // consumers so that they don't have to refetch the account's
    // ephemeral data, e.g. OAuth access tokens.
    this._cachedSignedInAccount = null;

    this.window = options.window || window;
    this.fetch();
  },

  defaults: {
    // uniqueUserId is a stable identifier for this User on this computer.
    uniqueUserId: null
  },

  resumeTokenFields: ['uniqueUserId'],

  resumeTokenSchema: {
    uniqueUserId: vat.uuid()
  },

  // Hydrate the model. Returns a promise.
  fetch () {
    return Promise.resolve().then(() => {
      this.populateFromStringifiedResumeToken(this.getSearchParam('resume'));
    });
  },

  /**
   * Log the number of stored accounts
   */
  logNumStoredAccounts () {
    const numAccounts = Object.keys(this._accounts()).length;
    this._metrics.logNumStoredAccounts(numAccounts);
  },

  _accounts () {
    return this._storage.get('accounts') || {};
  },

  _getAccount (uid) {
    if (! uid) {
      return null;
    } else {
      return this._accounts()[uid] || null;
    }
  },

  _setSignedInAccountUid (uid) {
    this._storage.set('currentAccountUid', uid);
    // Clear the in-memory cache if the uid has changed
    if (this._cachedSignedInAccount && this._cachedSignedInAccount.get('uid') !== uid) {
      this._cachedSignedInAccount = null;
    }
  },

  clearSignedInAccountUid () {
    this._storage.remove('currentAccountUid');
    this._cachedSignedInAccount = null;
  },

  _getSignedInAccountData () {
    return this._getAccount(this._storage.get('currentAccountUid'));
  },

  /**
   * Persists account data to localStorage.
   * The account will only be written if it has a uid.
   *
   * @param {Object} accountData
   */
  _persistAccount (accountData) {
    const account = this.initAccount(accountData);
    const accounts = this._accounts();
    const uid = account.get('uid');
    if (! uid) {
      this._metrics.logError(AuthErrors.toError('ACCOUNT_HAS_NO_UID', 'persistAccount'));
      return;
    }

    accounts[uid] = account.toPersistentJSON();
    this._storage.set('accounts', accounts);
  },

  // A convenience method that initializes an account instance from
  // raw account data.
  initAccount (accountData) {
    if (accountData instanceof Account) {
      // we already have an account instance
      return accountData;
    }

    return new Account(accountData, {
      assertion: this._assertion,
      fxaClient: this._fxaClient,
      marketingEmailClient: this._marketingEmailClient,
      metrics: this._metrics,
      notifier: this._notifier,
      oAuthClient: this._oAuthClient,
      oAuthClientId: this._oAuthClientId,
      profileClient: this._profileClient,
      sentryMetrics: this.sentryMetrics
    });
  },

  isSyncAccount (account) {
    return this.initAccount(account).isFromSync();
  },

  /**
   * Check the session status of the currently signed in user.
   *
   * @param {Object} [account] - account to check session status. If not provided,
   *  the currently signed in account is used.
   * @returns {Promise} resolves to signed in Account.
   *  If no user is signed in, rejects with an `INVALID_TOKEN` error.
   */
  sessionStatus (account = this.getSignedInAccount()) {
    return account.sessionStatus()
      .then(() => {
        // The session info may have changed since when it was last stored.
        // The Account model has already updated itself, now store the server's
        // view of the world. This will store the canonicalized email for everyone
        // that fetches the account afterwards.
        this.setAccount(account);
        return account;
      }, (err) => {
        // an account that was previously signed in is no longer considered signed in,
        // it's sessionToken field will have been updated. Store the account.
        if (AuthErrors.is(err, 'INVALID_TOKEN') && ! account.isDefault()) {
          this.setAccount(account);
        }
        throw err;
      });
  },

  getSignedInAccount () {
    if (! this._cachedSignedInAccount) {
      this._cachedSignedInAccount = this.initAccount(this._getSignedInAccountData());
    }

    return this._cachedSignedInAccount;
  },

  /**
   * Check if the current account is the signed in account
   *
   * @param {Object} account
   * @returns {Boolean}
   */
  isSignedInAccount (account) {
    const accountUid = account.get('uid');
    const signedInAccountUid = this.getSignedInAccount().get('uid');

    // both accounts must have a UID to be able to compare.
    if (! signedInAccountUid || ! accountUid) {
      return false;
    }

    return accountUid === signedInAccountUid;
  },

  /**
   * Check if another account is signed in. Not the inverse
   * of `isSignedInAccount` because if either account is default,
   * this will return `false`.
   *
   * @param {Object} account
   * @returns {Boolean}
   */
  isAnotherAccountSignedIn (account) {
    return ! this.getSignedInAccount().isDefault() &&
            ! this.isSignedInAccount(account);
  },

  setSignedInAccountByUid (uid) {
    if (this._accounts()[uid]) {
      this._setSignedInAccountUid(uid);
    }
  },

  getAccountByUid (uid) {
    var account = this._accounts()[uid];
    return this.initAccount(account);
  },

  getAccountByEmail (email) {
    // Reverse the list so newest accounts are first
    var uids = Object.keys(this._accounts()).reverse();
    var accounts = this._accounts();

    var uid = _.find(uids, function (uid) {
      return accounts[uid].email === email;
    });

    return this.initAccount(accounts[uid]);
  },

  /**
   * Return the account to display in the account chooser.
   * Account preference order:
   *   1. Accounts fetched using a signinCode (only have email)
   *   2. Valid Sync accounts (have email, sessionToken)
   *   3. Valid signed in accounts (have email, sessionToken)
   *   4. Default account
   *
   * @returns {Object} resolves to an Account.
   */
  getChooserAccount () {
    function isValidStoredAccount(account) {
      return !! (account && account.get('sessionToken') && account.get('email'));
    }

    if (this.has('signinCodeAccount')) {
      return this.get('signinCodeAccount');
    } else {
      const validSyncAccount = _.find(this._accounts(), (accountData) => {
        const account = this.initAccount(accountData);
        return this.isSyncAccount(account) && isValidStoredAccount(account);
      });
      const signedInAccount = this.getSignedInAccount();
      const validSignedInAccount = isValidStoredAccount(signedInAccount) && signedInAccount;

      let account = {};
      if (validSyncAccount) {
        account = validSyncAccount;
      } else if (validSignedInAccount) {
        account = validSignedInAccount;
      }

      return this.initAccount(account);
    }
  },

  // Used to clear the current account, but keeps the account details
  clearSignedInAccount () {
    var uid = this.getSignedInAccount().get('uid');
    this.clearSignedInAccountUid();
    this._notifier.triggerRemote(this._notifier.COMMANDS.SIGNED_OUT, {
      uid: uid
    });
  },

  removeAllAccounts () {
    this.clearSignedInAccountUid();
    this._storage.remove('accounts');
    this.unset('signinCodeAccount');
  },

  /**
   * Remove the account from storage. If account is the "signed in account",
   * the signed in account field will be cleared.
   *
   * @param {Object} accountData - Account model or object representing
   *   account data.
   */
  removeAccount (accountData) {
    var account = this.initAccount(accountData);

    if (this.isSignedInAccount(account)) {
      this.clearSignedInAccount();
    }

    var accounts = this._accounts();
    var uid = account.get('uid');
    delete accounts[uid];
    this._storage.set('accounts', accounts);
  },

  /**
   * Delete the account from the server, notify all interested parties,
   * delete the account from storage.
   *
   * @param {Object} accountData
   * @param {String} password - the user's password
   * @return {Promise} - resolves when complete
   */
  deleteAccount (accountData, password) {
    var account = this.initAccount(accountData);

    return account.destroy(password)
      .then(() => {
        this.removeAccount(account);
        this._notifier.triggerAll(this._notifier.COMMANDS.DELETE, {
          uid: account.get('uid')
        });
      });
  },

  // Stores a new account and sets it as the current account.
  setSignedInAccount (accountData) {
    var account = this.initAccount(accountData);
    account.set('lastLogin', Date.now());

    return this.setAccount(account)
      .then((account) => {
        this._cachedSignedInAccount = account;
        this._setSignedInAccountUid(account.get('uid'));
        return account;
      });
  },

  // Hydrate the account then persist it
  setAccount (accountData) {
    var account = this.initAccount(accountData);

    return account.fetch()
      .then(() => {
        this._persistAccount(account);
        return account;
      });
  },

  /**
   * Remove accounts with invalid uids.
   * See #4769. w/ e10s enabled, post account reset,
   * a phantom account with a uid of the string `undefined`
   * was being written to localStorage. These accounts
   * are garbage, get rid of them.
   *
   * @returns {Promise}
   */
  removeAccountsWithInvalidUid () {
    return Promise.resolve().then(() => {
      const accounts = this._accounts();
      for (const uid in accounts) {
        // the string `undefined` is correct here. That's the
        // uid being stored in localStorage.
        if (! uid || uid === 'undefined') {
          delete accounts[uid];
          this._storage.set('accounts', accounts);
        }
      }
    });
  },

  /**
   * Sign in an account. Notifies other tabs of signin on success.
   *
   * @param {Object} account - account to sign in
   * @param {String} password - the user's password
   * @param {Object} relier - relier being signed in to
   * @param {Object} [options] - options
   *   @param {String} [options.unblockCode] - unblock code
   * @returns {Promise} - resolves when complete
   */
  signInAccount (account, password, relier, options) {
    return account.signIn(password, relier, options)
      .then(() => {
        // If there's an account with the same uid in localStorage we merge
        // its attributes with the new account instance to retain state
        // used across sign-ins, such as granted permissions.
        var oldAccount = this.getAccountByUid(account.get('uid'));
        if (! oldAccount.isDefault()) {
          // allow new account attributes to override old ones
          oldAccount.set(_.omit(account.attributes, function (val) {
            return typeof val === 'undefined';
          }));
          account = oldAccount;
        }

        this._notifyOfAccountSignIn(account);
        return this.setSignedInAccount(account);
      });
  },

  /**
   * Sign up a new account
   *
   * @param {Object} account - account to sign up
   * @param {String} password - the user's password
   * @param {Object} relier - relier being signed in to
   * @param {Object} [options] - options
   * @returns {Promise} - resolves when complete
   */
  signUpAccount (account, password, relier, options) {
    return account.signUp(password, relier, options)
      .then(() => this.setSignedInAccount(account));
  },

  /**
   * Sign out the given account clearing any info held about the account.
   *
   * @param {Object} account - account to sign out
   * @returns {Promise} - resolves when complete
   */
  signOutAccount (account) {
    return account.signOut()
      .then(
        // Remove the account, even on failure. Everything is A-OK.
        // See issue #616
        (val) => {
          this.removeAccount(account);
          return val;
        },
        (err) => {
          this.removeAccount(account);
          throw err;
        }
      );
  },

  /**
   * Complete signup for the account. Notifies other tabs of signin
   * if the account has a sessionToken and verification successfully
   * completes.
   *
   * @param {Object} account - account to verify
   * @param {String} code - verification code
   * @param {Object} [options]
   * @param {Object} [options.service] - the service issuing signup request
   * @returns {Promise} - resolves with the account when complete
   */
  completeAccountSignUp (account, code, options) {
    // The original tab may no longer be open to notify other
    // windows the user is signed in. If the account has a `sessionToken`,
    // the user verified in the same browser. Notify any tabs that care.
    const notifyIfSignedIn = (account) => {
      if (account.has('sessionToken')) {
        this._notifyOfAccountSignIn(account);
      }
    };

    return account.verifySignUp(code, options)
      .catch((err) => {
        if (MarketingEmailErrors.created(err)) {
          // A MarketingEmailError doesn't prevent a user from
          // completing the signup. If we receive a MarketingEmailError,
          // notify other tabs of the sign in, and re-throw the error
          // so it can be logged at a higher level.
          notifyIfSignedIn(account);
        }
        throw err;
      })
      .then(function () {
        notifyIfSignedIn(account);

        return account;
      });
  },

  /**
   * Change the account password
   *
   * @param {Object} account - account to change the password for.
   * @param {String} oldPassword - the old password
   * @param {String} newPassword - the new password
   * @param {Object} relier - the relier used to open settings
   * @return {Object} promise - resolves with the updated account
   * when complete.
   */
  changeAccountPassword (account, oldPassword, newPassword, relier) {
    return account.changePassword(oldPassword, newPassword, relier)
      .then(() => {
        return this.setSignedInAccount(account);
      })
      .then(() => {
        // Notify the browser whenever the password has changed
        const notifier = this._notifier;
        const changePasswordCommand = notifier.COMMANDS.CHANGE_PASSWORD;

        const loginData = account.pick(
          Object.keys(notifier.SCHEMATA[changePasswordCommand]));
        loginData.verified = !! loginData.verified;

        notifier.triggerRemote(
          changePasswordCommand,
          loginData
        );

        return account;
      });
  },

  /**
   * Notify other tabs of account sign in
   *
   * @private
   * @param {Object} account
   */
  _notifyOfAccountSignIn (account) {
    const notifier = this._notifier;
    const signedInCommand = notifier.COMMANDS.SIGNED_IN;
    notifier.triggerRemote(
      signedInCommand,
      account.pick(Object.keys(notifier.SCHEMATA[signedInCommand]))
    );
  },

  /**
   * Complete a password reset for the account. Notifies other tabs
   * of signin on success.
   *
   * @param {Object} account - account to sign up
   * @param {String} password - the user's new password
   * @param {String} token - email verification token
   * @param {String} code - email verification code
   * @param {Object} relier - relier being signed in to
   * @param {String} emailToHashWith - use this email to hash password with
   * @returns {Promise} - resolves when complete
   */
  completeAccountPasswordReset (account, password, token, code, relier, emailToHashWith) {
    return account.completePasswordReset(password, token, code, relier, emailToHashWith)
      .then(() => {
        this._notifyOfAccountSignIn(account);
        return this.setSignedInAccount(account);
      });
  },

  /**
   * Complete a password reset for the account using a recovery key. Notifies other tabs
   * of signin on success.
   *
   * @param {Object} account - account to sign up
   * @param {String} password - the user's new password
   * @param {String} accountResetToken - token used to issue request
   * @param {String} recoveryKeyId - recoveryKeyId that maps to recovery code
   * @param {String} kB - original kB
   * @param {Object} relier - relier being signed in to
   * @param {String} emailToHashWith - hash password with this email
   * @returns {Promise} - resolves when complete
   */
  completeAccountPasswordResetWithRecoveryKey (account, password, accountResetToken, recoveryKeyId, kB, relier, emailToHashWith) {
    return account.resetPasswordWithRecoveryKey(accountResetToken, password, recoveryKeyId, kB, relier, emailToHashWith)
      .then(() => {
        this._notifyOfAccountSignIn(account);
        return this.setSignedInAccount(account);
      });
  },

  /**
   *
   * @param {Object} account - account object
   * @param {Object} client - an attached client
   * @returns {Promise}
   */
  destroyAccountClient (account, client) {
    if (client.get('clientType') === Constants.CLIENT_TYPE_DEVICE) {
      return this.destroyAccountDevice(account, client);
    } else if (client.get('clientType') === Constants.CLIENT_TYPE_OAUTH_APP) {
      return this.destroyAccountApp(account, client);
    } else if (client.get('clientType') === Constants.CLIENT_TYPE_WEB_SESSION) {
      return this.destroyAccountSession(account, client);
    }
  },

  /**
   * Fetch the devices for the given account, populated the passed in
   * Devices collection.
   *
   * @param {Object} account - account for which device list is requested
   * @param {Object} devices - Devices collection used to store list.
   * @returns {Promise} resolves when the action completes
   */
  fetchAccountDevices (account, devices) {
    return account.fetchDevices(devices);
  },

  /**
   * Fetch the OAuthApps for the given account, populated into the passed
   * collection.
   *
   * @param {Object} account - account for which device list is requested
   * @param {Object} oAuthApps - oAuthApps collection used to store list.
   * @returns {Promise} resolves when the action completes
   */
  fetchAccountOAuthApps (account, oAuthApps) {
    return account.fetchOAuthApps(oAuthApps);
  },

  /**
   * Fetch the sessions for the given account, populated into the passed
   * collection.
   *
   * @param {Object} account - account for which device list is requested
   * @param {Object} sessions - sessions collection used to store list.
   * @returns {Promise} resolves when the action completes
   */
  fetchAccountSessions (account, sessions) {
    return account.fetchSessions(sessions);
  },

  /**
   * Destroy a device on the given account. If the current device
   * is destroyed, sign out the user.
   *
   * @param {Object} account - account with the device
   * @param {Object} device - device to destroy
   * @returns {Promise} resolves when the action completes
   */
  destroyAccountDevice (account, device) {
    return account.destroyDevice(device)
      .then(() => {
        if (this.isSignedInAccount(account) && device.get('isCurrentDevice')) {
          this.removeAccount(account);
        }
      });
  },

  /**
   * Destroy a session on the given account. If it is the current session, sign out the user.
   *
   * @param {Object} account - account with the device
   * @param {Object} session - session to destroy
   * @returns {Promise} resolves when the action completes
   */
  destroyAccountSession (account, session) {
    return account.destroySession(session)
      .then(() => {
        if (this.isSignedInAccount(account) && session.get('isCurrentSession')) {
          this.clearSignedInAccount();
        }
      });
  },

  /**
   * Destroy the OAuth app on the given account.
   *
   * @param {Object} account - account with the connected app
   * @param {Object} oAuthApp - OAuth App to disconnect
   * @returns {Promise} resolves when the action completes
   */
  destroyAccountApp (account, oAuthApp) {
    return account.destroyOAuthApp(oAuthApp);
  },

  /**
   * Check whether an Account's `uid` is registered. Removes the account
   * from storage if account no longer exists on the server.
   *
   * @param {Object} account - account to check
   * @returns {Promise} resolves to `true` if an account exists, `false` otw.
   */
  checkAccountUidExists (account) {
    return account.checkUidExists()
      .then((exists) => {
        if (! exists) {
          this.removeAccount(account);
        }
        return exists;
      });
  },

  /**
   * Check whether an Account's `email` is registered. Removes the account
   * from storage if account no longer exists on the server.
   *
   * @param {Object} account - account to check
   * @returns {Promise} resolves to `true` if an account exists, `false` otw.
   */
  checkAccountEmailExists (account) {
    return account.checkEmailExists()
      .then((exists) => {
        if (! exists) {
          this.removeAccount(account);
        }
        return exists;
      });
  },

  /**
   * Reject the unblockCode for the given account. This invalidates
   * the unblock code and logs the signin attempt as suspicious.
   *
   * @param {Object} account
   * @param {String} unblockCode
   * @returns {Promise}
   */
  rejectAccountUnblockCode(account, unblockCode) {
    return account.rejectUnblockCode(unblockCode);
  },

  /**
   * Should the model be initialized using browser data?
   *
   * @param {Object} service service being signed into.
   * @returns {Boolean}
   */
  shouldSetSignedInAccountFromBrowser (service) {
    // If service=sync, always use the browser's state of the world.
    // If trying to sign in to an OAuth relier, prefer any users that are
    // stored in localStorage and only use the browser's state if no
    // user is stored.
    return service === Constants.SYNC_SERVICE || this.getSignedInAccount().isDefault();
  },

  /**
   * Set signed in account from the browser's `accountData`
   *
   * @param {Object} accountData
   * @returns {Promise}
   */
  setSignedInAccountFromBrowserAccountData (accountData) {
    return Promise.resolve().then(() => {
      if (accountData) {
        const account = this.initAccount(
          _.pick(accountData, 'email', 'sessionToken', 'uid', 'verified')
        );
        account.set('sessionTokenContext', Constants.SESSION_TOKEN_USED_FOR_SYNC);

        // If service=sync, account information is stored in memory only.
        // All other services store account information in localStorage.
        return this.setSignedInAccount(account);
      }

      // If no account data is returned from the browser,
      // don't clear or store anything. No need to. Sync users
      // will have no accounts stored in memory, and OAuth users
      // can only arrive here if no accounts are stored in localStorage.
    });
  },

  /**
   * Set the signinCode account from `accountData`
   *
   * @param {Object} accountData
   * @returns {Promise}
   */
  setSigninCodeAccount (accountData) {
    return Promise.resolve().then(() => {
      const account = this.initAccount(
        _.pick(accountData, 'email')
      );
      this.set('signinCodeAccount', account);
    });
  }
});

Cocktail.mixin(
  User,
  ResumeTokenMixin,
  UrlMixin
);

module.exports = User;
