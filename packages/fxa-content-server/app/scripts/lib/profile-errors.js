/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/errors'
], function (_, Errors) {
  var t = function (msg) {
    return msg;
  };

  var ERRORS = {
    UNAUTHORIZED: {
      errno: 100,
      message: t('Unauthorized')
    },
    INVALID_PARAMETER: {
      errno: 101,
      message: t('Invalid parameter in request body: %(param)s')
    },
    UNSUPPORTED_PROVIDER: {
      errno: 102,
      message: t('Unsupported image provider')
    },
    IMAGE_PROCESSING_ERROR: {
      errno: 103,
      message: t('Image processing error')
    },
    SERVICE_UNAVAILABLE: {
      errno: 998,
      message: t('System unavailable, try again soon')
    },
    UNEXPECTED_ERROR: {
      errno: 999,
      message: t('Unexpected error')
    }
  };

  return _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'profile'
  });
});
