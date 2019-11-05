/* eslint-disable camelcase */
/* eslint-disable id-blacklist */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ES6Promise = require('es6-promise');
const sjcl = require('sjcl');
const credentials = require('./lib/credentials');
const ERRORS = require('./lib/errors');
const hawkCredentials = require('./lib/hawkCredentials');
const metricsContext = require('./lib/metricsContext');
const Request = require('./lib/request');

// polyfill ES6 promises on browsers that do not support them.
ES6Promise.polyfill();

var VERSION = 'v1';
var uriVersionRegExp = new RegExp('/' + VERSION + '$');
var HKDF_SIZE = 2 * 32;

function isUndefined(val) {
  return typeof val === 'undefined';
}

function isNull(val) {
  return val === null;
}

function isEmptyObject(val) {
  return (
    Object.prototype.toString.call(val) === '[object Object]' &&
    ! Object.keys(val).length
  );
}

function isEmptyString(val) {
  return val === '';
}

function required(val, name) {
  if (
    isUndefined(val) ||
    isNull(val) ||
    isEmptyObject(val) ||
    isEmptyString(val)
  ) {
    throw new Error('Missing ' + name);
  }
}

/**
 * @class FxAccountClient
 * @constructor
 * @param {String} uri Auth Server URI
 * @param {Object} config Configuration
 */
function FxAccountClient(uri, config) {
  if (! uri && ! config) {
    throw new Error(
      'Firefox Accounts auth server endpoint or configuration object required.'
    );
  }

  if (typeof uri !== 'string') {
    config = uri || {};
    uri = config.uri;
  }

  if (typeof config === 'undefined') {
    config = {};
  }

  if (! uri) {
    throw new Error('FxA auth server uri not set.');
  }

  if (! uriVersionRegExp.test(uri)) {
    uri = uri + '/' + VERSION;
  }

  this.request = new Request(uri, config.xhr, {
    localtimeOffsetMsec: config.localtimeOffsetMsec,
  });
}

FxAccountClient.VERSION = VERSION;

/**
 * @method signUp
 * @param {String} email Email input
 * @param {String} password Password input
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, calls the API with `?keys=true` to get the keyFetchToken
 *   @param {String} [options.service]
 *   Opaque alphanumeric token to be included in verification links
 *   @param {String} [options.redirectTo]
 *   a URL that the client should be redirected to after handling the request
 *   @param {String} [options.preVerified]
 *   set email to be verified if possible
 *   @param {String} [options.resume]
 *   Opaque url-encoded string that will be included in the verification link
 *   as a querystring parameter, useful for continuing an OAuth flow for
 *   example.
 *   @param {String} [options.lang]
 *   set the language for the 'Accept-Language' header
 *   @param {String} [options.style]
 *   Specify the style of confirmation emails
 *   @param {String} [options.verificationMethod]
 *   Specify the verification method to confirm the account with
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.signUp = function(email, password, options) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(password, 'password');

      return credentials.setup(email, password);
    })
    .then(function(result) {
      /*eslint complexity: [2, 13] */
      var endpoint = '/account/create';
      var data = {
        email: result.emailUTF8,
        authPW: sjcl.codec.hex.fromBits(result.authPW),
      };
      var requestOpts = {};

      if (options) {
        if (options.service) {
          data.service = options.service;
        }

        if (options.redirectTo) {
          data.redirectTo = options.redirectTo;
        }

        // preVerified is used for unit/functional testing
        if (options.preVerified) {
          data.preVerified = options.preVerified;
        }

        if (options.resume) {
          data.resume = options.resume;
        }

        if (options.keys) {
          endpoint += '?keys=true';
        }

        if (options.lang) {
          requestOpts.headers = {
            'Accept-Language': options.lang,
          };
        }

        if (options.metricsContext) {
          data.metricsContext = metricsContext.marshall(options.metricsContext);
        }

        if (options.style) {
          data.style = options.style;
        }

        if (options.verificationMethod) {
          data.verificationMethod = options.verificationMethod;
        }
      }

      return self.request
        .send(endpoint, 'POST', null, data, requestOpts)
        .then(function(accountData) {
          if (options && options.keys) {
            accountData.unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);
          }
          return accountData;
        });
    });
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
 *   @param {String} [options.service]
 *   Service being signed into
 *   @param {String} [options.reason]
 *   Reason for sign in. Can be one of: `signin`, `password_check`,
 *   `password_change`, `password_reset`
 *   @param {String} [options.redirectTo]
 *   a URL that the client should be redirected to after handling the request
 *   @param {String} [options.resume]
 *   Opaque url-encoded string that will be included in the verification link
 *   as a querystring parameter, useful for continuing an OAuth flow for
 *   example.
 *   @param {String} [options.originalLoginEmail]
 *   If retrying after an "incorrect email case" error, this specifies
 *   the email address as originally entered by the user.
 *   @param {String} [options.verificationMethod]
 *   Request a specific verification method be used for verifying the session,
 *   e.g. 'email-2fa' or 'totp-2fa'.
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 *   @param {String} [options.unblockCode]
 *   Login unblock code.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.signIn = function(email, password, options) {
  var self = this;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(password, 'password');

      return credentials.setup(email, password);
    })
    .then(function(result) {
      var endpoint = '/account/login';

      if (options.keys) {
        endpoint += '?keys=true';
      }

      var data = {
        email: result.emailUTF8,
        authPW: sjcl.codec.hex.fromBits(result.authPW),
      };

      if (options.metricsContext) {
        data.metricsContext = metricsContext.marshall(options.metricsContext);
      }

      if (options.reason) {
        data.reason = options.reason;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.resume) {
        data.resume = options.resume;
      }

      if (options.service) {
        data.service = options.service;
      }

      if (options.unblockCode) {
        data.unblockCode = options.unblockCode;
      }

      if (options.originalLoginEmail) {
        data.originalLoginEmail = options.originalLoginEmail;
      }

      if (options.verificationMethod) {
        data.verificationMethod = options.verificationMethod;
      }

      return self.request.send(endpoint, 'POST', null, data).then(
        function(accountData) {
          if (options.keys) {
            accountData.unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);
          }
          return accountData;
        },
        function(error) {
          if (
            error &&
            error.email &&
            error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
            ! options.skipCaseError
          ) {
            options.skipCaseError = true;
            options.originalLoginEmail = email;

            return self.signIn(error.email, password, options);
          } else {
            throw error;
          }
        }
      );
    });
};

