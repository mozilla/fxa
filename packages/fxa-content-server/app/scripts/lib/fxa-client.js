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

    signIn: function (email, password, customizeSync) {
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
                  sessionToken: accountData.sessionToken,
                  customizeSync: customizeSync
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

    signUp: function (email, password, customizeSync) {
      var self = this;
      var service = Session.service;
      var redirectTo = Session.redirectTo;
      return this._getClientAsync()
              .then(function (client) {
                return client.signUp(email, password, {
                  keys: true,
                  service: service,
                  redirectTo: redirectTo
                });
              })
              .then(function () {
                return self.signIn(email, password, customizeSync);
              })
              .then(function () {
                // signIn clears the Session. Restore service and redirectTo
                // in case the user clicks on the "resend" link and a new
                // email must be sent.
                Session.set({
                  service: service,
                  redirectTo: redirectTo
                });
              });
    },

    signUpResend: function () {
      return this._getClientAsync().then(function (client) {
                return client.recoveryEmailResendCode(
                  Session.sessionToken,
                  {
                    service: Session.service,
                    redirectTo: Session.redirectTo
                  });
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

    passwordReset: function (email) {
      var service = Session.service;
      var redirectTo = Session.redirectTo;

      return this._getClientAsync()
              .then(function (client) {
                return client.passwordForgotSendCode(email, {
                  service: service,
                  redirectTo: redirectTo
                });
              })
              .then(function (result) {
                Session.clear();

                // The user may resend the password reset email, in which case
                // we have to keep around some state so the email can be
                // resent.
                Session.set('service', service);
                Session.set('redirectTo', redirectTo);
                Session.set('email', email);
                Session.set('passwordForgotToken', result.passwordForgotToken);
              });
    },

    passwordResetResend: function () {
      return this._getClientAsync().then(function (client) {
                // the linters complain if this is defined in the call to
                // passwordForgotResendCode
                var options = {
                  service: Session.service,
                  redirectTo: Session.redirectTo
                };
                return client.passwordForgotResendCode(
                            Session.email,
                            Session.passwordForgotToken,
                            options
                );
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
    }

  };

  return FxaClientWrapper;
});

