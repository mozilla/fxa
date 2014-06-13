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
    // If the auth server is unavailable, it will not respond.
    // Use a client side only code.
    SERVICE_UNAVAILABLE: 998,
    SERVER_BUSY: 201,
    ENDPOINT_NOT_SUPPORTED: 116,

    // local only error codes
    USER_CANCELED_LOGIN: 1001,
    SESSION_EXPIRED: 1002,

    COOKIES_STILL_DISABLED: 1003,
    PASSWORDS_DO_NOT_MATCH: 1004,
    WORKING: 1005,
    COULD_NOT_GET_PP: 1006,
    COULD_NOT_GET_TOS: 1007,
    PASSWORDS_MUST_BE_DIFFERENT: 1008
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
    998: t('System unavailable, try again soon'),
    201: t('Server busy, try again soon'),
    116: t('This endpoint is no longer supported'),

    // local only error messages
    1002: t('Session expired. Sign in to continue.'),
    1003: t('Cookies are still disabled'),
    1004: t('Passwords do not match'),
    1005: t('Working…'),
    1006: t('Could not get Privacy Notice'),
    1007: t('Could not get Terms of Service'),
    1008: t('Your new password must be different')
  };

  return {
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

      return CODE_TO_MESSAGES[code] || err;
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
      return type.errno || ERROR_TO_CODE[type] || type;
    },

    /**
     * Synthesize an error of the given type with the supplied message.
     */
    toError: function (type, message) {
      var err = new Error(message);
      err.errno = this.toCode(type);
      return err;
    },

    /**
     * Check if an error is of the given type
     */
    is: function (error, type) {
      var code = this.toCode(type);
      return error.errno === code;
    }
  };
});