/**
 * @method verifyCode
 * @param {String} uid Account ID
 * @param {String} code Verification code
 * @param {Object} [options={}] Options
 *   @param {String} [options.service]
 *   Service being signed into
 *   @param {String} [options.reminder]
 *   Reminder that was used to verify the account
 *   @param {String} [options.type]
 *   Type of code being verified, only supports `secondary` otherwise will verify account/sign-in
 *   @param {Boolean} [options.marketingOptIn]
 *   If `true`, notifies marketing of opt-in intent.
 *   @param {Array} [options.newsletters]
 *   Array of newsletters to opt into.
 *   @param {String} [options.style]
 *   Specify the style of email to send.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.verifyCode = function(uid, code, options) {
  var self = this;

  return Promise.resolve().then(function() {
    required(uid, 'uid');
    required(code, 'verify code');

    var data = {
      uid: uid,
      code: code,
    };

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.reminder) {
        data.reminder = options.reminder;
      }

      if (options.type) {
        data.type = options.type;
      }

      if (options.marketingOptIn) {
        data.marketingOptIn = true;
      }

      if (options.newsletters) {
        data.newsletters = options.newsletters;
      }

      if (options.style) {
        data.style = options.style;
      }
    }

    return self.request.send('/recovery_email/verify_code', 'POST', null, data);
  });
};

FxAccountClient.prototype.verifyTokenCode = function(sessionToken, uid, code) {
  var self = this;

  required(uid, 'uid');
  required(code, 'verify token code');
  required(sessionToken, 'sessionToken');

  return Promise.resolve()
    .then(function() {
      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        uid: uid,
        code: code,
      };

      return self.request.send('/session/verify/token', 'POST', creds, data);
    });
};

/**
 * @method recoveryEmailStatus
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.recoveryEmailStatus = function(sessionToken) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
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
 *   @param {String} [options.type]
 *   Specifies the type of code to send, currently only supported type is
 *   `upgradeSession`.
 *   @param {String} [options.lang]
 *   set the language for the 'Accept-Language' header
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.recoveryEmailResendCode = function(
  sessionToken,
  options
) {
  var self = this;
  var data = {};
  var requestOpts = {};

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      if (options) {
        if (options.email) {
          data.email = options.email;
        }

        if (options.service) {
          data.service = options.service;
        }

        if (options.redirectTo) {
          data.redirectTo = options.redirectTo;
        }

        if (options.resume) {
          data.resume = options.resume;
        }

        if (options.type) {
          data.type = options.type;
        }

        if (options.lang) {
          requestOpts.headers = {
            'Accept-Language': options.lang,
          };
        }

        if (options.style) {
          data.style = options.style;
        }
      }

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send(
        '/recovery_email/resend_code',
        'POST',
        creds,
        data,
        requestOpts
      );
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
 *   @param {String} [options.resume]
 *   Opaque url-encoded string that will be included in the verification link
 *   as a querystring parameter, useful for continuing an OAuth flow for
 *   example.
 *   @param {String} [options.lang]
 *   set the language for the 'Accept-Language' header
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.passwordForgotSendCode = function(email, options) {
  var self = this;
  var data = {
    email: email,
  };
  var requestOpts = {};

  return Promise.resolve().then(function() {
    required(email, 'email');

    if (options) {
      if (options.service) {
        data.service = options.service;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.resume) {
        data.resume = options.resume;
      }

      if (options.lang) {
        requestOpts.headers = {
          'Accept-Language': options.lang,
        };
      }

      if (options.metricsContext) {
        data.metricsContext = metricsContext.marshall(options.metricsContext);
      }
    }

    return self.request.send(
      '/password/forgot/send_code',
      'POST',
      null,
      data,
      requestOpts
    );
  });
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
 *   @param {String} [options.resume]
 *   Opaque url-encoded string that will be included in the verification link
 *   as a querystring parameter, useful for continuing an OAuth flow for
 *   example.
 *   @param {String} [options.lang]
 *   set the language for the 'Accept-Language' header
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.passwordForgotResendCode = function(
  email,
  passwordForgotToken,
  options
) {
  var self = this;
  var data = {
    email: email,
  };
  var requestOpts = {};

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(passwordForgotToken, 'passwordForgotToken');

      if (options) {
        if (options.service) {
          data.service = options.service;
        }

        if (options.redirectTo) {
          data.redirectTo = options.redirectTo;
        }

        if (options.resume) {
          data.resume = options.resume;
        }

        if (options.lang) {
          requestOpts.headers = {
            'Accept-Language': options.lang,
          };
        }
      }

      return hawkCredentials(
        passwordForgotToken,
        'passwordForgotToken',
        HKDF_SIZE
      );
    })
    .then(function(creds) {
      return self.request.send(
        '/password/forgot/resend_code',
        'POST',
        creds,
        data,
        requestOpts
      );
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
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.accountResetWithRecoveryKey] verifying code to be use in account recovery
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.passwordForgotVerifyCode = function(
  code,
  passwordForgotToken,
  options
) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(code, 'reset code');
      required(passwordForgotToken, 'passwordForgotToken');

      return hawkCredentials(
        passwordForgotToken,
        'passwordForgotToken',
        HKDF_SIZE
      );
    })
    .then(function(creds) {
      var data = {
        code: code,
      };

      if (options && options.accountResetWithRecoveryKey) {
        data.accountResetWithRecoveryKey = options.accountResetWithRecoveryKey;
      }

      return self.request.send(
        '/password/forgot/verify_code',
        'POST',
        creds,
        data
      );
    });
};

/**
 * Returns the status for the passwordForgotToken.
 * If the request returns a success response, the token has not yet been consumed.

 * @method passwordForgotStatus
 * @param {String} passwordForgotToken
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.passwordForgotStatus = function(passwordForgotToken) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(passwordForgotToken, 'passwordForgotToken');

      return hawkCredentials(
        passwordForgotToken,
        'passwordForgotToken',
        HKDF_SIZE
      );
    })
    .then(function(creds) {
      return self.request.send('/password/forgot/status', 'GET', creds);
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
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, a new `keyFetchToken` is provisioned. `options.sessionToken`
 *   is required if `options.keys` is true.
 *   @param {Boolean} [options.sessionToken]
 *   If `true`, a new `sessionToken` is provisioned.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.accountReset = function(
  email,
  newPassword,
  accountResetToken,
  options
) {
  var self = this;
  var data = {};
  var unwrapBKey;

  options = options || {};

  if (options.sessionToken) {
    data.sessionToken = options.sessionToken;
  }

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(newPassword, 'new password');
      required(accountResetToken, 'accountResetToken');

      if (options.keys) {
        required(options.sessionToken, 'sessionToken');
      }

      return credentials.setup(email, newPassword);
    })
    .then(function(result) {
      if (options.keys) {
        unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);
      }

      data.authPW = sjcl.codec.hex.fromBits(result.authPW);

      return hawkCredentials(accountResetToken, 'accountResetToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var queryParams = '';
      if (options.keys) {
        queryParams = '?keys=true';
      }

      var endpoint = '/account/reset' + queryParams;
      return self.request
        .send(endpoint, 'POST', creds, data)
        .then(function(accountData) {
          if (options.keys && accountData.keyFetchToken) {
            accountData.unwrapBKey = unwrapBKey;
          }

          return accountData;
        });
    });
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

  return Promise.resolve()
    .then(function() {
      required(keyFetchToken, 'keyFetchToken');
      required(oldUnwrapBKey, 'oldUnwrapBKey');

      return hawkCredentials(keyFetchToken, 'keyFetchToken', 3 * 32);
    })
    .then(function(creds) {
      var bundleKey = sjcl.codec.hex.fromBits(creds.bundleKey);

      return self.request
        .send('/account/keys', 'GET', creds)
        .then(function(payload) {
          return credentials.unbundleKeyFetchResponse(
            bundleKey,
            payload.bundle
          );
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
        kA: keys.kA,
      };
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
 * @param {String} sessionToken User session token
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.accountDestroy = function(
  email,
  password,
  options,
  sessionToken
) {
  var self = this;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(password, 'password');

      var defers = [credentials.setup(email, password)];
      if (sessionToken) {
        defers.push(hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE));
      }

      return Promise.all(defers);
    })
    .then(function(results) {
      var auth = results[0];
      var creds = results[1];
      var data = {
        email: auth.emailUTF8,
        authPW: sjcl.codec.hex.fromBits(auth.authPW),
      };

      return self.request.send('/account/destroy', 'POST', creds, data).then(
        function(response) {
          return response;
        },
        function(error) {
          // if incorrect email case error
          if (
            error &&
            error.email &&
            error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
            ! options.skipCaseError
          ) {
            options.skipCaseError = true;

            return self.accountDestroy(
              error.email,
              password,
              options,
              sessionToken
            );
          } else {
            throw error;
          }
        }
      );
    });
};

/**
 * Gets the status of an account by uid.
 *
 * @method accountStatus
 * @param {String} uid User account id
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.accountStatus = function(uid) {
  var self = this;

  return Promise.resolve().then(function() {
    required(uid, 'uid');

    return self.request.send('/account/status?uid=' + uid, 'GET');
  });
};

/**
 * Gets the status of an account by email.
 *
 * @method accountStatusByEmail
 * @param {String} email User account email
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.accountStatusByEmail = function(email) {
  var self = this;

  return Promise.resolve().then(function() {
    required(email, 'email');

    return self.request.send('/account/status', 'POST', null, {
      email: email,
    });
  });
};

/**
 * Gets the account profile
 *
 * @method accountProfile
 * @param {String} sessionToken User session token
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.accountProfile = function(sessionToken) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/account/profile', 'GET', creds);
    });
};

/**
 * Gets aggregated account data, to be used instead of making
 * multiple calls to disparate `/status` endpoints.
 *
 * @method account
 * @param {String} sessionToken User session token
 * @return {Promise} A promise that will be fulfilled with JSON
 */
