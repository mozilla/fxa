/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a very light wrapper around the real FxaClient to reduce boilerplate code
// and to allow us to develop to features that are not yet present in the real
// client.

import _ from 'underscore';
import $ from 'jquery';
import AuthErrors from './auth-errors';
import Constants from './constants';
import RecoveryKey from './crypto/recovery-keys';
import Session from './session';
import SignInReasons from './sign-in-reasons';
import VerificationReasons from './verification-reasons';
import VerificationMethods from './verification-methods';
import AuthClient from './auth/client';

function trim(str) {
  return $.trim(str);
}

const CONTEXTS_REQUIRE_KEYS = [
  // allow fx_desktop_v1, many users signed up using
  // the old context and are now using a newer version
  // of Firefox that accepts WebChannel messages.
  Constants.FX_DESKTOP_V1_CONTEXT,
  Constants.FX_DESKTOP_V2_CONTEXT,
  Constants.FX_DESKTOP_V3_CONTEXT,
  Constants.FX_FENNEC_V1_CONTEXT,
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
  return (
    relier.wantsKeys() || _.contains(CONTEXTS_REQUIRE_KEYS, sessionTokenContext)
  );
}

// errors from the FxaJSClient must be normalized so that they
// are translated and reported to metrics correctly.
function wrapClientToNormalizeErrors(client) {
  const proto = Object.getPrototypeOf(client);
  const wrappedClient = Object.create(proto);
  for (var key of Object.getOwnPropertyNames(proto)) {
    if (typeof client[key] === 'function') {
      wrappedClient[key] = function (key, ...args) {
        const retval = this[key].apply(this, args);

        // make no assumptions about the client returning a promise.
        // If the return value is not a promise, just return the value.
        if (!retval.then) {
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
    return this._getClient().then((client) =>
      callback.apply(this, [client, ...args])
    );
  };
}

/**
 * Create a delegate method to the fxa-js-client.
 *
 * @param {String} method to delegate to.
 * @returns {Function}
 */
function createClientDelegate(method) {
  return function (...args) {
    return this._getClient().then((client) => {
      if (!_.isFunction(client[method])) {
        throw new Error(`Invalid method on fxa-js-client: ${method}`);
      }
      return client[method](...args);
    });
  };
}

function getUpdatedSessionData(email, relier, accountData, options = {}) {
  var sessionTokenContext = options.sessionTokenContext;
  if (!sessionTokenContext && relier.isSync()) {
    sessionTokenContext = Constants.SESSION_TOKEN_USED_FOR_SYNC;
  }

  var updatedSessionData = {
    email: email,
    sessionToken: accountData.sessionToken,
    sessionTokenContext: sessionTokenContext,
    uid: accountData.uid,
    verificationMethod: accountData.verificationMethod,
    verificationReason: accountData.verificationReason,
    verified: accountData.verified || false,
  };

  if (wantsKeys(relier, sessionTokenContext)) {
    updatedSessionData.unwrapBKey = accountData.unwrapBKey;
    updatedSessionData.keyFetchToken = accountData.keyFetchToken;
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
  _getClient() {
    if (this._client) {
      return Promise.resolve(this._client);
    }

    return AuthClient.create(this._authServerUrl).then((client) => {
      this._client = wrapClientToNormalizeErrors(client);
      return this._client;
    });
  },

  /**
   * Fetch some entropy from the server
   *
   * @returns {Promise}
   */
  getRandomBytes: createClientDelegate('getRandomBytes'),

  /**
   * Check the user's current password without affecting session state.
   *
   * @param {String} email
   * @param {String} password
   * @param {String} sessionToken
   * An optional existing sessionToken for the user's account, which
   * can be used to check the password without creating a new session.
   * @returns {Promise}
   */
  checkPassword: withClient((client, email, password, sessionToken) => {
    if (sessionToken) {
      return client.sessionReauth(sessionToken, email, password, {
        reason: SignInReasons.PASSWORD_CHECK,
      });
    } else {
      return client
        .signIn(email, password, {
          reason: SignInReasons.PASSWORD_CHECK,
        })
        .then(function (sessionInfo) {
          // a session was created on the backend to check the user's
          // password. Delete the newly created session immediately
          // so that the session token is not left in the database.
          if (sessionInfo && sessionInfo.sessionToken) {
            return client.sessionDestroy(sessionInfo.sessionToken);
          }
        });
    }
  }),

  /**
   * Check whether an account exists for the given uid.
   *
   * @param {String} uid
   * @returns {Promise}
   */
  checkAccountExists: withClient((client, uid) => {
    return client.accountStatus(uid).then(function (status) {
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
    return client.accountStatusByEmail(email).then(function (status) {
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
   *   @param {String} [options.metricsContext] - context metadata for use in
   *                   flow events
   *   @param {String} [options.reason] - Reason for the sign in. See definitions
   *                   in sign-in-reasons.js. Defaults to SIGN_IN_REASONS.SIGN_IN.
   *   @param {String} [options.resume] - Resume token, passed in the
   *                   verification link if the user must verify their email.
   *   @param {String} [options.sessionTokenContext] - The context for which
   *                   the session token is being created. Defaults to the
   *                   relier's context.
   *   @param {Boolean} [options.skipCaseError] - if set to true, INCORRECT_EMAIL_CASE
   *                   errors will be returned to be handled locally instead of automatically
   *                   being retried in the fxa-js-client.
   *   @param {String} [options.unblockCode] - Unblock code.
   * @returns {Promise}
   */
  signIn: withClient(
    (client, originalEmail, password, relier, options = {}) => {
      var email = trim(originalEmail);

      var signInOptions = {
        keys: wantsKeys(relier),
        reason: options.reason || SignInReasons.SIGN_IN,
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

      if (options.originalLoginEmail) {
        signInOptions.originalLoginEmail = options.originalLoginEmail;
      }

      if (options.verificationMethod) {
        signInOptions.verificationMethod = options.verificationMethod;
      }

      setMetricsContext(signInOptions, options);

      return client
        .signIn(email, password, signInOptions)
        .then(function (accountData) {
          if (
            !accountData.verified &&
            // eslint-disable-next-line no-prototype-builtins
            !accountData.hasOwnProperty('verificationReason')
          ) {
            // Set a default verificationReason to `SIGN_UP` to allow
            // staged rollouts of servers. To handle calls to the
            // legacy /account/login that lacks a verificationReason,
            // assume SIGN_UP if the account is not verified.
            accountData.verificationReason = VerificationReasons.SIGN_UP;

            if (signInOptions.verificationMethod) {
              accountData.verificationMethod = signInOptions.verificationMethod;
            } else {
              accountData.verificationMethod = VerificationMethods.EMAIL;
            }
          }

          return getUpdatedSessionData(email, relier, accountData, options);
        });
    }
  ),

  /**
   * Re-authenticate a user.
   *
   * @method sessionReauth
   * @param {String} sessionToken
   * @param {String} originalEmail
   * @param {String} password
   * @param {Relier} relier
   * @param {Object} [options]
   *   @param {String} [options.metricsContext] - context metadata for use in
   *                   flow events
   *   @param {String} [options.reason] - Reason for the sign in. See definitions
   *                   in sign-in-reasons.js. Defaults to SIGN_IN_REASONS.SIGN_IN.
   *   @param {String} [options.resume] - Resume token, passed in the
   *                   verification link if the user must verify their email.
   *   @param {Boolean} [options.skipCaseError] - if set to true, INCORRECT_EMAIL_CASE
   *                   errors will be returned to be handled locally instead of automatically
   *                   being retried in the fxa-js-client.
   *   @param {String} [options.unblockCode] - Unblock code.
   *   @param {String} [options.originalLoginEmail] - the original email address as entered
   *                   by the user, if different from the one used for login.
   *   @param {String} [options.verificationMethod] - the method to use to verify the
   *                   session, if it is not already verified.
   * @returns {Promise}
   */
  sessionReauth: withClient(
    (client, sessionToken, originalEmail, password, relier, options = {}) => {
      const email = trim(originalEmail);

      const reauthOptions = {
        keys: wantsKeys(relier),
        reason: options.reason || SignInReasons.SIGN_IN,
      };

      if (relier.has('service')) {
        reauthOptions.service = relier.get('service');
      }

      if (relier.has('redirectTo')) {
        reauthOptions.redirectTo = relier.get('redirectTo');
      }

      if (options.unblockCode) {
        reauthOptions.unblockCode = options.unblockCode;
      }

      if (options.resume) {
        reauthOptions.resume = options.resume;
      }

      if (options.skipCaseError) {
        reauthOptions.skipCaseError = options.skipCaseError;
      }

      if (options.originalLoginEmail) {
        reauthOptions.originalLoginEmail = options.originalLoginEmail;
      }

      if (options.verificationMethod) {
        reauthOptions.verificationMethod = options.verificationMethod;
      }

      setMetricsContext(reauthOptions, options);

      return client
        .sessionReauth(sessionToken, email, password, reauthOptions)
        .then((accountData) => {
          accountData.sessionToken = sessionToken;
          return getUpdatedSessionData(email, relier, accountData, options);
        });
    }
  ),

  /**
   * Sign up a user
   *
   * @method signUp
   * @param {String} originalEmail
   * @param {String} password
   * @param {Relier} relier
   * @param {Object} [options]
   *   @param {String} [options.metricsContext] - Metrics context metadata
   *   @param {Boolean} [options.preVerified] - is the user preVerified
   *   @param {String} [options.resume] - Resume token, passed in the
   *                   verification link if the user must verify
   *                   their email.
   *   @param {String} [options.sessionTokenContext] - The context for
   *                   which the session token is being created.
   *                   Defaults to the relier's context.
   *   @param {String} [options.style] - Specify the style for emails
   * @returns {Promise}
   */
  signUp: withClient(function (
    client,
    originalEmail,
    password,
    relier,
    options = {}
  ) {
    var email = trim(originalEmail);

    var signUpOptions = {
      keys: wantsKeys(relier),
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

    if (options.verificationMethod) {
      signUpOptions.verificationMethod = options.verificationMethod;
    }

    if (relier.has('style')) {
      signUpOptions.style = relier.get('style');
    }

    setMetricsContext(signUpOptions, options);

    return client
      .signUp(email, password, signUpOptions)
      .then((accountData) =>
        getUpdatedSessionData(email, relier, accountData, options)
      );
  }),

  /**
   * Re-sends a verification code to the account's recovery email address.
   *
   * @param {Object} relier being signed into.
   * @param {String} sessionToken sessionToken obtained from signIn
   * @param {Object} [options={}] Options
   *   @param {String} [options.resume]
   *   Opaque url-encoded string that will be included in the verification link
   *   as a querystring parameter, useful for continuing an OAuth flow for
   *   example.
   *   @param {String} [options.style]
   *   Specify the style for the email
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  signUpResend: withClient((client, relier, sessionToken, options = {}) => {
    var clientOptions = {
      redirectTo: relier.get('redirectTo'),
      service: relier.get('service'),
    };

    if (options.resume) {
      clientOptions.resume = options.resume;
    }

    if (relier.has('style')) {
      clientOptions.style = relier.get('style');
    }

    return client.recoveryEmailResendCode(sessionToken, clientOptions);
  }),

  /**
   * Sends a verification code to the account's recovery email address
   * that will verify the current session.
   *
   * @param {String} sessionToken sessionToken obtained from signIn
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  sessionVerifyResend: withClient((client, sessionToken, options = {}) => {
    const clientOptions = {
      type: 'upgradeSession',
    };

    if (options.redirectTo) {
      clientOptions.redirectTo = options.redirectTo;
    }

    return client.recoveryEmailResendCode(sessionToken, clientOptions);
  }),

  /**
   * Destroy the user's current or custom session
   *
   * @param {String} sessionToken
   * @param {Object} [options]
   *   @param {String} [options.customSessionToken] - if provided, deletes a custom session token
   * @returns {Promise}
   *
   */
  sessionDestroy: createClientDelegate('sessionDestroy'),

  /**
   * Verify a signup code
   *
   * @param {String} uid Account ID
   * @param {String} code Verification code
   * @param {Object} [options={}] Options
   *   @param {String} [options.service]
   *   Service being signed into
   *   @param {String} [options.reminder]
   *   Reminder that was used to verify the account
   *   @param {String} [options.type]
   *   Type of code being verified, only supports `secondary` otherwise will verify account/sign-in
   *   @param {String} [options.style]
   *   Specify the style of confirmation email to be sent
   * @return {Promise} resolves when complete
   */
  verifyCode: createClientDelegate('verifyCode'),

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
   * @return {Promise} resolves when complete
   */
  passwordReset: withClient((client, originalEmail, relier, options = {}) => {
    var email = trim(originalEmail);

    var clientOptions = {
      redirectTo: relier.get('redirectTo'),
      service: relier.get('service'),
    };

    if (options.resume) {
      clientOptions.resume = options.resume;
    }

    setMetricsContext(clientOptions, options);

    return client
      .passwordForgotSendCode(email, clientOptions)
      .then(function (result) {
        Session.clear();
        return result;
      });
  }),

  /**
   * Re-sends a password reset verification code to the account's recovery email address.
   *
   * @param {String} originalEmail
   * @param {String} passwordForgotToken
   * @param {Object} relier
   * @param {Object} [options={}] Options
   *   @param {String} [options.resume]
   *   Opaque url-encoded string that will be included in the verification link
   *   as a querystring parameter, useful for continuing an OAuth flow for
   *   example.
   * @return {Promise} resolves when complete
   */
  passwordResetResend: withClient(
    (client, originalEmail, passwordForgotToken, relier, options = {}) => {
      var email = trim(originalEmail);

      // the linters complain if this is defined in the call to
      // passwordForgotResendCode
      var clientOptions = {
        redirectTo: relier.get('redirectTo'),
        service: relier.get('service'),
      };

      if (options.resume) {
        clientOptions.resume = options.resume;
      }

      return client.passwordForgotResendCode(
        email,
        passwordForgotToken,
        clientOptions
      );
    }
  ),

  /**
   * Submits the verification token to the server.
   * The API returns accountResetToken to the client.
   *
   * @method passwordForgotVerifyCode
   * @param {String} originalEmail
   * @param {String} newPassword
   * @param {String} token
   * @param {String} code
   * @param {Object} relier
   * @param {Object} [options={}]
   *   @param {String} [options.emailToHashWith]
   *   If specified, the password is hashed with this email address, otherwise
   *   the user's password is hashed with their current email.
   * @return {Promise} resolves when complete
   */
  completePasswordReset: withClient(
    (client, originalEmail, newPassword, token, code, relier, options = {}) => {
      const email = trim(originalEmail);

      var accountResetOptions = {
        keys: wantsKeys(relier),
        sessionToken: true,
      };

      return client
        .passwordForgotVerifyCode(code, token, {})
        .then((result) => {
          let emailToHashWith = email;

          // The `emailToHashWith` option is returned by the auth-server to let the content-server
          // know what to hash the new password with. This is important in the scenario where a user
          // has changed their primary email address. In this case, they must still hash with the
          // account's original email because this will maintain backwards compatibility with
          // how account password hashing works previously.
          if (options.emailToHashWith) {
            emailToHashWith = trim(options.emailToHashWith);
          }

          return client.accountReset(
            emailToHashWith,
            newPassword,
            result.accountResetToken,
            accountResetOptions
          );
        })
        .then((accountData) => {
          return getUpdatedSessionData(email, relier, accountData);
        });
    }
  ),

  /**
   * Check if the password reset is complete
   *
   * @param {String} token to check
   * @returns {Promise} resolves to true if password reset has completed, false otw.
   */
  isPasswordResetComplete: withClient((client, token) => {
    return client.passwordForgotStatus(token).then(
      function () {
        // if the request succeeds, the password reset hasn't completed
        return false;
      },
      function (err) {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return true;
        }
        throw err;
      }
    );
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
  changePassword: withClient(
    (
      client,
      originalEmail,
      oldPassword,
      newPassword,
      sessionToken,
      sessionTokenContext,
      relier
    ) => {
      var email = trim(originalEmail);
      return client
        .passwordChange(email, oldPassword, newPassword, {
          keys: wantsKeys(relier, sessionTokenContext),
          sessionToken: sessionToken,
        })
        .then((accountData = {}) => {
          return getUpdatedSessionData(email, relier, accountData, {
            sessionTokenContext: sessionTokenContext,
          });
        });
    }
  ),

  /**
   * Deletes the account.
   *
   * @param {String} originalEmail Email input
   * @param {String} password Password input
   * @param {String} sessionToken User session token
   * @return {Promise} resolves when complete
   */
  deleteAccount: withClient((client, originalEmail, password, sessionToken) => {
    var email = trim(originalEmail);
    return client.accountDestroy(email, password, {}, sessionToken);
  }),

  /**
   * Responds successfully if the session status is valid, requires the sessionToken.
   *
   * @param {String} sessionToken User session token
   * @return {Promise} resolves when complete
   */
  sessionStatus: createClientDelegate('sessionStatus'),

  /**
   * Verify an account and a session using a otp based code.
   *
   * @param {String} sessionToken User session token
   * @param {String} code Code to verify account and session
   * @return {Promise} resolves when complete
   */
  sessionVerifyCode: createClientDelegate('sessionVerifyCode'),

  /**
   * Resend the verify code based on otp.
   *
   * @param {String} sessionToken User session token
   * @return {Promise} resolves when complete
   */
  sessionResendVerifyCode: createClientDelegate('sessionResendVerifyCode'),

  /**
   * Check if `sessionToken` is valid
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves to true if valid, false otw.
   */
  isSignedIn(sessionToken) {
    // Check if the user is signed in.
    if (!sessionToken) {
      return Promise.resolve(false);
    }

    // Validate session token
    return this.sessionStatus(sessionToken).then(
      function () {
        return true;
      },
      function (err) {
        // the only error that we expect is INVALID_TOKEN,
        // rethrow all others.
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return false;
        }

        throw err;
      }
    );
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
    return client.recoveryEmailStatus(sessionToken).then(function (response) {
      if (!response.verified) {
        // This is a little bit unnatural. /recovery_email/status
        // returns two fields, `emailVerified` and
        // `sessionVerified`. The client side depends on a reason
        // to show the correct UI. Convert `emailVerified` to
        // a `verificationReason`.
        var verificationReason = response.emailVerified
          ? VerificationReasons.SIGN_IN
          : VerificationReasons.SIGN_UP;

        return {
          email: response.email,
          verificationReason: verificationReason,
          verified: false,
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
  sessionVerificationStatus: createClientDelegate('recoveryEmailStatus'),

  /**
   * Get the base16 bundle of encrypted kA|wrapKb.
   *
   * @param {String} keyFetchToken
   * @param {String} oldUnwrapBKey
   * @return {Promise} resolves when complete
   */
  accountKeys: createClientDelegate('accountKeys'),

  /**
   * Get the account profile from the auth server.
   *
   * @param {String} sessionToken
   * @return {Promise} resolves when complete
   */
  accountProfile: createClientDelegate('accountProfile'),

  /**
   * Get the account details from the auth server.
   *
   * @param {String} sessionToken
   * @return {Promise}
   */
  account: createClientDelegate('account'),

  /**
   * Get a list of all devices for a user
   *
   * @param {String} sessionToken sessionToken obtained from signIn
   * @return {Promise} resolves when complete
   */
  deviceList: createClientDelegate('deviceList'),

  /**
   * Get user's sessions
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves with response when complete.
   */
  sessions: createClientDelegate('sessions'),

  /**
   * Get user's security events
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves with response when complete.
   */
  securityEvents: createClientDelegate('securityEvents'),

  /**
   * Delete user's security events
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves with empty response when complete.
   */
  deleteSecurityEvents: createClientDelegate('deleteSecurityEvents'),

  /**
   * Get user's attached clients
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves with response when complete.
   */
  attachedClients: createClientDelegate('attachedClients'),

  /**
   * Unregister an existing device
   *
   * @param {String} sessionToken Session token obtained from signIn
   * @param {String} deviceId User-unique identifier of device
   * @return {Promise} resolves when complete
   */
  deviceDestroy: createClientDelegate('deviceDestroy'),

  /**
   * Get user's attached clients
   *
   * @param {String} sessionToken
   * @returns {Promise} resolves with response when complete.
   */
  attachedClientDestroy: createClientDelegate('attachedClientDestroy'),

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
  rejectUnblockCode: createClientDelegate('rejectUnblockCode'),

  /**
   * Send an SMS
   *
   * @param {String} sessionToken - account session token.
   * @param {String} phoneNumber - target phone number. Expected to have
   *   a country code prefix, e.g., +1, +44.
   * @param {Number} messageId - ID of message to send.
   * @param {Object} [options]
   *   @param {String[]} [options.features] - Features to enable for the request, e.g., `signinCodes`
   *   @param {String} [options.metricsContext] - context metadata for use in
   *                   flow events
   * @returns {Promise}
   */
  sendSms: withClient(
    (client, sessionToken, phoneNumber, messageId, options = {}) => {
      return client
        .sendSms(sessionToken, phoneNumber, messageId, options)
        .catch((err) => {
          function isInvalidPhoneNumberError(err) {
            // If the number fails joi validation, the error
            // returns in this format.
            return (
              AuthErrors.is(err, 'INVALID_PARAMETER') &&
              err.validation &&
              err.validation.keys &&
              err.validation.keys[0] === 'phoneNumber'
            );
          }
          if (isInvalidPhoneNumberError(err)) {
            throw AuthErrors.toError('INVALID_PHONE_NUMBER');
          }

          throw err;
        });
    }
  ),

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
  smsStatus: createClientDelegate('smsStatus'),

  /**
   * Consume a signinCode
   *
   * @param {String} signinCode
   * @param {String} flowId
   * @param {String} flowBeginTime
   * @param {String} [deviceId]
   * @returns {Promise} resolves to an object with Account information.
   */
  consumeSigninCode: createClientDelegate('consumeSigninCode'),

  /**
   * Get the recovery emails associated with the signed in account.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @returns {Promise} resolves to the list of recovery emails when complete
   */
  recoveryEmails: createClientDelegate('recoveryEmails'),

  /**
   * Create a new recovery email for the signed in account.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @param {String} email new email to be added
   * @param {Object} options options
   * @returns {Promise} resolves when complete
   */
  recoveryEmailCreate: createClientDelegate('recoveryEmailCreate'),

  /**
   * Remove the recovery email for the signed in account.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @param {String} email email to be removed
   * @returns {Promise} resolves when complete
   */
  recoveryEmailDestroy: createClientDelegate('recoveryEmailDestroy'),

  /**
   * Re-sends a verification code to the account's recovery email address.
   *
   * @param {String} sessionToken sessionToken obtained from signIn
   * @param {Object} [options={}] Options
   *   @param {String} [options.email]
   *   Code will be resent to this email, only used for secondary email codes
   *   @param {String} [options.service]
   *   Opaque alphanumeric token to be included in verification links
   *   @param {String} [options.redirectTo]
   *   a URL that the client should be redirected to after handling the request
   *   @param {String} [options.resume]
   *   Opaque url-encoded string that will be included in the verification link
   *   as a querystring parameter, useful for continuing an OAuth flow for
   *   example.
   *   @param {String} [options.lang]
   *   set the language for the 'Accept-Language' header
   * @return {Promise} resolves when complete
   */
  resendEmailCode: createClientDelegate('recoveryEmailResendCode'),

  deleteEmail: createClientDelegate('deleteEmail'),

  /**
   * Set the new primary email address for a user.
   *
   * @param {String} sessionToken User session token
   * @param {String} email The new primary email address
   * @return {Promise} resolves when complete
   */
  recoveryEmailSetPrimaryEmail: createClientDelegate(
    'recoveryEmailSetPrimaryEmail'
  ),

  /**
   * Verify secondary email via a code.
   *
   * @param {String} sessionToken User session token
   * @param {String} email The email address
   * @param {Number} code Code to verify address with
   * @return {Promise} resolves when complete
   */
  recoveryEmailSecondaryVerifyCode: createClientDelegate(
    'recoveryEmailSecondaryVerifyCode'
  ),

  /**
   * Resend secondary email verification code.
   *
   * @param {String} sessionToken User session token
   * @param {String} email Email to resend verification code
   */
  recoveryEmailSecondaryResendCode: createClientDelegate(
    'recoveryEmailSecondaryResendCode'
  ),

  /**
   * Creates a new TOTP token for the current user.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @returns {Promise} resolves when complete
   */
  createTotpToken: createClientDelegate('createTotpToken'),

  /**
   * Deletes the current user's TOTP token.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @returns {Promise} resolves when complete
   */
  deleteTotpToken: createClientDelegate('deleteTotpToken'),

  /**
   * Checks to see if the current user has a TOTP token.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @returns {Promise} resolves when complete
   */
  checkTotpTokenExists: createClientDelegate('checkTotpTokenExists'),

  /**
   * Checks to see if the TOTP code is valid and verifies the TOTP token
   * if it is.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @param {String} code TOTP code
   * @param {Object} [options={}] Options
   *   @param {String} [options.service] - service used
   * @returns {Promise} resolves when complete
   */
  verifyTotpCode: createClientDelegate('verifyTotpCode'),

  /**
   * Consume and verifies a session with a recovery code.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @param {String} code Recovery code
   * @returns {Promise} resolves when complete
   */
  consumeRecoveryCode: createClientDelegate('consumeRecoveryCode'),

  /**
   * Replace all user recovery codes.
   *
   * @param {String} sessionToken SessionToken obtained from signIn
   * @returns {Promise} resolves when complete
   */
  replaceRecoveryCodes: createClientDelegate('replaceRecoveryCodes'),

  /**
   * Creates a new recovery key bundle for the current user. To
   * create a recovery key first a session re-auth is performed,
   * then the account keys are fetched and finally the recovery
   * bundle stores an encrypted copy of the original user's `kB`
   *
   * @param {String} email - email address
   * @param {String} password - current password of the user
   * @param {String} sessionToken - SessionToken obtained from signIn
   * @param {String} uid - current uid of the user
   * @returns {Promise} resolves with response when complete.
   */
  createRecoveryBundle: withClient(
    (client, email, password, sessionToken, uid, enabled = true) => {
      let recoveryKey, keys, recoveryJwk;

      return client
        .sessionReauth(sessionToken, email, password, {
          keys: true,
          reason: VerificationReasons.RECOVERY_KEY,
        })
        .then((res) => client.accountKeys(res.keyFetchToken, res.unwrapBKey))
        .then((result) => {
          keys = result;
          return RecoveryKey.generateRecoveryKey(
            Constants.RECOVERY_KEY_LENGTH
          ).then((result) => {
            recoveryKey = result;
            return RecoveryKey.getRecoveryJwk(uid, recoveryKey);
          });
        })
        .then((result) => {
          recoveryJwk = result;
          return RecoveryKey.bundleRecoveryData(recoveryJwk, keys);
        })
        .then((bundle) =>
          client.createRecoveryKey(
            sessionToken,
            recoveryJwk.kid,
            bundle,
            enabled
          )
        )
        .then(() => {
          return { recoveryKey, recoveryKeyId: recoveryJwk.kid };
        });
    }
  ),

  /**
   * Deletes the recovery key associated with this user.
   *
   * @param sessionToken
   */
  deleteRecoveryKey: createClientDelegate('deleteRecoveryKey'),

  /**
   * Verify the recovery key associated with this user.
   *
   * @param sessionToken
   * @param recoveryKeyId
   */
  verifyRecoveryKey: createClientDelegate('verifyRecoveryKey'),

  /**
   * This checks to see if a recovery key exists for a user.
   *
   * @param sessionToken
   * @param {String} email User's email
   * @returns {Promise} resolves with response when complete.
   */
  recoveryKeyExists: createClientDelegate('recoveryKeyExists'),

  /**
   * Verify passwordForgotCode which returns an `accountResetToken`.
   *
   * @param {String} passwordForgotCode - password forgot code
   * @param {String} passwordForgotToken - password forgot token
   * @param {Object} [options={}] Options
   *   @param {String} [options.accountResetWithRecoveryKey] - perform account reset with recovery key
   * @returns {Promise} resolves with response when complete.
   */
  passwordForgotVerifyCode: withClient(
    (client, passwordForgotCode, passwordForgotToken, options = {}) => {
      return client.passwordForgotVerifyCode(
        passwordForgotCode,
        passwordForgotToken,
        options
      );
    }
  ),

  /**
   * Gets recovery key bundle for the current user.
   *
   * @param {String} accountResetToken
   * @param {String} uid - Uid of user
   * @param {String} recoveryKey - User's recovery key
   * @returns {Promise} resolves with response when complete.
   */
  getRecoveryBundle: withClient(
    (client, accountResetToken, uid, recoveryKey) => {
      return RecoveryKey.getRecoveryJwk(uid, recoveryKey).then(
        (recoveryJwk) => {
          return client
            .getRecoveryKey(accountResetToken, recoveryJwk.kid)
            .then((bundle) =>
              RecoveryKey.unbundleRecoveryData(recoveryJwk, bundle.recoveryData)
            )
            .then((data) => {
              return {
                keys: data,
                recoveryKeyId: recoveryJwk.kid,
              };
            });
        }
      );
    }
  ),

  /**
   * Reset an account using a recovery key. This maintains a user's original encryption keys.
   *
   * @param {String} accountResetToken
   * @param {String} email - Email of user
   * @param {String} newPassword - New password for user
   * @param {String} recoveryKeyId - The recoveryKeyId that mapped to original recovery key
   * @param {String} kB - Wrap new password with this kB
   * @param {String} relier - Relier to sign-in
   * @returns {Promise} resolves with response when complete.
   */
  resetPasswordWithRecoveryKey: withClient(
    (
      client,
      accountResetToken,
      email,
      newPassword,
      recoveryKeyId,
      kB,
      relier
    ) => {
      const keys = { kB };
      return client
        .resetPasswordWithRecoveryKey(
          accountResetToken,
          email,
          newPassword,
          recoveryKeyId,
          keys,
          { keys: true, sessionToken: true }
        )
        .then((accountData) => {
          return getUpdatedSessionData(email, relier, accountData);
        });
    }
  ),

  /**
   * Create an OAuth code using sessionToken
   *
   * @param {String} sessionToken
   * @param {String} clientId
   * @param {String} state
   * @param {Object} [options={}]
   *   @param {String} [options.access_type=online] if `access_type=offline`, a refresh token
   *     will be issued when trading the code for an access token.
   *   @param {String} [options.acr_values] allowed ACR values
   *   @param {String} [options.keys_jwe] Keys used to encrypt
   *   @param {String} [options.redirect_uri] registered redirect URI to return to
   *   @param {String} [options.response_type=code] response type
   *   @param {String} [options.scope] requested scopes
   *   @param {String} [options.code_challenge_method] PKCE code challenge method
   *   @param {String} [options.code_challenge] PKCE code challenge
   * @returns {Promise} A promise that will be fulfilled with:
   *   - `redirect` - redirect URI
   *   - `code` - authorization code
   *   - `state` - state token
   */
  createOAuthCode: createClientDelegate('createOAuthCode'),

  /**
   * Create an OAuth token using `sessionToken`
   *
   * @param {String} sessionToken
   * @param {String} clientId
   * @param {Object} [options={}] Options
   *   @param {String} [options.access_type=online] if `access_type=offline`, a refresh token
   *     will be issued when trading the code for an access token.
   *   @param {String} [options.scope] requested scopes
   *   @param {Number} [options.ttl] time to live, in seconds
   * @returns {Promise} A promise that will be fulfilled with:
   *   - `access_token` - The access token
   *   - `refresh_token` - A refresh token, if `options.access_type=offline`
   *   - `id_token` - an OIDC ID token, returned if `scope` includes `openid`
   *   - `scope` - Requested scopes
   *   - `auth_at` - Time the user authenticated
   *   - `token_type` - The string `bearer`
   *   - `expires_in` - Time at which the token expires
   */
  createOAuthToken: createClientDelegate('createOAuthToken'),

  /**
   * Use `sessionToken` to get scoped key data for the RP associated with `client_id`
   *
   * @param {String} sessionToken
   * @param {String} clientId
   * @param {String} scope
   * @returns {Promise} A promise that will be fulfilled with:
   *   - `identifier`
   *   - `keyRotationSecret`
   *   - `keyRotationTimestamp`
   */
  getOAuthScopedKeyData: createClientDelegate('getOAuthScopedKeyData'),

  /**
   * Get a list of subscription plans with an OAuth access token.
   *
   * @param {String} token An access token from the OAuth server.
   * @returns {Promise} A promise that will be fulfilled with a list of
   * subscription plans from SubHub.
   */
  getSubscriptionPlans: createClientDelegate('getSubscriptionPlans'),

  /**
   * Get a list of active subscriptions with an OAuth access token.
   *
   * @param {String} token A token from the OAuth server.
   * @returns {Promise} A promise that will be fulfilled with a list of active
   * subscriptions.
   */
  getActiveSubscriptions: createClientDelegate('getActiveSubscriptions'),

  /**
   * Create a support ticket.
   *
   * @param {String} token A token from the OAuth server.
   * @param {Object} [supportTicket={}]
   *   @param {String} [supportTicket.topic]
   *   @param {String} [supportTicket.subject] Optional subject
   *   @param {String} [supportTicket.message]
   * @returns {Promise} A promise that will be fulfilled with:
   *   - `success`
   *   - `ticket` OR `error`
   */
  createSupportTicket: createClientDelegate('createSupportTicket'),

  /**
   * Update a user newsletters subscription.
   *
   * @param {String[]} [newsletters]
   * @returns {Promise} - resolves with empty response
   */
  updateNewsletters: createClientDelegate('updateNewsletters'),

  /**
   * Verify an ID Token.
   *
   * @param {String} idToken An ID Token supplied as an id_token_hint by an RP
   * @returns {Promise} resolves with response when complete.
   */
  verifyIdToken: createClientDelegate('verifyIdToken'),

  /**
   * Create a one-time use sign-in code.
   *
   * @returns {Promise} resolves with response when complete.
   */
  createSigninCode: createClientDelegate('createSigninCode'),
};

export default FxaClientWrapper;

function setMetricsContext(serverOptions, options) {
  if (options.metricsContext) {
    serverOptions.metricsContext = options.metricsContext;
  }
}
