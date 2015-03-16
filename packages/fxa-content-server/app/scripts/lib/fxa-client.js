/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

'use strict';

define([
  'underscore',
  'fxaClient',
  'jquery',
  'lib/xhr',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/constants'
],
function (_, FxaClient, $, xhr, p, Session, AuthErrors, Constants) {
  function trim(str) {
    return $.trim(str);
  }

  function FxaClientWrapper(options) {
    options = options || {};

    this._client = options.client;
    this._signUpResendCount = 0;
    this._passwordResetResendCount = 0;
    this._accountUnlockResendCount = 0;

    if (! this._client && options.authServerUrl) {
      this._client = new FxaClient(options.authServerUrl);
    }
  }

  FxaClientWrapper.prototype = {
    _getClient: function () {
      return p(this._client);
    },

    /**
     * Fetch some entropy from the server
     */
    getRandomBytes: function () {
      return this._getClient()
        .then(function (client) {
          return client.getRandomBytes();
        });
    },

    /**
     * Check the user's current password without affecting session state.
     */
    checkPassword: function (email, password) {
      return this._getClient()
          .then(function (client) {
            return client.signIn(email, password);
          });
    },

    /**
     * Check whether an account exists for the given uid.
     */
    checkAccountExists: function (uid) {
      return this._getClient()
          .then(function (client) {
            return client.accountStatus(uid)
              .then(function (status) {
                return status.exists;
              });
          });
    },

    _getUpdatedSessionData: function (email, relier, accountData, options) {
      var sessionTokenContext = options.sessionTokenContext ||
                                  relier.get('context');

      var updatedSessionData = {
        email: email,
        uid: accountData.uid,
        sessionToken: accountData.sessionToken,
        sessionTokenContext: sessionTokenContext,
        verified: accountData.verified || false
      };

      if (relier.wantsKeys()) {
        updatedSessionData.unwrapBKey = accountData.unwrapBKey;
        updatedSessionData.keyFetchToken = accountData.keyFetchToken;
      }
      if (relier.isSync()) {
        updatedSessionData.customizeSync = options.customizeSync || false;
      }

      return updatedSessionData;
    },


    signIn: function (originalEmail, password, relier, options) {
      var email = trim(originalEmail);
      var self = this;
      options = options || {};

      return self._getClient()
        .then(function (client) {
          return client.signIn(email, password, { keys: relier.wantsKeys() });
        })
        .then(function (accountData) {
          return self._getUpdatedSessionData(email, relier, accountData, options);
        });
    },

    signUp: function (originalEmail, password, relier, options) {
      var email = trim(originalEmail);
      var self = this;
      options = options || {};

      // ensure resend works again
      this._signUpResendCount = 0;

      return self._getClient()
        .then(function (client) {
          var signUpOptions = {
            keys: relier.wantsKeys()
          };

          if (relier.has('service')) {
            signUpOptions.service = relier.get('service');
          }

          if (relier.has('redirectTo')) {
            signUpOptions.redirectTo = relier.get('redirectTo');
          }

          if (relier.has('preVerifyToken')) {
            signUpOptions.preVerifyToken = relier.get('preVerifyToken');
          }

          if (options.preVerified) {
            signUpOptions.preVerified = true;
          }

          signUpOptions.resume = self._createResumeToken(relier);

          return client.signUp(email, password, signUpOptions)
            .then(function (accountData) {
              return self._getUpdatedSessionData(email, relier, accountData, options);
            }, function (err) {
              if (relier.has('preVerifyToken') &&
                  AuthErrors.is(err, 'INVALID_VERIFICATION_CODE')) {
                // The token was invalid and the auth server could
                // not pre-verify the user. Now, just create a new
                // user and force them to verify their email.
                relier.unset('preVerifyToken');

                return self.signUp(email, password, relier, options);
              }

              throw err;
            });
        });
    },

    signUpResend: function (relier, sessionToken) {
      var self = this;
      return this._getClient()
        .then(function (client) {
          if (self._signUpResendCount >= Constants.SIGNUP_RESEND_MAX_TRIES) {
            return p(true);
          }
          self._signUpResendCount++;

          var clientOptions = {
            service: relier.get('service'),
            redirectTo: relier.get('redirectTo'),
            resume: self._createResumeToken(relier)
          };

          return client.recoveryEmailResendCode(sessionToken, clientOptions);
        });
    },

    signOut: function (sessionToken) {
      return this._getClient()
              .then(function (client) {
                return client.sessionDestroy(sessionToken);
              });
    },

    verifyCode: function (uid, code) {
      return this._getClient()
              .then(function (client) {
                return client.verifyCode(uid, code);
              });
    },

    passwordReset: function (originalEmail, relier) {
      var self = this;
      var email = trim(originalEmail);

      // ensure resend works again
      this._passwordResetResendCount = 0;

      return this._getClient()
              .then(function (client) {
                var clientOptions = {
                  service: relier.get('service'),
                  redirectTo: relier.get('redirectTo'),
                  resume: self._createResumeToken(relier)
                };

                return client.passwordForgotSendCode(email, clientOptions);
              })
              .then(function (result) {
                Session.clear();
                return result;
              });
    },

    passwordResetResend: function (originalEmail, passwordForgotToken, relier) {
      var self = this;
      var email = trim(originalEmail);

      return this._getClient()
        .then(function (client) {
          if (self._passwordResetResendCount >= Constants.PASSWORD_RESET_RESEND_MAX_TRIES) {
            return p(true);
          }
          self._passwordResetResendCount++;

          // the linters complain if this is defined in the call to
          // passwordForgotResendCode
          var clientOptions = {
            service: relier.get('service'),
            redirectTo: relier.get('redirectTo'),
            resume: self._createResumeToken(relier)
          };

          return client.passwordForgotResendCode(
                   email,
                   passwordForgotToken,
                   clientOptions
                 );
        });
    },

    completePasswordReset: function (originalEmail, newPassword, token, code) {
      var email = trim(originalEmail);
      var client;

      return this._getClient()
              .then(function (_client) {
                client = _client;
                return client.passwordForgotVerifyCode(code, token);
              })
              .then(function (result) {
                return client.accountReset(email,
                           newPassword,
                           result.accountResetToken);
              });
    },

    isPasswordResetComplete: function (token) {
      return this._getClient()
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

    completeAccountUnlock: function (uid, code) {
      return this._getClient()
        .then(function (client) {
          return client.accountUnlockVerifyCode(uid, code);
        });
    },

    sendAccountUnlockEmail: function (email, relier) {
      var self = this;
      return self._getClient()
        .then(function (client) {
          if (self._accountUnlockResendCount >= Constants.ACCOUNT_UNLOCK_RESEND_MAX_TRIES) {
            return p(true);
          }
          self._accountUnlockResendCount++;

          var clientOptions = {};
          if (relier) {
            clientOptions = {
              service: relier.get('service'),
              redirectTo: relier.get('redirectTo'),
              resume: self._createResumeToken(relier)
            };
          }

          return client.accountUnlockResendCode(email, clientOptions);
        });
    },

    changePassword: function (originalEmail, oldPassword, newPassword) {
      var email = trim(originalEmail);
      return this._getClient()
        .then(function (client) {
          return client.passwordChange(email, oldPassword, newPassword);
        });
    },

    deleteAccount: function (originalEmail, password) {
      var email = trim(originalEmail);
      return this._getClient()
        .then(function (client) {
          return client.accountDestroy(email, password);
        });
    },

    certificateSign: function (pubkey, duration, sessionToken) {
      return this._getClient()
              .then(function (client) {
                return client.certificateSign(
                  sessionToken,
                  pubkey,
                  duration);
              });
    },

    sessionStatus: function (sessionToken) {
      return this._getClient()
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
        .then(function () {
          return true;
        }, function (err) {
          // the only error that we expect is INVALID_TOKEN,
          // rethrow all others.
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return false;
          }

          throw err;
        });
    },

    recoveryEmailStatus: function (sessionToken, uid) {
      var self = this;
      return self._getClient()
        .then(function (client) {
          return client.recoveryEmailStatus(sessionToken);
        })
        .then(null, function (err) {
          // The user's email may have bounced because it's invalid. Check
          // if the account still exists, if it doesn't, it means the email
          // bounced. Show a message allowing the user to sign up again.
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return self.checkAccountExists(uid)
              .then(function (accountExists) {
                if (! accountExists) {
                  throw AuthErrors.toError('SIGNUP_EMAIL_BOUNCE');
                }

                throw err;
              });
          }

          throw err;
        });
    },

    accountKeys: function (keyFetchToken, unwrapBKey) {
      return this._getClient()
        .then(function (client) {
          return client.accountKeys(keyFetchToken, unwrapBKey);
        });
    },

    // The resume token is eventually for post-verification if the
    // user verifies in a second client, with the goal of allowing
    // users to continueback to the original RP.
    _createResumeToken: function (relier) {
      return relier.getResumeToken();
    }
  };

  return FxaClientWrapper;
});