FxAccountClient.prototype.account = function(sessionToken) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/account', 'GET', creds);
    });
};

/**
 * Destroys this session, by invalidating the sessionToken.
 *
 * @method sessionDestroy
 * @param {String} sessionToken User session token
 * @param {Object} [options={}] Options
 *   @param {String} [options.customSessionToken] Override which session token to destroy for this same user
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessionDestroy = function(sessionToken, options) {
  var self = this;
  var data = {};
  options = options || {};

  if (options.customSessionToken) {
    data.customSessionToken = options.customSessionToken;
  }

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/session/destroy', 'POST', creds, data);
    });
};

/**
 * Responds successfully if the session status is valid, requires the sessionToken.
 *
 * @method sessionStatus
 * @param {String} sessionToken User session token
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessionStatus = function(sessionToken) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/session/status', 'GET', creds);
    });
};

/**
 * Verifies an account and a session using a short code that is based on otp.
 *
 * @method sessionVerifyCode
 * @param {String} sessionToken User session token
 * @param {String} code Code to be verified
 * @param {Object} [options={}] Options
 *   @param {String} [options.service]
 *   Service being used
 *   @param {Boolean} [options.marketingOptIn]
 *   If `true`, notifies marketing of opt-in intent.
 *   @param {Array} [options.newsletters]
 *   Array of newsletters to opt into.
 *   @param {String} [options.style]
 *   Specify the style of email to send.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessionVerifyCode = function(
  sessionToken,
  code,
  options
) {
  var self = this;

  required(sessionToken, 'sessionToken');
  required(code, 'code');

  var data = {
    code: code,
  };
  options = options || {};

  if (options.service) {
    data.service = options.service;
  }

  if (options.marketingOptIn) {
    data.marketingOptIn = options.marketingOptIn;
  }

  if (options.newsletters) {
    data.newsletters = options.newsletters;
  }

  if (options.style) {
    data.style = options.style;
  }

  return Promise.resolve()
    .then(function() {
      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/session/verify_code', 'POST', creds, data);
    });
};

/**
 * Resends the short code that can verify the account and session.
 *
 * @method sessionResendVerifyCode
 * @param {String} sessionToken User session token
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessionResendVerifyCode = function(sessionToken) {
  var self = this;
  required(sessionToken, 'sessionToken');

  return Promise.resolve()
    .then(function() {
      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send('/session/resend_code', 'POST', creds, {});
    });
};

/**
 * @method sessionReauth
 * @param {String} sessionToken sessionToken obtained from signIn
 * @param {String} email Email input
 * @param {String} password Password input
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, calls the API with `?keys=true` to get the keyFetchToken
 *   @param {Boolean} [options.skipCaseError]
 *   If `true`, the request will skip the incorrect case error
 *   @param {String} [options.service]
 *   Service being accessed that needs reauthentication
 *   @param {String} [options.reason]
 *   Reason for reauthentication. Can be one of: `signin`, `password_check`,
 *   `password_change`, `password_reset`
 *   @param {String} [options.redirectTo]
 *   a URL that the client should be redirected to after handling the request
 *   @param {String} [options.resume]
 *   Opaque url-encoded string that will be included in the verification link
 *   as a querystring parameter, useful for continuing an OAuth flow for
 *   example.
 *   @param {String} [options.originalLoginEmail]
 *   If retrying after an "incorrect email case" error, this specifies
 *   the email address as originally entered by the user.
 *   @param {String} [options.verificationMethod]
 *   Request a specific verification method be used for verifying the session,
 *   e.g. 'email-2fa' or 'totp-2fa'.
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 *   @param {String} [options.unblockCode]
 *   Login unblock code.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessionReauth = function(
  sessionToken,
  email,
  password,
  options
) {
  var self = this;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(email, 'email');
      required(password, 'password');

      return credentials.setup(email, password);
    })
    .then(function(result) {
      var endpoint = '/session/reauth';

      if (options.keys) {
        endpoint += '?keys=true';
      }

      var data = {
        email: result.emailUTF8,
        authPW: sjcl.codec.hex.fromBits(result.authPW),
      };

      if (options.metricsContext) {
        data.metricsContext = metricsContext.marshall(options.metricsContext);
      }

      if (options.reason) {
        data.reason = options.reason;
      }

      if (options.redirectTo) {
        data.redirectTo = options.redirectTo;
      }

      if (options.resume) {
        data.resume = options.resume;
      }

      if (options.service) {
        data.service = options.service;
      }

      if (options.unblockCode) {
        data.unblockCode = options.unblockCode;
      }

      if (options.originalLoginEmail) {
        data.originalLoginEmail = options.originalLoginEmail;
      }

      if (options.verificationMethod) {
        data.verificationMethod = options.verificationMethod;
      }

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE)
        .then(function(creds) {
          return self.request.send(endpoint, 'POST', creds, data);
        })
        .then(
          function(accountData) {
            if (options.keys) {
              accountData.unwrapBKey = sjcl.codec.hex.fromBits(
                result.unwrapBKey
              );
            }
            return accountData;
          },
          function(error) {
            if (
              error &&
              error.email &&
              error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
              ! options.skipCaseError
            ) {
              options.skipCaseError = true;
              options.originalLoginEmail = email;

              return self.sessionReauth(
                sessionToken,
                error.email,
                password,
                options
              );
            } else {
              throw error;
            }
          }
        );
    });
};

/**
 * Sign a BrowserID public key
 *
 * @method certificateSign
 * @param {String} sessionToken User session token
 * @param {Object} publicKey The key to sign
 * @param {int} duration Time interval from now when the certificate will expire in milliseconds
 * @param {Object} [options={}] Options
 *   @param {String} [service=''] The requesting service, sent via the query string
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.certificateSign = function(
  sessionToken,
  publicKey,
  duration,
  options
) {
  var self = this;
  var data = {
    publicKey: publicKey,
    duration: duration,
  };

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(publicKey, 'publicKey');
      required(duration, 'duration');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      options = options || {};

      var queryString = '';
      if (options.service) {
        queryString = '?service=' + encodeURIComponent(options.service);
      }

      return self.request.send(
        '/certificate/sign' + queryString,
        'POST',
        creds,
        data
      );
    });
};

/**
 * Change the password from one known value to another.
 *
 * @method passwordChange
 * @param {String} email
 * @param {String} oldPassword
 * @param {String} newPassword
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, calls the API with `?keys=true` to get a new keyFetchToken
 *   @param {String} [options.sessionToken]
 *   If a `sessionToken` is passed, a new sessionToken will be returned
 *   with the same `verified` status as the existing sessionToken.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.passwordChange = function(
  email,
  oldPassword,
  newPassword,
  options
) {
  var self = this;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(oldPassword, 'old password');
      required(newPassword, 'new password');

      return self._passwordChangeStart(email, oldPassword);
    })
    .then(function(credentials) {
      var oldCreds = credentials;
      var emailToHashWith = credentials.emailToHashWith || email;

      return self._passwordChangeKeys(oldCreds).then(function(keys) {
        return self._passwordChangeFinish(
          emailToHashWith,
          newPassword,
          oldCreds,
          keys,
          options
        );
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
FxAccountClient.prototype._passwordChangeStart = function(
  email,
  oldPassword,
  options
) {
  var self = this;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(oldPassword, 'old password');

      return credentials.setup(email, oldPassword);
    })
    .then(function(oldCreds) {
      var data = {
        email: oldCreds.emailUTF8,
        oldAuthPW: sjcl.codec.hex.fromBits(oldCreds.authPW),
      };

      return self.request
        .send('/password/change/start', 'POST', null, data)
        .then(
          function(passwordData) {
            passwordData.oldUnwrapBKey = sjcl.codec.hex.fromBits(
              oldCreds.unwrapBKey
            );

            // Similar to password reset, this keeps the contract that we always
            // hash passwords with the original account email.
            passwordData.emailToHashWith = email;
            return passwordData;
          },
          function(error) {
            // if incorrect email case error
            if (
              error &&
              error.email &&
              error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
              ! options.skipCaseError
            ) {
              options.skipCaseError = true;

              return self._passwordChangeStart(
                error.email,
                oldPassword,
                options
              );
            } else {
              throw error;
            }
          }
        );
    });
};

function checkCreds(creds) {
  required(creds, 'credentials');
  required(creds.oldUnwrapBKey, 'credentials.oldUnwrapBKey');
  required(creds.keyFetchToken, 'credentials.keyFetchToken');
  required(creds.passwordChangeToken, 'credentials.passwordChangeToken');
}

/**
 * Second step to change the password.
 *
 * @method _passwordChangeKeys
 * @private
 * @param {Object} oldCreds This object should consists of `oldUnwrapBKey`, `keyFetchToken` and `passwordChangeToken`.
 * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText`
 */
