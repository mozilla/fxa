/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const $ = require('jquery');
  const AuthErrors = require('lib/auth-errors');
  const Constants = require('lib/constants');
  const p = require('lib/promise');
  const requireOnDemand = require('lib/require-on-demand');
  const Session = require('lib/session');
  const SignInReasons = require('lib/sign-in-reasons');
  const SmsErrors = require('lib/sms-errors');
  const VerificationReasons = require('lib/verification-reasons');
  const VerificationMethods = require('lib/verification-methods');

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
   * @param {Object} relier - relier being signed in to.
   * @param {String} sessionTokenContext - context of the current session
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
    _getClient () {
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
     *   @param {String} [options.reason] - Reason for the sign in. See definitions
     *                   in sign-in-reasons.js. Defaults to SIGN_IN_REASONS.SIGN_IN.
     *   @param {String} [options.resume] - Resume token, passed in the
     *                   verification link if the user must verify their email.
     *   @param {String} [options.sessionTokenContext] - The context for which
     *                   the session token is being created. Defaults to the
     *                   relier's context.
     *   @param {Boolean} [options.skipCaseError] - if set to true, INCCORECT_EMAIL_CASE
     *                   errors will be returned to be handled locally instead of automatically
     *                   being retried in the fxa-js-client.
     *   @param {String} [options.unblockCode] - Unblock code.
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

      if (options.unblockCode) {
        signInOptions.unblockCode = options.unblockCode;
      }

      if (options.resume) {
        signInOptions.resume = options.resume;
      }

      if (options.skipCaseError) {
        signInOptions.skipCaseError = options.skipCaseError;
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

      var signUpOptions = {
        keys: wantsKeys(relier)
      };

      if (relier.has('service')) {
        signUpOptions.service = relier.get('service');
      }

      if (relier.has('redirectTo')) {
        signUpOptions.redirectTo = relier.get('redirectTo');
      }

      if (options.preVerified) {
        signUpOptions.preVerified = true;
      }

      if (options.resume) {
        signUpOptions.resume = options.resume;
      }

      setMetricsContext(signUpOptions, options);

      return client.signUp(email, password, signUpOptions)
        .then((accountData) => getUpdatedSessionData(email, relier, accountData, options));
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

    /**
     * Destroy the user's current or custom session
     *
     * @method sessionDestroy
     * @param {String} sessionToken
     * @param {Object} [options]
     *   @param {String} [options.customSessionToken] - if provided, deletes a custom session token
     * @returns {Promise}
     *
     */
    sessionDestroy: withClient((client, sessionToken, options = {}) => {
      return client.sessionDestroy(sessionToken, options);
    }),

    verifyCode: withClient((client, uid, code, options) => {
      return client.verifyCode(uid, code, options);
    }),

    /**
     * Initiate a password reset
     *
     * @method passwordReset
     * @param {String} originalEmail
     * @param {Relier} relier
     * @param {Object} [options]
     *   @param {String} [options.metricsContext] - context metadata for use in
     *                   flow events
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

      setMetricsContext(clientOptions, options);

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

      setMetricsContext(clientOptions, options);

      return client.passwordForgotResendCode(
        email,
        passwordForgotToken,
        clientOptions
      );
    }),

    completePasswordReset: withClient((client, originalEmail, newPassword, token, code, relier, options = {}) => {
      const email = trim(originalEmail);

      var accountResetOptions = {
        keys: wantsKeys(relier),
        sessionToken: true
      };
      setMetricsContext(accountResetOptions, options);

      var passwordVerifyCodeOptions = {};
      setMetricsContext(passwordVerifyCodeOptions, options);

      return client.passwordForgotVerifyCode(code, token, passwordVerifyCodeOptions)
        .then(result => {
          return client.accountReset(email,
            newPassword,
            result.accountResetToken,
            accountResetOptions
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

    certificateSign: withClient((client, pubkey, duration, sessionToken, service) => {
      return client.certificateSign(
        sessionToken,
        pubkey,
        duration,
        {
          service: service || Constants.CONTENT_SERVER_SERVICE
        }
      );
    }),

    sessionStatus: withClient((client, sessionToken) => {
      return client.sessionStatus(sessionToken);
    }),

    isSignedIn (sessionToken) {
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
     * @param {String} sessionToken
     * @returns {Promise} resolves with the account's current session
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
    recoveryEmailStatus: withClient(function (client, sessionToken) {
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
        });
    }),

    /**
     * This function gets the status of the user's sessionToken.
     * It differs from `recoveryEmailStatus` because it also returns
     * `sessionVerified`, which gives the true state of the sessionToken.
     *
     * Note that a session is considered verified if it has gone through
     * an email verification loop.
     *
     * @param {String} sessionToken
     * @returns {Promise} resolves with response when complete.
     */
    sessionVerificationStatus: withClient(function (client, sessionToken) {
      return client.recoveryEmailStatus(sessionToken);
    }),

    accountKeys: withClient((client, keyFetchToken, unwrapBKey) => {
      return client.accountKeys(keyFetchToken, unwrapBKey);
    }),

    deviceList: withClient((client, sessionToken) => {
      return client.deviceList(sessionToken);
    }),

    /**
     * Get user's sessions
     *
     * @param {String} sessionToken
     * @returns {Promise} resolves with response when complete.
     */
    sessions: withClient((client, sessionToken) => {
      return client.sessions(sessionToken);
    }),

    deviceDestroy: withClient((client, sessionToken, deviceId) => {
      return client.deviceDestroy(sessionToken, deviceId);
    }),

    /**
     * Send an unblock email.
     *
     * @param {String} email - destination email address
     * @param {Object} [options] - options
     *   @param {String} [options.metricsContext] - context metadata for use in
     *                   flow events
     * @returns {Promise} resolves with response when complete.
     */
    sendUnblockEmail: withClient((client, email, options = {}) => {
      const sendUnblockCodeOptions = {};

      setMetricsContext(sendUnblockCodeOptions, options);

      return client.sendUnblockCode(email, sendUnblockCodeOptions);
    }),

    /**
     * Reject an unblock code.
     *
     * @param {String} uid - user id
     * @param {String} unblockCode - unblock code
     * @returns {Promise} resolves when complete.
     */
    rejectUnblockCode: withClient((client, uid, unblockCode) => {
      return client.rejectUnblockCode(uid, unblockCode);
    }),

    /**
     * Send an SMS
     *
     * @param {String} sessionToken - account session token.
     * @param {String} phoneNumber - target phone number. Expected to have
     *   a country code prefix, e.g., +1, +44.
     * @param {Number} messageId - ID of message to send.
     * @param {Object} [options]
     *   @param {String} [options.metricsContext] - context metadata for use in
     *                   flow events
     * @returns {Promise}
     */
    sendSms: withClient((client, sessionToken, phoneNumber, messageId, options = {}) => {
      return client.sendSms(sessionToken, phoneNumber, messageId, options)
        .fail((err) => {

          function isInvalidPhoneNumberError (err) {
            // If the number fails joi validation, the error
            // returns in this format.
            return AuthErrors.is(err, 'INVALID_PARAMETER') &&
                   err.validation &&
                   err.validation.keys &&
                   err.validation.keys[0] === 'phoneNumber';
          }

          if (AuthErrors.is(err, 'SMS_REJECTED')) {
            // reasonCode comes back as a string. We need an integer.
            throw SmsErrors.toError(parseInt(err.reasonCode, 10));
          } else if (isInvalidPhoneNumberError(err)) {
            throw AuthErrors.toError('INVALID_PHONE_NUMBER');
          }

          throw err;
        });
    }),

    recoveryEmails: withClient((client, sessionToken) => {
      return client.recoveryEmails(sessionToken);
    }),

    recoveryEmailCreate: withClient((client, sessionToken, email) => {
      return client.recoveryEmailCreate(sessionToken, email);
    }),

    recoveryEmailDestroy: withClient((client, sessionToken, email) => {
      return client.recoveryEmailDestroy(sessionToken, email);
    }),

    resendEmailCode: withClient((client, sessionToken, email) => {
      return client.recoveryEmailResendCode(sessionToken, {email: email});
    }),

    /**
     * Check whether SMS is enabled for the user
     *
     * @param {String} sessionToken
     * @param {Object} [options={}] options
     *   @param {String} [options.country] country code to force for testing.
     * @returns {Promise} resolves to an object with:
     *   * {Boolean} ok - true if user can send an SMS
     *   * {String} country - user's country
     */
    smsStatus: withClient((client, sessionToken, options) => {
      return client.smsStatus(sessionToken, options);
    }),

    deleteEmail: withClient((client, sessionToken, email) => {
      return client.deleteEmail(sessionToken, email);
    })
  };

  module.exports = FxaClientWrapper;

  function setMetricsContext (serverOptions, options) {
    if (options.metricsContext) {
      serverOptions.metricsContext = options.metricsContext;
    }
  }
});
