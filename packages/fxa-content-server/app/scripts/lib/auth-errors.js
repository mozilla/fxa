/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

'use strict';

define([
],
function () {
  var t = function (msg) {
    return msg;
  };

  var ERROR_TO_CODE = {
    UNEXPECTED_ERROR: 999,
    INVALID_TOKEN: 110,
    INVALID_TIMESTAMP: 111,
    INVALID_NONCE: 115,
    ACCOUNT_ALREADY_EXISTS: 101,
    UNKNOWN_ACCOUNT: 102,
    INCORRECT_EMAIL_CASE: 120,
    INCORRECT_PASSWORD: 103,
    UNVERIFIED_ACCOUNT: 104,
    INVALID_VERIFICATION_CODE: 105,
    INVALID_JSON: 106,
    INVALID_PARAMETER: 107,
    MISSING_PARAMETER: 108,
    INVALID_REQUEST_SIGNATURE: 109,
    MISSING_CONTENT_LENGTH_HEADER: 112,
    REQUEST_TOO_LARGE: 113,
    THROTTLED: 114,
    SERVER_BUSY: 201,
    ENDPOINT_NOT_SUPPORTED: 116,

    // local only error codes
    SERVICE_UNAVAILABLE: 998,
    USER_CANCELED_LOGIN: 1001,
    SESSION_EXPIRED: 1002,

    COOKIES_STILL_DISABLED: 1003,
    PASSWORDS_DO_NOT_MATCH: 1004,
    WORKING: 1005,
    COULD_NOT_GET_PP: 1006,
    COULD_NOT_GET_TOS: 1007,
    PASSWORDS_MUST_BE_DIFFERENT: 1008,
    PASSWORD_TOO_SHORT: 1009,
    PASSWORD_REQUIRED: 1010,
    EMAIL_REQUIRED: 1011,
    YEAR_OF_BIRTH_REQUIRED: 1012,
    UNUSABLE_IMAGE: 1013,
    NO_CAMERA: 1014,
    URL_REQUIRED: 1015,
    BIRTHDAY_REQUIRED: 1016,
    DESKTOP_CHANNEL_TIMEOUT: 1017,
    SIGNUP_EMAIL_BOUNCE: 1018,
    DIFFERENT_EMAIL_REQUIRED: 1019,
    DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN: 1020
  };

  var CODE_TO_MESSAGES = {
    // errors returned by the auth server
    999: t('Unexpected error'),
    110: t('Invalid token'),
    111: t('Invalid timestamp in request signature'),
    115: t('Invalid nonce in request signature'),
    101: t('Account already exists'),
    102: t('Unknown account'),
    120: t('Incorrect email case'),
    103: t('Incorrect password'),
    104: t('Unverified account'),
    105: t('Invalid verification code'),
    106: t('Invalid JSON in request body'),
    107: t('Invalid parameter in request body: %(param)s'),
    108: t('Missing parameter in request body: %(param)s'),
    109: t('Invalid request signature'),
    112: t('Missing content-length header'),
    113: t('Request body too large'),
    114: t('Attempt limit exceeded'),
    201: t('Server busy, try again soon'),
    116: t('This endpoint is no longer supported'),

    // local only error messages
    998: t('System unavailable, try again soon'),
    1002: t('Session expired. Sign in to continue.'),
    1003: t('Cookies are still disabled'),
    1004: t('Passwords do not match'),
    1005: t('Working…'),
    1006: t('Could not get Privacy Notice'),
    1007: t('Could not get Terms of Service'),
    1008: t('Your new password must be different'),
    1009: t('Must be at least 8 characters'),
    1010: t('Valid password required'),
    1011: t('Valid email required'),
    1012: t('Year of birth required'),
    1013: t('A usable image was not found'),
    1014: t('Could not initialize camera'),
    1015: t('Valid URL required'),
    1016: t('Valid birthday required'),
    1017: t('Unexpected error'),
    1018: t('Your verification email was just returned. Mistyped email? <a href="/signup">Start over.</a>'),
    1019: t('Valid email required'),
    1020: t('Enter a valid email address. firefox.com does not offer email.')
  };

  return {
    ERROR_TO_CODE: ERROR_TO_CODE,
    CODE_TO_MESSAGES: CODE_TO_MESSAGES,
    NAMESPACE: 'auth',

    /**
     * Convert an error, a numeric code or string type to a message
     */
    toMessage: function (err) {
      var code;

      if (typeof err === 'number') {
        code = err;
      } else if (err && err.forceMessage) {
        return err.forceMessage;
      // error from backend
      } else if (err && typeof err.errno === 'number') {
        code = err.errno;
      // error from backend that only has a message. Print the message.
      } else if (err && err.message) {
        return err.message;
      // probably a string. Try to convert it.
      } else if (err && err.length) {
        code = this.toCode(err);
      } else {
        // if there is no error, no error message, and no code,
        // assume no response from the backend and
        // the service is unavailable.
        code = this.toCode('SERVICE_UNAVAILABLE');
      }

      return this.CODE_TO_MESSAGES[code] || err;
    },

    /**
     * Fetch the translation context out of the server error.
     */
    toContext: function (err) {
      // For data returned by backend, see
      // https://github.com/mozilla/fxa-auth-server/blob/master/error.js
      try {
        if (this.is(err, 'INVALID_PARAMETER')) {
          return {
            param: err.validation.keys
          };
        } else if (this.is(err, 'MISSING_PARAMETER')) {
          return {
            param: err.param
          };
        }
      } catch (e) {
        // handle invalid/unexpected data from the backend.
        if (window.console && console.error) {
          console.error('Error in auth-errors.js->toContext: %s', String(e));
        }
      }

      return {};
    },

    /**
     * Convert an error or a text type from ERROR_TO_CODE to a numeric code
     */
    toCode: function (type) {
      return type.errno || this.ERROR_TO_CODE[type] || type;
    },

    /**
     * Synthesize an error of the given type
     *
     * @param {String || Number || Object} type
     * @param {String} [context]
     */
    toError: function (type, context) {
      var message = this.toMessage(type);

      var err = new Error(message);
      err.errno = this.toCode(type);
      err.namespace = this.NAMESPACE;
      err.message = message;
      err.errorContext = this;

      if (context) {
        err.context = context;
      }

      return err;
    },

    /**
     * Check if an error is of the given type
     */
    is: function (error, type) {
      var code = this.toCode(type);
      return error.errno === code;
    },

    normalizeXHRError: function (xhr) {
      if (! xhr || xhr.status === 0) {
        return this.toError('SERVICE_UNAVAILABLE');
      }

      var errObj = xhr.responseJSON;

      if (! errObj) {
        return this.toError('UNEXPECTED_ERROR');
      }

      return this.toError(errObj.errno);
    }
  };
});