FxAccountClient.prototype._passwordChangeKeys = function(oldCreds) {
  var self = this;

  return Promise.resolve()
    .then(function() {
      checkCreds(oldCreds);
    })
    .then(function() {
      return self.accountKeys(oldCreds.keyFetchToken, oldCreds.oldUnwrapBKey);
    });
};

/**
 * Third step to change the password.
 *
 * @method _passwordChangeFinish
 * @private
 * @param {String} email
 * @param {String} newPassword
 * @param {Object} oldCreds This object should consists of `oldUnwrapBKey`, `keyFetchToken` and `passwordChangeToken`.
 * @param {Object} keys This object should contain the unbundled keys
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, calls the API with `?keys=true` to get the keyFetchToken
 *   @param {String} [options.sessionToken]
 *   If a `sessionToken` is passed, a new sessionToken will be returned
 *   with the same `verified` status as the existing sessionToken.
 * @return {Promise} A promise that will be fulfilled with JSON of `xhr.responseText`
 */
FxAccountClient.prototype._passwordChangeFinish = function(
  email,
  newPassword,
  oldCreds,
  keys,
  options
) {
  options = options || {};
  var self = this;

  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(newPassword, 'new password');
      checkCreds(oldCreds);
      required(keys, 'keys');
      required(keys.kB, 'keys.kB');

      var defers = [];
      defers.push(credentials.setup(email, newPassword));
      defers.push(
        hawkCredentials(
          oldCreds.passwordChangeToken,
          'passwordChangeToken',
          HKDF_SIZE
        )
      );

      if (options.sessionToken) {
        // Unbundle session data to get session id
        defers.push(
          hawkCredentials(options.sessionToken, 'sessionToken', HKDF_SIZE)
        );
      }

      return Promise.all(defers);
    })
    .then(function(results) {
      var newCreds = results[0];
      var hawkCreds = results[1];
      var sessionData = results[2];
      var newWrapKb = sjcl.codec.hex.fromBits(
        credentials.xor(sjcl.codec.hex.toBits(keys.kB), newCreds.unwrapBKey)
      );

      var queryParams = '';
      if (options.keys) {
        queryParams = '?keys=true';
      }

      var sessionTokenId;
      if (sessionData && sessionData.id) {
        sessionTokenId = sessionData.id;
      }

      return self.request
        .send('/password/change/finish' + queryParams, 'POST', hawkCreds, {
          wrapKb: newWrapKb,
          authPW: sjcl.codec.hex.fromBits(newCreds.authPW),
          sessionToken: sessionTokenId,
        })
        .then(function(accountData) {
          if (options.keys && accountData.keyFetchToken) {
            accountData.unwrapBKey = sjcl.codec.hex.fromBits(
              newCreds.unwrapBKey
            );
          }
          return accountData;
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

/**
 * Add a new device
 *
 * @method deviceRegister
 * @param {String} sessionToken User session token
 * @param {String} deviceName Name of device
 * @param {String} deviceType Type of device (mobile|desktop)
 * @param {Object} [options={}] Options
 *   @param {string} [options.deviceCallback] Device's push endpoint.
 *   @param {string} [options.devicePublicKey] Public key used to encrypt push messages.
 *   @param {string} [options.deviceAuthKey] Authentication secret used to encrypt push messages.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.deviceRegister = function(
  sessionToken,
  deviceName,
  deviceType,
  options
) {
  var request = this.request;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(deviceName, 'deviceName');
      required(deviceType, 'deviceType');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        name: deviceName,
        type: deviceType,
      };

      if (options.deviceCallback) {
        data.pushCallback = options.deviceCallback;
      }

      if (options.devicePublicKey && options.deviceAuthKey) {
        data.pushPublicKey = options.devicePublicKey;
        data.pushAuthKey = options.deviceAuthKey;
      }

      return request.send('/account/device', 'POST', creds, data);
    });
};

/**
 * Update the name of an existing device
 *
 * @method deviceUpdate
 * @param {String} sessionToken User session token
 * @param {String} deviceId User-unique identifier of device
 * @param {String} deviceName Name of device
 * @param {Object} [options={}] Options
 *   @param {string} [options.deviceCallback] Device's push endpoint.
 *   @param {string} [options.devicePublicKey] Public key used to encrypt push messages.
 *   @param {string} [options.deviceAuthKey] Authentication secret used to encrypt push messages.
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.deviceUpdate = function(
  sessionToken,
  deviceId,
  deviceName,
  options
) {
  var request = this.request;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(deviceId, 'deviceId');
      required(deviceName, 'deviceName');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        id: deviceId,
        name: deviceName,
      };

      if (options.deviceCallback) {
        data.pushCallback = options.deviceCallback;
      }

      if (options.devicePublicKey && options.deviceAuthKey) {
        data.pushPublicKey = options.devicePublicKey;
        data.pushAuthKey = options.deviceAuthKey;
      }

      return request.send('/account/device', 'POST', creds, data);
    });
};

/**
 * Unregister an existing device
 *
 * @method deviceDestroy
 * @param {String} sessionToken Session token obtained from signIn
 * @param {String} deviceId User-unique identifier of device
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.deviceDestroy = function(sessionToken, deviceId) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(deviceId, 'deviceId');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        id: deviceId,
      };

      return request.send('/account/device/destroy', 'POST', creds, data);
    });
};

/**
 * Get a list of all devices for a user
 *
 * @method deviceList
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.deviceList = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/account/devices', 'GET', creds);
    });
};

/**
 * Get a list of user's sessions
 *
 * @method sessions
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sessions = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/account/sessions', 'GET', creds);
    });
};

/**
 * Get a list of user's security events
 *
 * @method securityEvents
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.securityEvents = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/securityEvents', 'GET', creds);
    });
};

/**
 * Delete user's security events
 *
 * @method deleteSecurityEvents
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.deleteSecurityEvents = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/securityEvents', 'DELETE', creds, {});
    });
};

/**
 * Get a list of user's attached clients
 *
 * @method attachedClients
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.attachedClients = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/account/attached_clients', 'GET', creds);
    });
};

/**
 * Destroys all tokens held by an attached client.
 *
 * @method attachedClientDestroy
 * @param {String} sessionToken User session token
 * @param {Object} clientInfo Attached client info, as returned by `attachedClients` method
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.attachedClientDestroy = function(
  sessionToken,
  clientInfo
) {
  var self = this;
  var data = {
    clientId: clientInfo.clientId,
    deviceId: clientInfo.deviceId,
    refreshTokenId: clientInfo.refreshTokenId,
    sessionTokenId: clientInfo.sessionTokenId,
  };

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send(
        '/account/attached_client/destroy',
        'POST',
        creds,
        data
      );
    });
};

/**
 * Get a list of user's attached clients
 *
 * @method attachedClients
 * @param {String} sessionToken sessionToken obtained from signIn
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.attachedClients = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/account/attached_clients', 'GET', creds);
    });
};

/**
 * Destroys all tokens held by an attached client.
 *
 * @method attachedClientDestroy
 * @param {String} sessionToken User session token
 * @param {Object} clientInfo Attached client info, as returned by `attachedClients` method
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.attachedClientDestroy = function(
  sessionToken,
  clientInfo
) {
  var self = this;
  var data = {
    clientId: clientInfo.clientId,
    deviceId: clientInfo.deviceId,
    refreshTokenId: clientInfo.refreshTokenId,
    sessionTokenId: clientInfo.sessionTokenId,
  };

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return self.request.send(
        '/account/attached_client/destroy',
        'POST',
        creds,
        data
      );
    });
};

/**
 * Send an unblock code
 *
 * @method sendUnblockCode
 * @param {String} email email where to send the login authorization code
 * @param {Object} [options={}] Options
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.sendUnblockCode = function(email, options) {
  var self = this;

  return Promise.resolve().then(function() {
    required(email, 'email');

    var data = {
      email: email,
    };

    if (options && options.metricsContext) {
      data.metricsContext = metricsContext.marshall(options.metricsContext);
    }

    return self.request.send(
      '/account/login/send_unblock_code',
      'POST',
      null,
      data
    );
  });
};

/**
 * Reject a login unblock code. Code will be deleted from the server
 * and will not be able to be used again.
 *
 * @method rejectLoginAuthorizationCode
 * @param {String} uid Account ID
 * @param {String} unblockCode unblock code
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
FxAccountClient.prototype.rejectUnblockCode = function(uid, unblockCode) {
  var self = this;

  return Promise.resolve().then(function() {
    required(uid, 'uid');
    required(unblockCode, 'unblockCode');

    var data = {
      uid: uid,
      unblockCode: unblockCode,
    };

    return self.request.send(
      '/account/login/reject_unblock_code',
      'POST',
      null,
      data
    );
  });
};

/**
 * Send an sms.
 *
 * @method sendSms
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} phoneNumber Phone number sms will be sent to
 * @param {String} messageId Corresponding message id that will be sent
 * @param {Object} [options={}] Options
 *   @param {String} [options.lang] Language that sms will be sent in
 *   @param {Array} [options.features] Array of features to be enabled for the request
 *   @param {Object} [options.metricsContext={}] Metrics context metadata
 *     @param {String} options.metricsContext.deviceId identifier for the current device
 *     @param {String} options.metricsContext.flowId identifier for the current event flow
 *     @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *     @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *     @param {Number} options.metricsContext.utmContent content identifier
 *     @param {Number} options.metricsContext.utmMedium acquisition medium
 *     @param {Number} options.metricsContext.utmSource traffic source
 *     @param {Number} options.metricsContext.utmTerm search terms
 */
FxAccountClient.prototype.sendSms = function(
  sessionToken,
  phoneNumber,
  messageId,
  options
) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(phoneNumber, 'phoneNumber');
      required(messageId, 'messageId');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        phoneNumber: phoneNumber,
        messageId: messageId,
      };
      var requestOpts = {};

      if (options) {
        if (options.lang) {
          requestOpts.headers = {
            'Accept-Language': options.lang,
          };
        }

        if (options.features) {
          data.features = options.features;
        }

        if (options.metricsContext) {
          data.metricsContext = metricsContext.marshall(options.metricsContext);
        }
      }

      return request.send('/sms', 'POST', creds, data, requestOpts);
    });
};

