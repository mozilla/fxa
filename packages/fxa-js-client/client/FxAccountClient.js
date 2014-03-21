/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./lib/request', 'sjcl', 'p', './lib/credentials', './lib/hawkCredentials', './lib/errors'],
  function (Request, sjcl, P, credentials, hawkCredentials, ERRORS) {
  'use strict';

  var VERSION = 'v1';
  var uriVersionRegExp = new RegExp('/' + VERSION + '$');

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
    if (!uriVersionRegExp.test(uri)) {
      uri = uri + '/' + VERSION;
    }

    this.request = new Request(uri, config.xhr, { localtimeOffsetMsec: config.localtimeOffsetMsec });
  }

  FxAccountClient.VERSION = VERSION;

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
   *   @param {String} [options.lang]
   *   set the language for the 'Accept-Language' header
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
          var requestOpts = {};

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

            if (options.lang) {
              requestOpts.headers = {
                'Accept-Language': options.lang
              };
            }
          }

          return self.request.send(endpoint, 'POST', null, data, requestOpts);
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
   *   @param {Boolean} [options.skipCaseError]
   *   If `true`, the request will skip the incorrect case error
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.signIn = function (email, password, options) {
    var self = this;
    options = options || {};

    return credentials.setup(email, password)
      .then(
        function (result) {
          var endpoint = '/account/login';

          var data = {
            email: result.emailUTF8,
            authPW: sjcl.codec.hex.fromBits(result.authPW)
          };

          if (options.keys) {
            endpoint += '?keys=true';
          }

          return self.request.send(endpoint, 'POST', null, data)
            .then(
              function(accountData) {
                if (options.keys) {
                  accountData.unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);
                }
                return accountData;
              },
              function(error) {
                if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE && !options.skipCaseError) {
                    options.skipCaseError = true;

                    return self.signIn(error.email, password, options);
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
   *   @param {String} [options.lang]
   *   set the language for the 'Accept-Language' header
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.recoveryEmailResendCode = function(sessionToken, options) {
    var self = this;
    var data = {};
    var requestOpts = {};

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.lang) {
        requestOpts.headers = {
          'Accept-Language': options.lang
        };
      }
    }

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/recovery_email/resend_code', 'POST', creds, data, requestOpts);
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
   *   @param {String} [options.lang]
   *   set the language for the 'Accept-Language' header
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotSendCode = function(email, options) {
    var data = {
      email: email
    };
    var requestOpts = {};

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.lang) {
        requestOpts.headers = {
          'Accept-Language': options.lang
        };
      }
    }

    return this.request.send('/password/forgot/send_code', 'POST', null, data, requestOpts);
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
   *   @param {String} [options.lang]
   *   set the language for the 'Accept-Language' header
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.passwordForgotResendCode = function(email, passwordForgotToken, options) {
    var self = this;
    var data = {
      email: email
    };
    var requestOpts = {};

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.lang) {
        requestOpts.headers = {
          'Accept-Language': options.lang
        };
      }
    }

    return hawkCredentials(passwordForgotToken, 'passwordForgotToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/password/forgot/resend_code', 'POST', creds, data, requestOpts);
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
   * @param {String} oldUnwrapBKey
   * @return {Promise} A promise that will be fulfilled with JSON of {kA, kB}  of the key bundle
   */
  FxAccountClient.prototype.accountKeys = function(keyFetchToken, oldUnwrapBKey) {
    var self = this;

    return hawkCredentials(keyFetchToken, 'keyFetchToken',  3 * 32)
      .then(function(creds) {
        var bundleKey = sjcl.codec.hex.fromBits(creds.bundleKey);

        return self.request.send('/account/keys', 'GET', creds)
          .then(
            function(payload) {

              return credentials.unbundleKeyFetchResponse(bundleKey, payload.bundle);
              });
      })
      .then(function(keys) {
        return {
          kB: sjcl.codec.hex.fromBits(
            credentials.xor(
              sjcl.codec.hex.toBits(keys.wrapKB),
              sjcl.codec.hex.toBits(oldUnwrapBKey)
            )
          ),
          kA: keys.kA
        };
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
   * @param {Object} [options={}] Options
   *   @param {Boolean} [options.skipCaseError]
   *   If `true`, the request will skip the incorrect case error
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  FxAccountClient.prototype.accountDestroy = function(email, password, options) {
    var self = this;
    options = options || {};

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
                if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE && !options.skipCaseError) {
                  options.skipCaseError = true;

                  return self.accountDestroy(error.email, password, options);
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
    var data = {
      publicKey: publicKey,
      duration: duration
    };

    return hawkCredentials(sessionToken, 'sessionToken',  2 * 32)
      .then(function(creds) {
        return self.request.send('/certificate/sign', 'POST', creds, data);
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
      .then(function (credentials) {

        var oldCreds = credentials;

        return self._passwordChangeKeys(oldCreds)
          .then(function (keys) {

            return self._passwordChangeFinish(email, newPassword, oldCreds, keys);
        });
      });

  };

  /**
   * First step to change the password.
   *
   * @method passwordChangeStart
   * @private
   * @param {String} email
   * @param {String} oldPassword
   * @param {Object} [options={}] Options
   *   @param {Boolean} [options.skipCaseError]
   *   If `true`, the request will skip the incorrect case error
   * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText` and `oldUnwrapBKey`
   */
  FxAccountClient.prototype._passwordChangeStart = function(email, oldPassword, options) {
    var self = this;
    options = options || {};

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
              if (error && error.email && error.errno === ERRORS.INCORRECT_EMAIL_CASE && !options.skipCaseError) {
                options.skipCaseError = true;

                return self._passwordChangeStart(error.email, oldPassword, options);
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
   * @method _passwordChangeKeys
   * @private
   * @param {Object} oldCreds This object should consists of `oldUnwrapBKey`, `keyFetchToken` and `passwordChangeToken`.
   * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText`
   */
  FxAccountClient.prototype._passwordChangeKeys = function(oldCreds) {

    return this.accountKeys(oldCreds.keyFetchToken, oldCreds.oldUnwrapBKey);
  };

  /**
   * Third step to change the password.
   *
   * @method _passwordChangeFinish
   * @private
   * @param {String} email
   * @param {String} newPassword
   * @param {Object} oldCreds This object should consists of `oldUnwrapBKey`, `keyFetchToken` and `passwordChangeToken`.
   * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText`
   */
  FxAccountClient.prototype._passwordChangeFinish = function(email, newPassword, oldCreds, keys) {
    var self = this;
    var p1 = credentials.setup(email, newPassword);
    var p2 = hawkCredentials(oldCreds.passwordChangeToken, 'passwordChangeToken',  2 * 32);

    return P.all([p1, p2])
      .spread(function(newCreds, hawkCreds) {
        var newWrapKb = sjcl.codec.hex.fromBits(
          credentials.xor(
            sjcl.codec.hex.toBits(keys.kB),
            newCreds.unwrapBKey
          )
        );

        return self.request.send('/password/change/finish', 'POST', hawkCreds, {
          wrapKb: newWrapKb,
          authPW: sjcl.codec.hex.fromBits(newCreds.authPW)
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


