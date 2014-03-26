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
    UNKNOWN_CLIENT: 101,
    INCORRECT_REDIRECT: 103,
    INVALID_ASSERTION: 104,
    INVALID_PARAMETER: 108
  };

  var CODE_TO_MESSAGES = {
    // errors returned by the oauth server
    999: t('Unexpected error'),
    101: t('Unknown client'),
    103: t('Incorrect redirect_uri'),
    104: t('Invalid assertion'),
    108: t('Invalid parameter in request body: %(param)s'),
  };

  return {
    /**
     * Convert an error, a numeric code or string type to a message
     */
    toMessage: function (err) {
      var code;

      if (typeof err === 'number') {
        code = err;
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
        }
      } catch (e) {
        // handle invalid/unexpected data from the backend.
        if (window.console && console.error) {
          console.error('Error in oauth-errors.js->toContext: %s', String(e));
        }
      }

      return {};
    },

    /**
     * Convert a text type from ERROR_TO_CODE to a numeric code
     */
    toCode: function (type) {
      return ERROR_TO_CODE[type];
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