/**
 * Get SMS status for the current user.
 *
 * @method smsStatus
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {Object} [options={}] Options
 *   @param {String} [options.country] country Country to force for testing.
 */
FxAccountClient.prototype.smsStatus = function(sessionToken, options) {
  var request = this.request;
  options = options || {};

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var url = '/sms/status';
      if (options.country) {
        url += '?country=' + encodeURIComponent(options.country);
      }
      return request.send(url, 'GET', creds);
    });
};

/**
 * Consume a signinCode.
 *
 * @method consumeSigninCode
 * @param {String} code The signinCode entered by the user
 * @param {String} flowId Identifier for the current event flow
 * @param {Number} flowBeginTime Timestamp for the flow.begin event
 * @param {String} [deviceId] Identifier for the current device
 */
FxAccountClient.prototype.consumeSigninCode = function(
  code,
  flowId,
  flowBeginTime,
  deviceId
) {
  var self = this;

  return Promise.resolve().then(function() {
    required(code, 'code');
    required(flowId, 'flowId');
    required(flowBeginTime, 'flowBeginTime');

    return self.request.send('/signinCodes/consume', 'POST', null, {
      code: code,
      metricsContext: {
        deviceId: deviceId,
        flowId: flowId,
        flowBeginTime: flowBeginTime,
      },
    });
  });
};

