/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Errors = require('lib/errors');

  var t = function (msg) {
    return msg;
  };

  /*eslint-disable sorting/sort-object-props*/
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
    IMAGE_LOAD_ERROR: {
      errno: 997,
      message: t('Unexpected error')
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
  /*eslint-enable sorting/sort-object-props*/

  module.exports = _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'profile'
  });
});
