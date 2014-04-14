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
  'lib/auth-errors',
  'lib/constants'
],
function (FxaClient, $, p, Session, AuthErrors, Constants) {
  var client;

  /**
   * NOTE: Views create their own FxaClientWrapper. These are
   * kept as global state so the counts are shared across wrappers.
   * The counts can be reset by calling `FxaClientWrapper.testClear();`
   */
  var signUpResendCount = 0;
  var passwordResetResendCount = 0;

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
    // If there exists a channel, this will send a message over the channel to determine
    // whether we should cancel the login to sync or not based on Desktop specific
    // checks and dialogs. It throws an error with message='USER_CANCELED_LOGIN' and
    // errno=1001 if that's the case.
    _checkForDesktopSyncRelinkWarning: function (email) {
      var defer = p.defer();
      if (Session.channel) {
        Session.channel.send('can_link_account', { email: email }, function (err, response) {
          if (err) {
            console.error('_checkForDesktopSyncRelinkWarning failed with', err);
            // If the browser doesn't implement this command, then it will handle
            // prompting the relink warning after sign in completes. This can likely
            // be changed to 'reject' after Fx31 hits nightly, because all browsers
            // will likely support 'can_link_account'
            defer.resolve();
          } else {
            if (response && response.data && !response.data.ok) {
              var errorMessage = 'USER_CANCELED_LOGIN';
              var error = new Error(errorMessage);
              error.errno = AuthErrors.toCode(errorMessage);
              defer.reject(error);
            } else {
              defer.resolve();
            }
          }
        });
      } else {
        // if no channel to desktop, there's nothing to check
        defer.resolve();
      }
      return defer.promise;
    },

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

      // Protip: add `.delay(msToDelay)` to do a dirty
      // synthication of server lag for manual testing.
      return defer.promise;
    },

    signIn: function (originalEmail, password, options) {
      var email = trim(originalEmail);
      var self = this;
      options = options || {};

      // dummy promise to allow us to branch
      var defer = p.defer();
      defer.resolve();

      return defer.promise
              .then(function() {
                // If we already verified in signUp that we can link with
                // the desktop, don't do it again. Otherwise,
                // make the call over to the Desktop code to ask if
                // we can allow the linking.
                if (!options.verifiedCanLinkAccount) {
                  return self._checkForDesktopSyncRelinkWarning(email);
                }
                return;
              })
              .then(self._getClientAsync)
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
                  customizeSync: options.customizeSync
                };

                Session.set(updatedSessionData);
                if (Session.channel) {
                  var defer = p.defer();
                  // Skipping the relink warning is only relevant to the channel
                  // communication with the Desktop browser. It may have been
                  // done during a sign up flow.
                  updatedSessionData.verifiedCanLinkAccount = true;
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
      // ensure resend works again
      signUpResendCount = 0;

      // We need to check for the relink warning here *before*
      // we do the account creation. Otherwise, the user may
      // cancel later in the relink warning during sign in,
      // but still have an account created for her.
      return this._checkForDesktopSyncRelinkWarning(email)
              .then(this._getClientAsync)
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

                if (err instanceof Error) {
                  throw err;
                } else {
                  throw new Error(err);
                }
              })
              .then(function () {
                var signInOptions = {
                  customizeSync: options.customizeSync,
                  verifiedCanLinkAccount: true // skip the warning, beacuse we already triggered it above
                };
                return self.signIn(email, password, signInOptions);
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
      return this._getClientAsync()
        .then(function (client) {
          if (signUpResendCount >= Constants.SIGNUP_RESEND_MAX_TRIES) {
            var defer = p.defer();
            defer.resolve(true);
            return defer.promise;
          } else {
            signUpResendCount++;
          }

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

      // ensure resend works again
      passwordResetResendCount = 0;

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
      return this._getClientAsync()
        .then(function (client) {
          if (passwordResetResendCount >= Constants.PASSWORD_RESET_RESEND_MAX_TRIES) {
            var defer = p.defer();
            defer.resolve(true);
            return defer.promise;
          } else {
            passwordResetResendCount++;
          }
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

    isPasswordResetComplete: function () {
      var token = Session.passwordForgotToken;
      return this._getClientAsync()
        .then(function (client) {
          return client.passwordForgotStatus(token);
        })
        .then(function () {
          // if the request succeeds, the password reset hasn't completed
          return false;
        }, function (err) {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return true;
          }
          throw err;
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
    },

    sessionStatus: function (sessionToken) {
      return this._getClientAsync()
              .then(function (client) {
                return client.sessionStatus(sessionToken);
              });
    },

    isSignedIn: function (sessionToken) {
      // Check if the user is signed in.
      if (! sessionToken) {
        return p(false);
      }

        // Validate session token
      return this.sessionStatus(sessionToken)
        .then(function() {
          return true;
        }, function(err) {
          // the only error that we expect is INVALID_TOKEN,
          // rethrow all others.
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return false;
          }

          throw err;
        });
    }
  };

  /**
   * Reset global state - for testing.
   * @method testClear
   */
  FxaClientWrapper.testClear = function () {
    signUpResendCount = 0;
    passwordResetResendCount = 0;
  };

  return FxaClientWrapper;
});