/**
 * Get the recovery emails associated with the signed in account.
 *
 * @method recoveryEmails
 * @param {String} sessionToken SessionToken obtained from signIn
 */
FxAccountClient.prototype.recoveryEmails = function(sessionToken) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/recovery_emails', 'GET', creds);
    });
};

/**
 * Create a new recovery email for the signed in account.
 *
 * @method recoveryEmailCreate
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} email new email to be added
 */
FxAccountClient.prototype.recoveryEmailCreate = function(sessionToken, email) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(sessionToken, 'email');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        email: email,
      };

      return request.send('/recovery_email', 'POST', creds, data);
    });
};

/**
 * Remove the recovery email for the signed in account.
 *
 * @method recoveryEmailDestroy
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} email email to be removed
 */
FxAccountClient.prototype.recoveryEmailDestroy = function(sessionToken, email) {
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(sessionToken, 'email');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        email: email,
      };

      return request.send('/recovery_email/destroy', 'POST', creds, data);
    });
};

/**
 * Changes user's primary email address.
 *
 * @method recoveryEmailSetPrimaryEmail
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} email Email that will be the new primary email for user
 */
FxAccountClient.prototype.recoveryEmailSetPrimaryEmail = function(
  sessionToken,
  email
) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        email: email,
      };
      return request.send('/recovery_email/set_primary', 'POST', creds, data);
    });
};

