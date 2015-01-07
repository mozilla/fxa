/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

'use strict';

define([
  'underscore',
  'lib/errors'
],
function (_, Errors) {
  var t = function (msg) {
    return msg;
  };

  var ERRORS = {
    UNEXPECTED_ERROR: {
      errno: 999,
      message: t('Unexpected error')
    },
    INVALID_TOKEN: {
      errno: 110,
      message: t('Invalid token')
    },
    INVALID_TIMESTAMP: {
      errno: 111,
      message: t('Invalid timestamp in request signature')
    },
    INVALID_NONCE: {
      errno: 115,
      message: t('Invalid nonce in request signature')
    },
    ACCOUNT_ALREADY_EXISTS: {
      errno: 101,
      message: t('Account already exists')
    },
    UNKNOWN_ACCOUNT: {
      errno: 102,
      message: t('Unknown account')
    },
    INCORRECT_EMAIL_CASE: {
      errno: 120,
      message: t('Incorrect email case')
    },
    INCORRECT_PASSWORD: {
      errno: 103,
      message: t('Incorrect password')
    },
    UNVERIFIED_ACCOUNT: {
      errno: 104,
      message: t('Unverified account')
    },
    INVALID_VERIFICATION_CODE: {
      errno: 105,
      message: t('Invalid verification errno')
    },
    INVALID_JSON: {
      errno: 106,
      message: t('Invalid JSON in request body')
    },
    INVALID_PARAMETER: {
      errno: 107,
      message: t('Invalid parameter in request body: %(param)s')
    },
    MISSING_PARAMETER: {
      errno: 108,
      message: t('Missing parameter in request body: %(param)s')
    },
    INVALID_REQUEST_SIGNATURE: {
      errno: 109,
      message: t('Invalid request signature')
    },
    MISSING_CONTENT_LENGTH_HEADER: {
      errno: 112,
      message: t('Missing content-length header')
    },
    REQUEST_TOO_LARGE: {
      errno: 113,
      message: t('Request body too large')
    },
    THROTTLED: {
      errno: 114,
      message: t('Attempt limit exceeded')
    },
    SERVER_BUSY: {
      errno: 201,
      message: t('Server busy, try again soon')
    },
    ENDPOINT_NOT_SUPPORTED: {
      errno: 116,
      message: t('This endpoint is no longer supported')
    },
    SERVICE_UNAVAILABLE: {
      errno: 998,
      message: t('System unavailable, try again soon')
    },
    USER_CANCELED_LOGIN: {
      errno: 1001,
      message: t('no message')
    },
    SESSION_EXPIRED: {
      errno: 1002,
      message: t('Session expired. Sign in to continue.')
    },
    COOKIES_STILL_DISABLED: {
      errno: 1003,
      message: t('Cookies are still disabled')
    },
    PASSWORDS_DO_NOT_MATCH: {
      errno: 1004,
      message: t('Passwords do not match')
    },
    WORKING: {
      errno: 1005,
      message: t('Working…')
    },
    COULD_NOT_GET_PP: {
      errno: 1006,
      message: t('Could not get Privacy Notice')
    },
    COULD_NOT_GET_TOS: {
      errno: 1007,
      message: t('Could not get Terms of Service')
    },
    PASSWORDS_MUST_BE_DIFFERENT: {
      errno: 1008,
      message: t('Your new password must be different')
    },
    PASSWORD_TOO_SHORT: {
      errno: 1009,
      message: t('Must be at least 8 characters')
    },
    PASSWORD_REQUIRED: {
      errno: 1010,
      message: t('Valid password required')
    },
    EMAIL_REQUIRED: {
      errno: 1011,
      message: t('Valid email required')
    },
    YEAR_OF_BIRTH_REQUIRED: {
      errno: 1012,
      message: t('Year of birth required')
    },
    UNUSABLE_IMAGE: {
      errno: 1013,
      message: t('A usable image was not found')
    },
    NO_CAMERA: {
      errno: 1014,
      message: t('Could not initialize camera')
    },
    URL_REQUIRED: {
      errno: 1015,
      message: t('Valid URL required')
    },
    BIRTHDAY_REQUIRED: {
      errno: 1016,
      message: t('Valid birthday required')
    },
    DESKTOP_CHANNEL_TIMEOUT: {
      errno: 1017,
      message: t('Unexpected error')
    },
    SIGNUP_EMAIL_BOUNCE: {
      errno: 1018,
      message: t('Your verification email was just returned. Mistyped email?')
    },
    DIFFERENT_EMAIL_REQUIRED: {
      errno: 1019,
      message: t('Valid email required')
    },
    DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN: {
      errno: 1020,
      message: t('Enter a valid email address. firefox.com does not offer email.')
    },
    CHANNEL_TIMEOUT: {
      errno: 1021,
      message: t('Unexpected error')
    },
    ILLEGAL_IFRAME_PARENT: {
      errno: 1022,
      message: t('Firefox Accounts can only be placed into an IFRAME on approved sites')
    },
    INVALID_EMAIL: {
      errno: 1023,
      message: t('Valid email required')
    }
  };

  return _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'auth',

    /**
     * Fetch the interpolation context out of the server error.
     */
    toInterpolationContext: function (err) {
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
          console.error('Error in errors.js->toInterpolationContext: %s', String(e));
        }
      }

      return {};
    }
  });
});
