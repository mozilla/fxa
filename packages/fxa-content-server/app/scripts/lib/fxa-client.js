/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var Constants = require('lib/constants');
  var p = require('lib/promise');
  var requireOnDemand = require('lib/require-on-demand');
  var Session = require('lib/session');
  var SignInReasons = require('lib/sign-in-reasons');
  var VerificationReasons = require('lib/verification-reasons');
  var VerificationMethods = require('lib/verification-methods');

  function trim(str) {
    return $.trim(str);
  }

  const CONTEXTS_REQUIRE_KEYS = [
    Constants.IFRAME_CONTEXT,
    // allow fx_desktop_v1, many users signed up using
    // the old context and are now using a newer version
    // of Firefox that accepts WebChannel messages.
    Constants.FX_DESKTOP_V1_CONTEXT,
    Constants.FX_DESKTOP_V2_CONTEXT,
    Constants.FX_DESKTOP_V3_CONTEXT,
    Constants.FX_FENNEC_V1_CONTEXT,
    Constants.FX_FIRSTRUN_V2_CONTEXT,
    // ios uses the old CustomEvents and cannot accept WebChannel messages
  ];

  /**
   * Check if keys should be requested
   * @param {object} relier - relier being signed in to.
   * @param {string} sessionTokenContext - context of the current session
   * token.
   * @returns {Boolean}
   */
  function wantsKeys(relier, sessionTokenContext) {
    return relier.wantsKeys() ||
           _.contains(CONTEXTS_REQUIRE_KEYS, sessionTokenContext);
  }

  // errors from the FxaJSClient must be normalized so that they
  // are translated and reported to metrics correctly.
  function wrapClientToNormalizeErrors(client) {
    var wrappedClient = Object.create(client);

    for (var key in client) {
      if (typeof client[key] === 'function') {
        wrappedClient[key] = function (key, ...args) {
          var retval = this[key].apply(this, args);

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


  // Class method decorator to get an fxa-js-client instance and pass
  // it as the first argument to the method.
  function withClient(callback) {
    return function (...args) {
      return this._getClient()
        .then((client) => callback.apply(this, [client, ...args]));
    };
  }

  function getUpdatedSessionData(email, relier, accountData, options = {}) {
    var sessionTokenContext = options.sessionTokenContext;
    if (! sessionTokenContext && relier.isSync()) {
      sessionTokenContext = Constants.SESSION_TOKEN_USED_FOR_SYNC;
    }

    var updatedSessionData = {
      email: email,
      sessionToken: accountData.sessionToken,
      sessionTokenContext: sessionTokenContext,
      uid: accountData.uid,
      verificationMethod: accountData.verificationMethod,
      verificationReason: accountData.verificationReason,
      verified: accountData.verified || false
    };

    if (wantsKeys(relier, sessionTokenContext)) {
      updatedSessionData.unwrapBKey = accountData.unwrapBKey;
      updatedSessionData.keyFetchToken = accountData.keyFetchToken;
    }

    if (relier.isSync()) {
      updatedSessionData.customizeSync = options.customizeSync || false;
    }

    return updatedSessionData;
  }


  function FxaClientWrapper(options = {}) {
    if (options.client) {
      this._client = wrapClientToNormalizeErrors(options.client);
    } else if (options.authServerUrl) {
      this._authServerUrl = options.authServerUrl;
    }
  }

  FxaClientWrapper.prototype = {
    _getClient: function () {
      if (this._client) {
        return p(this._client);
      }

      return requireOnDemand('fxaClient')
        .then((FxaClient) => {
          const client = new FxaClient(this._authServerUrl);
          this._client = wrapClientToNormalizeErrors(client);
          return this._client;
        });
    },

    /**
     * Fetch some entropy from the server
     *
     * @returns {Promise}
     */
    getRandomBytes: withClient((client) => {
      return client.getRandomBytes();
    }),

    /**
     * Check the user's current password without affecting session state.
     *
     * @param {String} email
     * @param {String} password
     * @returns {Promise}
     */
    checkPassword: withClient((client, email, password) => {
      return client.signIn(email, password, {
        reason: SignInReasons.PASSWORD_CHECK
      })
      .then(function (sessionInfo) {
        // a session was created on the backend to check the user's
        // password. Delete the newly created session immediately
        // so that the session token is not left in the database.
        if (sessionInfo && sessionInfo.sessionToken) {
          return client.sessionDestroy(sessionInfo.sessionToken);
        }
      });
    }),

    /**
     * Check whether an account exists for the given uid.
     *
     * @param {String} uid
     * @returns {Promise}
     */
    checkAccountExists: withClient((client, uid) => {
      return client.accountStatus(uid)
        .then(function (status) {
          return status.exists;
        });
    }),

    /**
     * Check whether an account exists for the given email.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    checkAccountExistsByEmail: withClient((client, email) => {
      return client.accountStatusByEmail(email)
        .then(function (status) {
          return status.exists;
        });
    }),

    /**
     * Authenticate a user.
     *
     * @method signIn
     * @param {String} originalEmail
     * @param {String} password
     * @param {Relier} relier
     * @param {Object} [options]
     *   @param {Boolean} [options.customizeSync] - If the relier is Sync,
     *                   whether the user wants to customize which items will
     *                   be synced. Defaults to `false`
     *   @param {String} [options.metricsContext] - context metadata for use in
     *                   flow events
     *   @param {String} [options.reason] - Reason for the sign in. See definitons
     *                   in sign-in-reasons.js. Defaults to SIGN_IN_REASONS.SIGN_IN.
     *   @param {String} [options.resume] - Resume token, passed in the
     *                   verification link if the user must verify their email.
     *   @param {String} [options.sessionTokenContext] - The context for which
     *                   the session token is being created. Defaults to the
     *                   relier's context.
     * @returns {Promise}
     */
    signIn: withClient((client, originalEmail, password, relier, options = {}) => {
      var email = trim(originalEmail);

      var signInOptions = {
        keys: wantsKeys(relier),
        reason: options.reason || SignInReasons.SIGN_IN
      };

      // `service` is sent on signIn to notify users when a new service
      // has been attached to their account.
      if (relier.has('service')) {
        signInOptions.service = relier.get('service');
      }

      if (relier.has('redirectTo')) {
        signInOptions.redirectTo = relier.get('redirectTo');
      }

      if (options.resume) {
        signInOptions.resume = options.resume;
      }

      setMetricsContext(signInOptions, options);

      return client.signIn(email, password, signInOptions)
        .then(function (accountData) {
          if (! accountData.verified &&
              ! accountData.hasOwnProperty('verificationReason')) {
            // Set a default verificationReason to `SIGN_UP` to allow
            // staged rollouts of servers. To handle calls to the
            // legacy /account/login that lacks a verificationReason,
            // assume SIGN_UP if the account is not verified.
            accountData.verificationReason = VerificationReasons.SIGN_UP;
            accountData.verificationMethod = VerificationMethods.EMAIL;
          }

          return getUpdatedSessionData(email, relier, accountData, options);
        });
    }),

    /**
     * Sign up a user
     *
     * @method signUp
     * @param {String} originalEmail
     * @param {String} password
     * @param {Relier} relier
     * @param {Object} [options]
     *   @param {Boolean} [options.customizeSync] - If the relier is Sync,
     *                    whether the user wants to customize which items
     *                    will be synced. Defaults to `false`
     *   @param {String} [options.metricsContext] - Metrics context metadata
     *   @param {Boolean} [options.preVerified] - is the user preVerified
     *   @param {String} [options.resume] - Resume token, passed in the
     *                   verification link if the user must verify
     *                   their email.
     *   @param {String} [options.sessionTokenContext] - The context for
     *                   which the session token is being created.
     *                   Defaults to the relier's context.
     * @returns {Promise}
     */
    signUp: withClient(function (client, originalEmail, password, relier, options = {}) {
      var email = trim(originalEmail);
      var self = this;

      var signUpOptions = {
        keys: wantsKeys(relier)
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

      setMetricsContext(signUpOptions, options);

      return client.signUp(email, password, signUpOptions)
        .then(function (accountData) {
          return getUpdatedSessionData(email, relier, accountData, options);
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
    }),

    signUpResend: withClient((client, relier, sessionToken, options = {}) => {
      var clientOptions = {
        redirectTo: relier.get('redirectTo'),
        service: relier.get('service')
      };

      if (options.resume) {
        clientOptions.resume = options.resume;
      }

      return client.recoveryEmailResendCode(sessionToken, clientOptions);
    }),

    signOut: withClient((client, sessionToken) => {
      return client.sessionDestroy(sessionToken);
    }),

    verifyCode: withClient((client, uid, code, options) => {
      return client.verifyCode(uid, code, options);
    }),

    /**
     * Initiate a password reset
     *
     * @method signUp
     * @param {String} originalEmail
     * @param {Relier} relier
     * @param {Object} [options]
     *   @param {String} [options.resume] - Resume token, passed in the
     *                   verification link if the user must verify their email.
     *   @param {Boolean} [options.customizeSync] - If the relier is Sync,
     *                   whether the user wants to customize which items will
     *                   be synced. Defaults to `false`
     * @returns {Promise}
     */
    passwordReset: withClient((client, originalEmail, relier, options = {}) => {
      var email = trim(originalEmail);

      var clientOptions = {
        redirectTo: relier.get('redirectTo'),
        service: relier.get('service')
      };

      if (options.resume) {
        clientOptions.resume = options.resume;
      }

      return client.passwordForgotSendCode(email, clientOptions)
        .then(function (result) {
          Session.clear();
          return result;
        });
    }),

    passwordResetResend: withClient((client, originalEmail, passwordForgotToken, relier, options = {}) => {
      var email = trim(originalEmail);

      // the linters complain if this is defined in the call to
      // passwordForgotResendCode
      var clientOptions = {
        redirectTo: relier.get('redirectTo'),
        service: relier.get('service')
      };

      if (options.resume) {
        clientOptions.resume = options.resume;
      }

      return client.passwordForgotResendCode(
        email,
        passwordForgotToken,
        clientOptions
      );
    }),

    completePasswordReset: withClient((client, originalEmail, newPassword, token, code, relier) => {
      const email = trim(originalEmail);

      return client.passwordForgotVerifyCode(code, token)
        .then(result => {
          return client.accountReset(email,
            newPassword,
            result.accountResetToken,
            {
              keys: wantsKeys(relier),
              sessionToken: true
            }
          );
        })
        .then(accountData => {
          return getUpdatedSessionData(email, relier, accountData);
        });
    }),

    isPasswordResetComplete: withClient((client, token) => {
      return client.passwordForgotStatus(token)
        .then(function () {
          // if the request succeeds, the password reset hasn't completed
          return false;
        }, function (err) {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return true;
          }
          throw err;
        });
    }),

    /**
     * Change the user's password
     *
     * @param {String} originalEmail
     * @param {String} oldPassword
     * @param {String} newPassword
     * @param {String} sessionToken
     * @param {String} sessionTokenContext
     * @param {Relier} relier
     * @returns {Promise} resolves with new session information on success.
     */
    changePassword: withClient((client, originalEmail, oldPassword, newPassword, sessionToken, sessionTokenContext, relier) => {
      var email = trim(originalEmail);
      return client.passwordChange(
        email,
        oldPassword,
        newPassword,
        {
          keys: wantsKeys(relier, sessionTokenContext),
          sessionToken: sessionToken
        }
      )
      .then((accountData = {}) => {
        return getUpdatedSessionData(email, relier, accountData, {
          sessionTokenContext: sessionTokenContext
        });
      });
    }),

    deleteAccount: withClient((client, originalEmail, password) => {
      var email = trim(originalEmail);
      return client.accountDestroy(email, password);
    }),

    certificateSign: withClient((client, pubkey, duration, sessionToken) => {
      return client.certificateSign(
        sessionToken,
        pubkey,
        duration,
        {
          service: Constants.CONTENT_SERVER_SERVICE
        }
      );
    }),

    sessionStatus: withClient((client, sessionToken) => {
      return client.sessionStatus(sessionToken);
    }),

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

    /**
     * Check the status of the sessionToken. Status information
     * includes whether the session is verified, and if not, the reason
     * it must be verified and by which method.
     *
     * @param {string} sessionToken
     * @param {string} [uid]
     * @returns {promise} resolves with the account's current session
     * information if session is valid. Rejects with an INVALID_TOKEN error
     * if session is invalid.
     *
     * Session information:
     * {
     *   verified: <boolean>
     *   verificationMethod: <see lib/verification-methods.js>
     *   verificationReason: <see lib/verification-reasons.js>
     * }
     */
    recoveryEmailStatus: withClient(function (client, sessionToken, uid) {
      var self = this;
      return client.recoveryEmailStatus(sessionToken)
        .then(function (response) {
          if (! response.verified) {
            // This is a little bit unnatural. /recovery_email/status
            // returns two fields, `emailVerified` and
            // `sessionVerified`. The client side depends on a reason
            // to show the correct UI. Convert `emailVerified` to
            // a `verificationReason`.
            var verificationReason = response.emailVerified ?
                                     VerificationReasons.SIGN_IN :
                                     VerificationReasons.SIGN_UP;
            return {
              email: response.email,
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: verificationReason,
              verified: false
            };
          }

          // /recovery_email/status returns `emailVerified` and
          // `sessionVerified`, we don't want those.
          return _.pick(response, 'email', 'verified');
        })
        .fail(function (err) {
          // The user's email may have bounced because it's invalid. Check
          // if the account still exists, if it doesn't, it means the email
          // bounced. Show a message allowing the user to sign up again.
          if (uid && AuthErrors.is(err, 'INVALID_TOKEN')) {
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
    }),

    accountKeys: withClient((client, keyFetchToken, unwrapBKey) => {
      return client.accountKeys(keyFetchToken, unwrapBKey);
    }),

    deviceList: withClient((client, sessionToken) => {
      return client.deviceList(sessionToken);
    }),

    deviceDestroy: withClient((client, sessionToken, deviceId) => {
      return client.deviceDestroy(sessionToken, deviceId);
    })
  };

  module.exports = FxaClientWrapper;

  function setMetricsContext (serverOptions, options) {
    if (options.metricsContext) {
      serverOptions.metricsContext = options.metricsContext;
    }
  }
});

