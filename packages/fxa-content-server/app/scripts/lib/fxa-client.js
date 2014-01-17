/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

'use strict';

define([
  'fxaClient',
  'jquery'
],
function (FxaClient, $) {
  var client;

  function FxaClientWrapper() {
    // nothing to do here.
  }

  FxaClientWrapper.prototype = {
    _withClient: function (callback) {
      return this._getAsync()
        .then(function (client) {
            callback(client);
          });
    },

    _getAsync: function () {
      var defer = $.Deferred();

      if (client) {
        defer.resolve(client);
      } else {
        $.getJSON('/config', function (data) {
          client = new FxaClient(data.fxaccountUrl);
          defer.resolve(client);
        });
      }

      return defer.promise();
    },

    signIn: function (email, password) {
      return this._withClient(function (client) {
                return client.signIn(email, password, { keys: true });
              });
    },

    signUp: function (email, password) {
      return this._withClient(function (client) {
        client.signUp(email, password, { keys: true })
               .then(function () {
                  return client.signIn(email, password, { keys: true });
                });

      });
    },

    verifyCode: function (uid, code) {
      return this._withClient(function (client) {
                return client.verifyCode(uid, code);
              });
    },

    requestPasswordReset: function (email) {
      return this._withClient(function (client) {
                return client.passwordForgotSendCode(email);
              });
    },

    completePasswordReset: function (email, newPassword, token, code) {
      return this._withClient(function (client) {
                return client.passwordForgotVerifyCode(code, token)
                      .then(function (result) {
                          return client.accountReset(email,
                                     newPassword,
                                     result.accountResetToken);
                        });
              });
    }
  };

  return FxaClientWrapper;
});

