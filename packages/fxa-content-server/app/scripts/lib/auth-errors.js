/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Errors = require('lib/errors');
  var Logger = require('lib/logger');
  var logger = new Logger();

  var t = function (msg) {
    return msg;
  };

  var UNEXPECTED_ERROR_MESSAGE = t('Unexpected error');

  /*eslint-disable sorting/sort-object-props*/
  var ERRORS = {
    UNEXPECTED_ERROR: {
      errno: 999,
      message: UNEXPECTED_ERROR_MESSAGE
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
      message: t('Invalid verification code')
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
    ACCOUNT_LOCKED: {
      errno: 121,
      message: t('Your account has been locked for security reasons')
    },
    ACCOUNT_NOT_LOCKED: {
      errno: 122,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    ACCOUNT_RESET: {
      errno: 126,
      message: t('Your account has been locked for security reasons')
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
    /*
    Removed in issue #3137
    YEAR_OF_BIRTH_REQUIRED: {
      errno: 1012,
      message: t('Year of birth required')
    },
    */
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
    /*
    Removed in issue #3137
    BIRTHDAY_REQUIRED: {
      errno: 1016,
      message: t('Valid birthday required')
    },
    */
    DESKTOP_CHANNEL_TIMEOUT: {
      errno: 1017,
      message: UNEXPECTED_ERROR_MESSAGE
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
      message: UNEXPECTED_ERROR_MESSAGE
    },
    ILLEGAL_IFRAME_PARENT: {
      errno: 1022,
      message: t('Firefox Accounts can only be placed into an IFRAME on approved sites')
    },
    INVALID_EMAIL: {
      errno: 1023,
      message: t('Valid email required')
    },
    /*
    Removed in issue #3040
    FORCE_AUTH_EMAIL_REQUIRED: {
      errno: 1024,
      message: t('/force_auth requires an email')
    },
    */
    EXPIRED_VERIFICATION_LINK: {
      errno: 1025,
      message: t('The link you clicked to verify your email is expired.')
    },
    DAMAGED_VERIFICATION_LINK: {
      errno: 1026,
      message: t('Verification link damaged')
    },
    UNEXPECTED_POSTMESSAGE_ORIGIN: {
      errno: 1027,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    INVALID_IMAGE_SIZE: {
      errno: 1028,
      message: t('The image dimensions must be at least 100x100px')
    },
    IOS_SIGNUP_DISABLED: {
      errno: 1029,
      message: t('Signup is coming soon to Firefox for iOS')
    },
    SIGNUP_DISABLED_BY_RELIER: {
      errno: 1030,
      message: t('Signup has been disabled')
    },
    AGE_REQUIRED: {
      errno: 1031,
      message: t('You must enter your age to sign up')
    },
    NO_GRAVATAR_FOUND: {
      errno: 1032,
      message: t('No Gravatar found')
    },
    INVALID_CAMERA_DIMENSIONS: {
      errno: 1033,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    DELETED_ACCOUNT: {
      errno: 1034,
      message: t('Account no longer exists.')
    },
    INVALID_RESUME_TOKEN_PROPERTY: {
      errno: 1035,
      message: t('Invalid property in resume token: %(property)s')
    },
    MISSING_RESUME_TOKEN_PROPERTY: {
      errno: 1036,
      message: t('Missing property in resume token: %(property)s')
    }
  };
  /*eslint-enable sorting/sort-object-props*/

  module.exports = _.extend({}, Errors, {
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
            param: err.param || err.validation.keys
          };
        } else if (this.is(err, 'MISSING_PARAMETER')) {
          return {
            param: err.param
          };
        } else if (this.is(err, 'INVALID_RESUME_TOKEN_PROPERTY')) {
          return {
            property: err.property
          };
        } else if (this.is(err, 'MISSING_RESUME_TOKEN_PROPERTY')) {
          return {
            property: err.property
          };
        }
      } catch (e) {
        // handle invalid/unexpected data from the backend.
        logger.error('Error in errors.js->toInterpolationContext: %s', String(e));
      }

      return {};
    }
  });
});
