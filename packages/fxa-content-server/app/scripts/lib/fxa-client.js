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
  'p-promise',
  'lib/session',
  'lib/auth-errors'
],
function (FxaClient, $, p, Session, AuthErrors) {
  var client;

  // IE 8 doesn't support String.prototype.trim
  function trim(str) {
    return str && str.replace(/^\s+|\s+$/g, '');
  }

  function FxaClientWrapper(options) {
    options = options || {};
    // IE uses navigator.browserLanguage, all others user navigator.language.
    var language = options.language ||
                   navigator.browserLanguage ||
                   navigator.language;
    this.language = language;
  }

  FxaClientWrapper.prototype = {
    _getClientAsync: function () {
      var defer = p.defer();

      if (client) {
        defer.resolve(client);
      } else if (Session.config && Session.config.fxaccountUrl) {
        client = new FxaClient(Session.config.fxaccountUrl);
        defer.resolve(client);
      } else {
        $.getJSON('/config', function (data) {
          client = new FxaClient(data.fxaccountUrl);
          defer.resolve(client);
        });
      }

      return defer.promise;
    },

    signIn: function (originalEmail, password, customizeSync) {
      var email = trim(originalEmail);
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
                  sessionTokenContext: Session.context,
                  customizeSync: customizeSync
                };

                Session.set(updatedSessionData);
                if (Session.channel) {
                  var defer = p.defer();
                  Session.channel.send('login', updatedSessionData, function (err) {
                    if (err) {
                      defer.reject(err);
                    } else {
                      defer.resolve(accountData);
                    }
                  });
                  return defer.promise;
                } else if (window.console && window.console.warn) {
                  console.warn('Session.channel does not exist');
                }

                return accountData;
              });

    },

    signUp: function (originalEmail, password, options) {
      options = options || {};
      var email = trim(originalEmail);
      var self = this;
      var service = Session.service;
      var redirectTo = Session.redirectTo;
      return this._getClientAsync()
              .then(function (client) {
                var signUpOptions = {
                  keys: true,
                  service: service,
                  redirectTo: redirectTo,
                  lang: self.language
                };

                if (options.preVerified) {
                  signUpOptions.preVerified = true;
                }

                return client.signUp(email, password, signUpOptions);
              })
              .then(null, function (err) {
                // if the account already exists, swallow the error and
                // attempt to sign the user in instead.
                if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
                  return;
                }

                throw err;
              })
              .then(function () {
                return self.signIn(email, password, options.customizeSync);
              })
              .then(function (accountData) {
                // signIn clears the Session. Restore service and redirectTo
                // in case the user clicks on the "resend" link and a new
                // email must be sent.
                Session.set({
                  service: service,
                  redirectTo: redirectTo
                });

                return accountData;
              });
    },

    signUpResend: function () {
      var self = this;
      return this._getClientAsync().then(function (client) {
                return client.recoveryEmailResendCode(
                  Session.sessionToken,
                  {
                    service: Session.service,
                    redirectTo: Session.redirectTo,
                    lang: self.language
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
              }, function () {
                // Clear the session, even on failure. Everything is A-OK.
                // See issue #616
                // - https://github.com/mozilla/fxa-content-server/issues/616
                Session.clear();
              });
    },

    verifyCode: function (uid, code) {
      return this._getClientAsync()
              .then(function (client) {
                return client.verifyCode(uid, code);
              });
    },

    passwordReset: function (originalEmail) {
      var self = this;
      var service = Session.service;
      var redirectTo = Session.redirectTo;
      var email = trim(originalEmail);

      return this._getClientAsync()
              .then(function (client) {
                return client.passwordForgotSendCode(email, {
                  service: service,
                  redirectTo: redirectTo,
                  lang: self.language
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
      var self = this;
      return this._getClientAsync().then(function (client) {
                // the linters complain if this is defined in the call to
                // passwordForgotResendCode
                var options = {
                  service: Session.service,
                  redirectTo: Session.redirectTo,
                  lang: self.language
                };
                return client.passwordForgotResendCode(
                            Session.email,
                            Session.passwordForgotToken,
                            options
                );
              });
    },

    completePasswordReset: function (originalEmail, newPassword, token, code) {
      var email = trim(originalEmail);
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

    changePassword: function (originalEmail, oldPassword, newPassword) {
      var email = trim(originalEmail);
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

    deleteAccount: function (originalEmail, password) {
      var email = trim(originalEmail);
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

