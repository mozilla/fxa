/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Errors = require('lib/errors');

  var t = function (msg) {
    return msg;
  };

  var UNEXPECTED_ERROR = t('Unexpected error');

  /*eslint-disable sorting/sort-object-props*/
  // error codes from
  // https://github.com/mozilla/basket-client/blob/master/basket/errors.py
  var ERRORS = {
    NETWORK_FAILURE: {
      errno: 1,
      message: UNEXPECTED_ERROR
    },
    INVALID_EMAIL: {
      errno: 2,
      message: UNEXPECTED_ERROR
    },
    UNKNOWN_EMAIL: {
      errno: 3,
      message: UNEXPECTED_ERROR
    },
    UNKNOWN_TOKEN: {
      errno: 4,
      message: UNEXPECTED_ERROR
    },
    USAGE_ERROR: {
      errno: 5,
      message: UNEXPECTED_ERROR
    },
    EMAIL_PROVIDER_AUTH_FAILURE: {
      errno: 6,
      message: UNEXPECTED_ERROR
    },
    AUTH_ERROR: {
      errno: 7,
      message: UNEXPECTED_ERROR
    },
    SSL_REQUIRED: {
      errno: 8,
      message: UNEXPECTED_ERROR
    },
    INVALID_NEWSLETTER: {
      errno: 9,
      message: UNEXPECTED_ERROR
    },
    INVALID_LANGUAGE: {
      errno: 10,
      message: UNEXPECTED_ERROR
    },
    EMAIL_NOT_CHANGED: {
      errno: 11,
      message: UNEXPECTED_ERROR
    },
    CHANGE_REQUEST_NOT_FOUND: {
      errno: 12,
      message: UNEXPECTED_ERROR
    },
    UNKNOWN_ERROR: {
      errno: 99,
      message: UNEXPECTED_ERROR
    },

    // client side only errors
    SERVICE_UNAVAILABLE: {
      errno: 998,
      message: t('System unavailable, try again soon')
    },
    UNEXPECTED_ERROR: {
      errno: 999,
      message: UNEXPECTED_ERROR
    }
  };
  /*eslint-enable sorting/sort-object-props*/

  module.exports = _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'basket-errors',
    normalizeXHRError: function (xhr) {
      var respJSON = xhr.responseJSON;
      if (respJSON && ! ('errno' in respJSON) && respJSON.code) {
        // the basket API returns code instead of errno. Convert.
        respJSON.errno = respJSON.code;
        // we want to set the code equal to the http status code
        respJSON.code = xhr.status;
      }
      return Errors.normalizeXHRError.call(this, xhr);
    }
  });
});
