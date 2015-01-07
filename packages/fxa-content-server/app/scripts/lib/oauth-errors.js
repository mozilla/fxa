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
    UNKNOWN_CLIENT: {
      errno: 101,
      message: t('Unknown client')
    },
    INCORRECT_REDIRECT: {
      errno: 103,
      message: t('Incorrect redirect_uri')
    },
    INVALID_ASSERTION: {
      errno: 104,
      message: t('Invalid assertion')
    },
    INVALID_PARAMETER: {
      errno: 108,
      message: t('Invalid parameter in request body: %(param)s')
    },
    INVALID_REQUEST_SIGNATURE: {
      errno: 109,
      message: t('Invalid request signature')
    },
    SERVICE_UNAVAILABLE: {
      errno: 998,
      message: t('System unavailable, try again soon')
    },
    UNEXPECTED_ERROR: {
      errno: 999,
      message: t('Unexpected error')
    },
    TRY_AGAIN: {
      errno: 1000,
      message: t('Something went wrong. Please close this tab and try again.')
    },
    INVALID_RESULT: {
      errno: 1001,
      message: t('Unexpected error')
    },
    INVALID_RESULT_REDIRECT: {
      errno: 1002,
      message: t('Unexpected error')
    },
    INVALID_RESULT_CODE: {
      errno: 1003,
      message: t('Unexpected error')
    },
    USER_CANCELED_OAUTH_LOGIN: {
      errno: 1004,
      message: t('no message')
    },
    MISSING_PARAMETER: {
      errno: 1005,
      message: t('Missing OAuth parameter: %(param)s')
    }
  };

  return _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'oauth',

    /**
     * Fetch the interpolation context out of the server error.
     */
    toInterpolationContext: function (err) {
      // For data returned by backend, see
      // https://github.com/mozilla/fxa-auth-server/blob/master/error.js
      try {
        if (this.is(err, 'MISSING_PARAMETER')) {
          return {
            param: err.param
          };
        }
      } catch (e) {
        // handle invalid/unexpected data from the backend.
        if (window.console && console.error) {
          console.error('Error in oauth-errors.js->toInterpolationContext: %s', String(e));
        }
      }

      return {};
    }
  });
});
