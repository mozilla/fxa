/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./lib/request', '../components/sjcl/sjcl', './lib/credentials', './lib/hawkCredentials', './lib/errors'], function (Request, sjcl, credentials, hawkCredentials, ERRORS) {
  'use strict';

  /**
   * @class FxAccountClient
   * @constructor
   * @param {String} uri Auth Server URI
   * @param {Object} config Configuration
   */
  function FxAccountClient(uri, config) {
    if (typeof uri !== 'string') {
      config = uri || {};
      uri = config.uri;
    }
    if (typeof config === 'undefined') {
      config = {};
    }

    this.request = new Request(uri, config.xhr, { localtimeOffsetMsec: config.localtimeOffsetMsec });
  }

  /**
   * @method signUp
   * @param {String} email Email input
   * @param {String} password Password input
   * @param {Object} [options={}] Options
   *   @param {String} [options.service]
   *   Opaque alphanumeric token to be included in verification links
   *   @param {String} [options.redirectTo]
   *   a URL that the client should be redirected to after handling the request
   *   @param {String} [options.preVerified]
   *   set email to be verified if possible
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.signUp = function (email, password, options) {
    var self = this;

    return credentials.setup(email, password)
      .then(
        function (result) {
          var endpoint = '/account/create';
          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          if (options) {
            if (options.service) {
              data.service = options.service;
            }

            if (options.redirectTo) {
              data.redirectTo = options.redirectTo;
            }

            if (options.preVerified) {
              data.preVerified = options.preVerified;
            }

            if (options.keys) {
              endpoint += '?keys=true';
            }
          }

          return self.request.send(endpoint, 'POST', null, data);
        }
      );
  };

  /**
   * @method signIn
   * @param {String} email Email input
   * @param {String} password Password input
   * @param {Object} [options={}] Options
   *   @param {Boolean} [options.keys]
   *   If `true`, calls the API with `?keys=true` to get the keyFetchToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.signIn = function (email, password, options) {
    var self = this;

    return credentials.setup(email, password)
      .then(
        function (result) {
          var endpoint = '/account/login';
          var keys = options && options.keys === true;

          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          if (keys) {
            endpoint += '?keys=true';
          }

          return self.request.send(endpoint, 'POST', null, data)
            .then(
              function(accountData) {
                if (keys) {
                  accountData.unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);
                }
                return accountData;
              },
              function(error) {
                // if incorrect email case error
                if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE) {
                  return self.signIn(error.email, password);
                } else {
                  throw error;
                }
              }
            );
        }
      );
  };

  /**
   * @method verifyCode
   * @param {String} uid Account ID
   * @param {String} code Verification code
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.verifyCode = function(uid, code) {
    return this.request.send('/recovery_email/verify_code', 'POST', null, {
      uid: uid,
      code: code
    });
  };

  /**
   * @method recoveryEmailStatus
   * @param {String} sessionToken sessionToken obtained from signIn
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.recoveryEmailStatus = function(sessionToken) {
    var self = this;

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/recovery_email/status', 'GET', creds);
      });
  };

  /**
   * Re-sends a verification code to the account's recovery email address.
   *
   * @method recoveryEmailResendCode
   * @param {String} sessionToken sessionToken obtained from signIn
   * @param {Object} [options={}] Options
   *   @param {String} [options.service]
   *   Opaque alphanumeric token to be included in verification links
   *   @param {String} [options.redirectTo]
   *   a URL that the client should be redirected to after handling the request
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.recoveryEmailResendCode = function(sessionToken, options) {
    var self = this;
    var data = {};

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }
    }

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/recovery_email/resend_code', 'POST', creds, data);
      });
  };

  /**
   * Used to ask the server to send a recovery code.
   * The API returns passwordForgotToken to the client.
   *
   * @method passwordForgotSendCode
   * @param {String} email
   * @param {Object} [options={}] Options
   *   @param {String} [options.service]
   *   Opaque alphanumeric token to be included in verification links
   *   @param {String} [options.redirectTo]
   *   a URL that the client should be redirected to after handling the request
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotSendCode = function(email, options) {
    var data = {
      email: email
    };

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }
    }

    return this.request.send('/password/forgot/send_code', 'POST', null, data);
  };

  /**
   * Re-sends a verification code to the account's recovery email address.
   * HAWK-authenticated with the passwordForgotToken.
   *
   * @method passwordForgotResendCode
   * @param {String} email
   * @param {String} passwordForgotToken
   * @param {Object} [options={}] Options
   *   @param {String} [options.service]
   *   Opaque alphanumeric token to be included in verification links
   *   @param {String} [options.redirectTo]
   *   a URL that the client should be redirected to after handling the request
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotResendCode = function(email, passwordForgotToken, options) {
    var self = this;
    var data = {
      email: email
    };

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }
    }

    return hawkCredentials(passwordForgotToken, 'passwordForgotToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/password/forgot/resend_code', 'POST', creds, data);
      });
  };

  /**
   * Submits the verification token to the server.
   * The API returns accountResetToken to the client.
   * HAWK-authenticated with the passwordForgotToken.
   *
   * @method passwordForgotVerifyCode
   * @param {String} code
   * @param {String} passwordForgotToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotVerifyCode = function(code, passwordForgotToken) {
    var self = this;

    return hawkCredentials(passwordForgotToken, 'passwordForgotToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/password/forgot/verify_code', 'POST', creds, {
          code: code
        });
      });
  };

  /**
   * The API returns reset result to the client.
   * HAWK-authenticated with accountResetToken
   *
   * @method accountReset
   * @param {String} email
   * @param {String} newPassword
   * @param {String} accountResetToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountReset = function(email, newPassword, accountResetToken) {
    var self = this;
    var authPW;

    return credentials.setup(email, newPassword)
      .then(
        function (result) {
          authPW = sjcl.codec.hex.fromBits(result.authPW);

          return hawkCredentials(accountResetToken, 'accountResetToken',  2 * 32);
        }
      ).then(
        function (creds) {
          return self.request.send('/account/reset', 'POST', creds, {
            authPW: authPW
          });
        }
      );
  };

  /**
   * Get the base16 bundle of encrypted kA|wrapKb.
   *
   * @method accountKeys
   * @param {String} keyFetchToken
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountKeys = function(keyFetchToken) {
    var self = this;

    return hawkCredentials(keyFetchToken, 'keyFetchToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/account/keys', 'GET', creds);
      });
  };

  /**
   * Gets the collection of devices currently authenticated and syncing for the user.
   *
   * @method accountDevices
   * @param {String} sessionToken User session token
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountDevices = function(sessionToken) {
    var self = this;

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/account/devices', 'GET', creds);
      });
  };

  /**
   * This deletes the account completely. All stored data is erased.
   *
   * @method accountDestroy
   * @param {String} email Email input
   * @param {String} password Password input
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountDestroy = function(email, password) {
    var self = this;

    return credentials.setup(email, password)
      .then(
      function (result) {
        var data = {
          email: result.emailUTF8,
          authPW: sjcl.codec.hex.fromBits(result.authPW)
        };

        return self.request.send('/account/destroy', 'POST', null, data)
          .then(
            function(response) {
              return response;
            },
            function(error) {
              // if incorrect email case error
              if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE) {
                return self.accountDestroy(error.email, password);
              } else {
                throw error;
              }
            }
          );
      }
    );
  };

  /**
   * Destroys this session, by invalidating the sessionToken.
   *
   * @method sessionDestroy
   * @param {String} sessionToken User session token
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.sessionDestroy = function(sessionToken) {
    var self = this;

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/session/destroy', 'POST', creds);
      });
  };

  /**
   * Sign a BrowserID public key
   *
   * @method certificateSign
   * @param {String} sessionToken User session token
   * @param {Object} publicKey The key to sign
   * @param {int} duration Time interval from now when the certificate will expire in seconds
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.certificateSign = function(sessionToken, publicKey, duration) {
    var self = this;

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/session/destroy', 'POST', creds);
      });
  };

  /**
   * Change the password from one known value to another.
   *
   * @method passwordChange
   * @param {String} email
   * @param {String} oldPassword
   * @param {String} newPassword
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordChange = function(email, oldPassword, newPassword) {
    var self = this;

    return self._passwordChangeStart(email, oldPassword)
      .then(function (oldCreds) {

        return self._passwordChangeFinish(email, newPassword, oldCreds);
      });
  };

  /**
   * First step to change the password.
   *
   * @method passwordChangeStart
   * @private
   * @param {String} email
   * @param {String} oldPassword
   * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText` and `oldUnwrapBKey`
   */
  FxAccountClient.prototype._passwordChangeStart = function(email, oldPassword) {
    var self = this;

    return credentials.setup(email, oldPassword)
      .then(function (oldCreds) {
        var data = {
          email: oldCreds.emailUTF8,
          oldAuthPW: sjcl.codec.hex.fromBits(oldCreds.authPW)
        };

        return self.request.send('/password/change/start', 'POST', null, data)
          .then(
            function(passwordData) {
              passwordData.oldUnwrapBKey = sjcl.codec.hex.fromBits(oldCreds.unwrapBKey);
              return passwordData;
            },
            function(error) {
              // if incorrect email case error
              if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE) {
                return self._passwordChangeStart(error.email, oldPassword);
              } else {
                throw error;
              }
            }
          );
      });
  };

  /**
   * Second step to change the password.
   *
   * @method _passwordChangeFinish
   * @private
   * @param {String} email
   * @param {String} newPassword
   * @param {Object} oldCreds This object should consists of `oldUnwrapBKey` and `passwordChangeToken`.
   * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText`
   */
  FxAccountClient.prototype._passwordChangeFinish = function(email, newPassword, oldCreds) {
    var self = this;
    var wrapKb;
    var authPW;

    return credentials.setup(email, newPassword)
      .then(function(newCreds) {
        wrapKb = sjcl.codec.hex.fromBits(
          credentials.wrap(
            sjcl.codec.hex.toBits(oldCreds.oldUnwrapBKey),
            newCreds.unwrapBKey
          )
        );

        authPW = sjcl.codec.hex.fromBits(newCreds.authPW);

        return hawkCredentials(oldCreds.passwordChangeToken, 'passwordChangeToken',  2 * 32);
      }).then(function(hawkCreds) {

        return self.request.send('/password/change/finish', 'POST', hawkCreds, {
          wrapKb: wrapKb,
          authPW: authPW
        });
      });
  };

  /**
   * Get 32 bytes of random data. This should be combined with locally-sourced entropy when creating salts, etc.
   *
   * @method getRandomBytes
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.getRandomBytes = function() {

    return this.request.send('/get_random_bytes', 'POST');
  };

  return FxAccountClient;
});