/**
 * Creates a new TOTP token for the user associated with this session.
 *
 * @method createTotpToken
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {Object} [options.metricsContext={}] Metrics context metadata
 *   @param {String} options.metricsContext.deviceId identifier for the current device
 *   @param {String} options.metricsContext.flowId identifier for the current event flow
 *   @param {Number} options.metricsContext.flowBeginTime flow.begin event time
 *   @param {Number} options.metricsContext.utmCampaign marketing campaign identifier
 *   @param {Number} options.metricsContext.utmContent content identifier
 *   @param {Number} options.metricsContext.utmMedium acquisition medium
 *   @param {Number} options.metricsContext.utmSource traffic source
 *   @param {Number} options.metricsContext.utmTerm search terms
 */
FxAccountClient.prototype.createTotpToken = function(sessionToken, options) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {};

      if (options && options.metricsContext) {
        data.metricsContext = metricsContext.marshall(options.metricsContext);
      }

      return request.send('/totp/create', 'POST', creds, data);
    });
};

/**
 * Deletes this user's TOTP token.
 *
 * @method deleteTotpToken
 * @param {String} sessionToken SessionToken obtained from signIn
 */
FxAccountClient.prototype.deleteTotpToken = function(sessionToken) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/totp/destroy', 'POST', creds, {});
    });
};

/**
 * Check to see if the current user has a TOTP token associated with
 * their account.
 *
 * @method checkTotpTokenExists
 * @param {String} sessionToken SessionToken obtained from signIn
 */
FxAccountClient.prototype.checkTotpTokenExists = function(sessionToken) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/totp/exists', 'GET', creds);
    });
};

/**
 * Verify tokens if using a valid TOTP code.
 *
 * @method verifyTotpCode
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} code TOTP code to verif
 * @param {String} [options.service] Service being used
 */
FxAccountClient.prototype.verifyTotpCode = function(
  sessionToken,
  code,
  options
) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(code, 'code');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        code: code,
      };

      if (options && options.service) {
        data.service = options.service;
      }

      return request.send('/session/verify/totp', 'POST', creds, data);
    });
};

/**
 * Replace user's recovery codes.
 *
 * @method replaceRecoveryCodes
 * @param {String} sessionToken SessionToken obtained from signIn
 */
FxAccountClient.prototype.replaceRecoveryCodes = function(sessionToken) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/recoveryCodes', 'GET', creds);
    });
};

/**
 * Consume recovery code.
 *
 * @method consumeRecoveryCode
 * @param {String} sessionToken SessionToken obtained from signIn
 * @param {String} code recovery code
 */
FxAccountClient.prototype.consumeRecoveryCode = function(sessionToken, code) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(code, 'code');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        code: code,
      };

      return request.send('/session/verify/recoveryCode', 'POST', creds, data);
    });
};

/**
 * Creates a new recovery key for the account. The recovery key contains encrypted
 * data the corresponds the the accounts current `kB`. This data can be used during
 * the password reset process to avoid regenerating the `kB`.
 *
 * @param sessionToken
 * @param recoveryKeyId The recoveryKeyId that can be used to retrieve saved bundle
 * @param bundle The encrypted recovery bundle to store
 * @returns {Promise} A promise that will be fulfilled with decoded recovery data (`kB`)
 */
FxAccountClient.prototype.createRecoveryKey = function(
  sessionToken,
  recoveryKeyId,
  bundle
) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(recoveryKeyId, 'recoveryKeyId');
      required(bundle, 'bundle');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      var data = {
        recoveryKeyId: recoveryKeyId,
        recoveryData: bundle,
      };

      return request.send('/recoveryKey', 'POST', creds, data);
    });
};

/**
 * Retrieves the encrypted recovery data that corresponds to the recovery key which
 * then gets decoded into the stored `kB`.
 *
 * @param accountResetToken
 * @param recoveryKeyId The recovery key id to retrieve encrypted bundle
 * @returns {Promise} A promise that will be fulfilled with decoded recovery data (`kB`)
 */
FxAccountClient.prototype.getRecoveryKey = function(
  accountResetToken,
  recoveryKeyId
) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(accountResetToken, 'accountResetToken');
      required(recoveryKeyId, 'recoveryKeyId');

      return hawkCredentials(accountResetToken, 'accountResetToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/recoveryKey/' + recoveryKeyId, 'GET', creds);
    });
};

/**
 * Reset a user's account using keys (kB) derived from a recovery key. This
 * process can be used to maintain the account's original kB.
 *
 * @param accountResetToken The account reset token
 * @param email The current email of the account
 * @param newPassword The new password of the account
 * @param recoveryKeyId The recovery key id used for account recovery
 * @param keys Keys used to create the new wrapKb
 * @param {Object} [options={}] Options
 *   @param {Boolean} [options.keys]
 *   If `true`, a new `keyFetchToken` is provisioned. `options.sessionToken`
 *   is required if `options.keys` is true.
 *   @param {Boolean} [options.sessionToken]
 *   If `true`, a new `sessionToken` is provisioned.
 * @returns {Promise} A promise that will be fulfilled with updated account data
 */
FxAccountClient.prototype.resetPasswordWithRecoveryKey = function(
  accountResetToken,
  email,
  newPassword,
  recoveryKeyId,
  keys,
  options
) {
  options = options || {};
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(email, 'email');
      required(newPassword, 'new password');
      required(keys, 'keys');
      required(keys.kB, 'keys.kB');
      required(accountResetToken, 'accountResetToken');
      required(recoveryKeyId, 'recoveryKeyId');

      var defers = [];
      defers.push(credentials.setup(email, newPassword));
      defers.push(
        hawkCredentials(accountResetToken, 'accountResetToken', HKDF_SIZE)
      );

      return Promise.all(defers);
    })
    .then(function(results) {
      var newCreds = results[0];
      var hawkCreds = results[1];
      var newWrapKb = sjcl.codec.hex.fromBits(
        credentials.xor(sjcl.codec.hex.toBits(keys.kB), newCreds.unwrapBKey)
      );

      var data = {
        wrapKb: newWrapKb,
        authPW: sjcl.codec.hex.fromBits(newCreds.authPW),
        recoveryKeyId: recoveryKeyId,
      };

      if (options.sessionToken) {
        data.sessionToken = options.sessionToken;
      }

      if (options.keys) {
        required(options.sessionToken, 'sessionToken');
      }

      var queryParams = '';
      if (options.keys) {
        queryParams = '?keys=true';
      }

      return request
        .send('/account/reset' + queryParams, 'POST', hawkCreds, data)
        .then(function(accountData) {
          if (options.keys && accountData.keyFetchToken) {
            accountData.unwrapBKey = sjcl.codec.hex.fromBits(
              newCreds.unwrapBKey
            );
          }
          return accountData;
        });
    });
};

