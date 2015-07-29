/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

define([
  'fxaClient',
  'jquery',
  'lib/constants',
  'lib/promise',
  'lib/session',
  'lib/auth-errors'
],
function (FxaClient, $, Constants, p, Session, AuthErrors) {
  'use strict';

  function trim(str) {
    return $.trim(str);
  }

  // errors from the FxaJSClient must be normalized so that they
  // are translated and reported to metrics correctly.
  function wrapClientToNormalizeErrors(client) {
    var wrappedClient = Object.create(client);

    for (var key in client) {
      if (typeof client[key] === 'function') {
        wrappedClient[key] = function (key) {
          var retval = client[key].apply(this, [].slice.call(arguments, 1));

          // make no assumptions about the client returning a promise.
          // If the return value is not a promise, just return the value.
          if (! retval.then) {
            return retval;
          }

          // a promise was returned, ensure any errors are normalized.
          return retval.then(null, function (err) {
            throw AuthErrors.toError(err);
          });
        }.bind(client, key);
      }
    }

    return wrappedClient;
  }

  function FxaClientWrapper(options) {
    options = options || {};

    var client;

    if (options.client) {
      client = options.client;
    } else if (options.authServerUrl) {
      client = new FxaClient(options.authServerUrl);
    }

    if (client) {
      this._client = wrapClientToNormalizeErrors(client);
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
      var self = this;
      return this._getClient()
        .then(function (client) {
          return client.signIn(email, password, {
            reason: self.SIGNIN_REASON.PASSWORD_CHECK
          })
          .then(function (sessionInfo) {
            // a session was created on the backend to check the user's
            // password. Delete the newly created session immediately
            // so that the session token is not left in the database.
            if (sessionInfo && sessionInfo.sessionToken) {
              return client.sessionDestroy(sessionInfo.sessionToken);
            }
          });
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
      var sessionTokenContext = options.sessionTokenContext;
      if (! sessionTokenContext && relier.isSync()) {
        sessionTokenContext = Constants.SESSION_TOKEN_USED_FOR_SYNC;
      }

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


    /**
     * Signin reasons are indicators to the backend that the signin
     * is to complete a particular action. The backend can choose
     * to perform actions, e.g., send emails, based on the reason.
     */
    SIGNIN_REASON: {
      SIGN_IN: 'signin',
      PASSWORD_CHECK: 'password_check',
      PASSWORD_CHANGE: 'password_change',
      PASSWORD_RESET: 'password_reset',
      ACCOUNT_UNLOCK: 'account_unlock'
    },

    /**
     * Authenticate a user.
     *
     * @method signIn
     * @param {String} originalEmail
     * @param {String} password
     * @param {Releir} relier
     * @param {Object} [options]
     *   @param {String} [options.reason] - reason for the sign in. Can be
     *                   one of the values defined in SIGNIN_REASON.
     *                   Defaults to SIGNIN_REASON.SIGN_IN.
     *   @param {Boolean} [options.customizeSync] - If the relier is Sync,
     *                   whether the user wants to customize which items will
     *                   be synced. Defaults to `false`
     *   @param {String} [options.sessionTokenContext] - The context for which
     *                   the session token is being created. Defaults to the
     *                   relier's context.
     */
    signIn: function (originalEmail, password, relier, options) {
      var email = trim(originalEmail);
      var self = this;
      options = options || {};

      return self._getClient()
        .then(function (client) {
          var signInOptions = {
            keys: relier.wantsKeys(),
            reason: options.reason || self.SIGNIN_REASON.SIGN_IN
          };

          // `service` is sent on signIn to notify users when a new service
          // has been attached to their account.
          if (relier.has('service')) {
            signInOptions.service = relier.get('service');
          }

          return client.signIn(email, password, signInOptions);
        })
        .then(function (accountData) {
          return self._getUpdatedSessionData(email, relier, accountData, options);
        });
    },

    signUp: function (originalEmail, password, relier, options) {
      var email = trim(originalEmail);
      var self = this;
      options = options || {};

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

          if (options.resume) {
            signUpOptions.resume = options.resume;
          }

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

    signUpResend: function (relier, sessionToken, options) {
      options = options || {};

      return this._getClient()
        .then(function (client) {
          var clientOptions = {
            service: relier.get('service'),
            redirectTo: relier.get('redirectTo')
          };

          if (options.resume) {
            clientOptions.resume = options.resume;
          }

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

    passwordReset: function (originalEmail, relier, options) {
      var email = trim(originalEmail);
      options = options || {};

      return this._getClient()
        .then(function (client) {
          var clientOptions = {
            service: relier.get('service'),
            redirectTo: relier.get('redirectTo')
          };

          if (options.resume) {
            clientOptions.resume = options.resume;
          }

          return client.passwordForgotSendCode(email, clientOptions);
        })
        .then(function (result) {
          Session.clear();
          return result;
        });
    },

    passwordResetResend: function (originalEmail, passwordForgotToken, relier, options) {
      var email = trim(originalEmail);
      options = options || {};

      return this._getClient()
        .then(function (client) {
          // the linters complain if this is defined in the call to
          // passwordForgotResendCode
          var clientOptions = {
            service: relier.get('service'),
            redirectTo: relier.get('redirectTo')
          };

          if (options.resume) {
            clientOptions.resume = options.resume;
          }

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

    sendAccountUnlockEmail: function (originalEmail, relier, options) {
      var self = this;
      var email = trim(originalEmail);
      options = options || {};

      return self._getClient()
        .then(function (client) {
          var clientOptions = {};
          if (relier) {
            clientOptions = {
              service: relier.get('service'),
              redirectTo: relier.get('redirectTo')
            };
          }

          if (options.resume) {
            clientOptions.resume = options.resume;
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
    }
  };

  return FxaClientWrapper;
});

