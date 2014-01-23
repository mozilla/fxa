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
                Session.set({
                  email: email,
                  uid: accountData.uid,
                  unwrapBKey: accountData.unwrapBKey,
                  keyFetchToken: accountData.keyFetchToken,
                  sessionToken: accountData.sessionToken
                });

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
                Session.clear('email');
                Session.clear('uid');
                Session.clear('unwrapBKey');
                Session.clear('keyFetchToken');
                Session.clear('sessionToken');
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
      return this._getClientAsync()
              .then(function (client) {
                return client.passwordChange(email, oldPassword, newPassword);
              })
              .then(function (result) {
                Session.keyFetchToken = result.keyFetchToken;

                return result;
              });
    },

    deleteAccount: function (email, password) {
      return this._getClientAsync()
              .then(function (client) {
                return client.accountDestroy(email, password);
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