/**
 * Deletes the recovery key associated with this user.
 *
 * @param sessionToken
 */
FxAccountClient.prototype.deleteRecoveryKey = function(sessionToken) {
  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/recoveryKey', 'DELETE', creds, {});
    });
};

/**
 * This checks to see if a recovery key exists for a user. This check
 * can be performed with either a sessionToken or an email.
 *
 * Typically, sessionToken is used when checking from within the `/settings`
 * view. If it exists, we can give the user an option to revoke the key.
 *
 * Checking with an email is typically performed during the password reset
 * flow. It is used to decide whether or not we can redirect a user to
 * the `Reset password with recovery key` page or regular password reset page.
 *
 * @param sessionToken
 * @param {String} email User's email
 * @returns {Promise} A promise that will be fulfilled with whether or not account has recovery ket
 */
FxAccountClient.prototype.recoveryKeyExists = function(sessionToken, email) {
  var request = this.request;
  return Promise.resolve().then(function() {
    if (sessionToken) {
      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE).then(
        function(creds) {
          return request.send('/recoveryKey/exists', 'POST', creds, {});
        }
      );
    }

    return request.send('/recoveryKey/exists', 'POST', null, {
      email: email,
    });
  });
};

/**
 * Create an OAuth code using `sessionToken`
 *
 * @param {String} sessionToken
 * @param {String} clientId
 * @param {String} state
 * @param {Object} [options={}] Options
 *   @param {String} [options.access_type=online] if `accessType=offline`, a refresh token
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
FxAccountClient.prototype.createOAuthCode = function(
  sessionToken,
  clientId,
  state,
  options
) {
  options = options || {};

  var params = {
    access_type: options.access_type,
    acr_values: options.acr_values,
    client_id: clientId,
    code_challenge: options.code_challenge,
    code_challenge_method: options.code_challenge_method,
    keys_jwe: options.keys_jwe,
    redirect_uri: options.redirect_uri,
    response_type: options.response_type,
    scope: options.scope,
    state: state,
  };
  var request = this.request;

  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(clientId, 'clientId');
      required(state, 'state');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/oauth/authorization', 'POST', creds, params);
    });
};

/**
 * Create an OAuth token using `sessionToken`
 *
 * @param {String} sessionToken
 * @param {String} clientId
 * @param {Object} [options={}] Options
 *   @param {String} [options.access_type=online] if `accessType=offline`, a refresh token
 *     will be issued when trading the code for an access token.
 *   @param {String} [options.scope] requested scopes
 *   @param {Number} [options.ttl] time to live, in seconds
 * @returns {Promise} A promise that will be fulfilled with:
 *   - `access_token` - The access token
 *   - `refresh_token` - A refresh token, if `options.accessType=offline`
 *   - `id_token` - an OIDC ID token, returned if `scope` includes `openid`
 *   - `scope` - Requested scopes
 *   - `auth_at` - Time the user authenticated
 *   - `token_type` - The string `bearer`
 *   - `expires_in` - Time at which the token expires
 */
FxAccountClient.prototype.createOAuthToken = function(
  sessionToken,
  clientId,
  options
) {
  options = options || {};

  var params = {
    grant_type: 'fxa-credentials',
    access_type: options.access_type,
    client_id: clientId,
    scope: options.scope,
    ttl: options.ttl,
  };

  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(clientId, 'clientId');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/oauth/token', 'POST', creds, params);
    });
};

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
FxAccountClient.prototype.getOAuthScopedKeyData = function(
  sessionToken,
  clientId,
  scope
) {
  var params = {
    client_id: clientId,
    scope: scope,
  };

  var request = this.request;
  return Promise.resolve()
    .then(function() {
      required(sessionToken, 'sessionToken');
      required(clientId, 'clientId');
      required(scope, 'scope');

      return hawkCredentials(sessionToken, 'sessionToken', HKDF_SIZE);
    })
    .then(function(creds) {
      return request.send('/account/scoped-key-data', 'POST', creds, params);
    });
};

/**
 * Get the list of SubHub plans from the auth server.
 *
 * @param {String} token An access token from the OAuth server.
 * @returns {Promise} A promise that will be fulfilled with a list of subscription plans from SubHub.
 */
FxAccountClient.prototype.getSubscriptionPlans = function(token) {
  var self = this;

  return Promise.resolve().then(function() {
    required(token, 'token');
    const requestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return self.request.send(
      '/oauth/subscriptions/plans',
      'GET',
      null,
      null,
      requestOptions
    );
  });
};

/**
 * Get a user's list of active subscriptions.
 *
 * @param {String} token A token from the OAuth server.
 * @returns {Promise} A promise that will be fulfilled with a list of active
 * subscriptions.
 */
FxAccountClient.prototype.getActiveSubscriptions = function(token) {
  var self = this;

  return Promise.resolve().then(function() {
    required(token, 'token');
    const requestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return self.request.send(
      '/oauth/subscriptions/active',
      'GET',
      null,
      null,
      requestOptions
    );
  });
};

/**
 * Submit a support ticket.
 *
 * @param {String} authorizationHeader A token from the OAuth server.
 * @param {Object} [supportTicket={}]
 *   @param {String} [supportTicket.topic]
 *   @param {String} [supportTicket.subject] Optional subject
 *   @param {String} [supportTicket.message]
 * @returns {Promise} A promise that will be fulfilled with:
 *   - `success`
 *   - `ticket` OR `error`
 */
FxAccountClient.prototype.createSupportTicket = function(token, supportTicket) {
  var self = this;

  return Promise.resolve().then(function() {
    required(token, 'token');
    required(supportTicket, 'supportTicket');
    const requestOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return self.request.send(
      '/support/ticket',
      'POST',
      null,
      supportTicket,
      requestOptions
    );
  });
};

/**
 * Check for a required argument. Exposed for unit testing.
 *
 * @param {Value} val - value to check
 * @param {String} name - name of value
 * @throws {Error} if argument is falsey, or an empty object
 */
FxAccountClient.prototype._required = required;

module.exports = FxAccountClient;
