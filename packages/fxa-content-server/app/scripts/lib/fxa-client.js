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
      var defer = $.Deferred();

      this._getAsync()
        .then(function (client) {
            callback(client, defer);
          }, defer.reject);

      return defer.promise();
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
      return this._withClient(function (client, defer) {
                client.signIn(email, password, { keys: true })
                     .then(defer.resolve, defer.reject);
              });
    },

    signUp: function (email, password) {
      // this jankiness is to appease JSHint
      function signUp(client, defer) {

        function signIn() {
          client.signIn(email, password, { keys: true })
                .then(defer.resolve, defer.reject);
        }

        client.signUp(email, password, { keys: true })
               .then(signIn, defer.reject);

      }
      return this._withClient(signUp);
    },

    verifyCode: function (uid, code) {
      return this._withClient(function (client, defer) {
                client.verifyCode(uid, code)
                       .then(defer.resolve, defer.reject);
              });
    },

    requestPasswordReset: function (email) {
      return this._withClient(function (client, defer) {
                client.passwordForgotSendCode(email)
                      .then(defer.resolve, defer.reject);
              });
    },

    completePasswordReset: function (email, newPassword, token, code) {
      return this._withClient(function (client, defer) {
                client.passwordForgotVerifyCode(code, token)
                      .then(function (result) {
                          client.accountReset(email,
                                     newPassword,
                                     result.accountResetToken)
                          .then(defer.resolve, defer.reject);
                        }, defer.reject);
              });
    }
  };

  return FxaClientWrapper;
});

