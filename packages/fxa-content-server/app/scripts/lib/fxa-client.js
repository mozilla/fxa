/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

'use strict';

define([
  'fxaClient',
  'jquery',
  'p',
  'lib/session'
],
function (FxaClient, $, p, Session) {
  var client;

  function FxaClientWrapper() {
    // nothing to do here.
  }

  FxaClientWrapper.prototype = {
    _getClientAsync: function () {
      var defer = p.defer();

      if (client) {
        defer.resolve(client);
      } else {
        $.getJSON('/config', function (data) {
          client = new FxaClient(data.fxaccountUrl);
          defer.resolve(client);
        });
      }

      return defer.promise;
    },

    signIn: function (email, password) {
      return this._getClientAsync()
              .then(function (client) {
                return client.signIn(email, password, { keys: true });
              })
              .then(function (accountData) {
                // get rid of any old data.
                Session.clear();

                var updatedSessionData = {
                  email: email,
                  uid: accountData.uid,
                  unwrapBKey: accountData.unwrapBKey,
                  keyFetchToken: accountData.keyFetchToken,
                  sessionToken: accountData.sessionToken
                };

                Session.set(updatedSessionData);
                if (Session.channel) {
                  Session.channel.send('login', updatedSessionData);
                } else if (window.console && window.console.warn) {
                  console.warn('Session.channel does not exist');
                }

                return accountData;
              });

    },

    signUp: function (email, password) {
      var self = this;
      return this._getClientAsync()
              .then(function (client) {
                return client.signUp(email, password, { keys: true });
              })
              .then(function () {
                return self.signIn(email, password);
              });
    },

    signOut: function () {
      return this._getClientAsync()
              .then(function (client) {
                return client.sessionDestroy(Session.sessionToken);
              })
              .then(function () {
                // user's session is gone
                Session.clear();
              });
    },

    verifyCode: function (uid, code) {
      return this._getClientAsync()
              .then(function (client) {
                return client.verifyCode(uid, code);
              });
    },

    requestPasswordReset: function (email) {
      return this._getClientAsync()
              .then(function (client) {
                return client.passwordForgotSendCode(email);
              })
              .then(function () {
                Session.clear();
                Session.set('email', email);
              });
    },

    completePasswordReset: function (email, newPassword, token, code) {
      return this._getClientAsync()
              .then(function (client) {
                return client.passwordForgotVerifyCode(code, token);
              })
              .then(function (result) {
                return client.accountReset(email,
                           newPassword,
                           result.accountResetToken);
              });
    },

    changePassword: function (email, oldPassword, newPassword) {
      var self = this;
      return this._getClientAsync()
              .then(function (client) {
                return client.passwordChange(email, oldPassword, newPassword);
              })
              .then(function () {
                // Clear old info on password change.
                Session.clear();
                return self.signIn(email, newPassword);
              });
    },

    deleteAccount: function (email, password) {
      return this._getClientAsync()
              .then(function (client) {
                return client.accountDestroy(email, password);
              })
              .then(function () {
                Session.clear();
              });
    },

    recoveryEmailResendCode: function (sessionToken) {
      return this._getClientAsync().then(function (client) {
                return client.recoveryEmailResendCode(sessionToken);
              });
    }

  };

  return FxaClientWrapper;
});

