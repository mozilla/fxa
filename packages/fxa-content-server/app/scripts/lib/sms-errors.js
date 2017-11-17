/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * List of SMS error codes.
 * From https://docs.nexmo.com/messaging/sms-api/api-reference#status-codes
 */
define(function(require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Errors = require('./errors');
  const t = msg => msg;

  const INVALID_PHONE_NUMBER_MESSAGE = t('Invalid phone number');
  const THROTTLED_ERROR_MESSAGE = t('You\'ve tried too many times. Try again later.');

  /*eslint-disable sorting/sort-object-props*/
  const ERRORS = {
    SUCCESS: {
      errno: 0,
      message: t('SMS sent')
    },
    THROTTLED: {
      errno: 1,
      message: THROTTLED_ERROR_MESSAGE
    },
    MISSING_PARAMETER: {
      errno: 2,
      // should not be user facing, not wrapped in t
      message: 'SMS parameter missing'
    },
    INVALID_PARAMETER: {
      errno: 3,
      // should not be user facing, not wrapped in t
      message: 'SMS parameter invalid'
    },
    INVALID_CREDENTIALS: {
      errno: 4,
      // should not be user facing, not wrapped in t
      message: 'SMS credentials invalid'
    },
    INTERNAL_ERROR: {
      errno: 5,
      // should not be user facing, not wrapped in t
      message: 'SMS internal error'
    },
    UNROUTABLE_MESSAGE: {
      errno: 6,
      message: INVALID_PHONE_NUMBER_MESSAGE
    },
    NUMBER_BLOCKED: {
      errno: 7,
      message: t('Your number has been blocked')
    },
    PARTNER_ACCOUNT_BLOCKED: {
      errno: 8,
      // should not be user facing, not wrapped in t
      message: 'SMS partner account blocked'
    },
    PARTNER_QUOTA_EXCEEDED: {
      errno: 9,
      // should not be user facing, not wrapped in t
      message: 'SMS partner quota exceeded'
    },
    ACCOUNT_NOT_ENABLED_FOR_REST: {
      errno: 11,
      // should not be user facing, not wrapped in t
      message: 'SMS account not enabled for REST'
    },
    MESSAGE_TOO_LONG: {
      errno: 12,
      // should not be user facing, not wrapped in t
      message: 'SMS message too long'
    },
    COMMUNICATION_FAILED: {
      errno: 13,
      message: t('SMS not sent, please try again')
    },
    INVALID_SIGNATURE: {
      errno: 14,
      // should not be user facing, not wrapped in t
      message: 'SMS invalid signature'
    },
    ILLEGAL_SENDER_ADDRESS: {
      errno: 15,
      // should not be user facing, not wrapped in t
      message: 'SMS sender address illegal'
    },
    INVALID_TTL: {
      errno: 16,
      // should not be user facing, not wrapped in t
      message: 'SMS ttl invalid'
    },
    FACILITY_NOT_ALLOWED: {
      errno: 19,
      // should not be user facing, not wrapped in t
      message: 'SMS facility not allowed'
    },
    INVALID_MESSAGE_CLASS: {
      errno: 20,
      // should not be user facing, not wrapped in t
      message: 'SMS message class invalid'
    },
    MISSING_PROTOCOL: {
      errno: 23,
      // should not be user facing, not wrapped in t
      message: 'SMS protocol missing'
    },
    DESTINATION_NOT_ALLOWED: {
      errno: 29,
      // should not be user facing, not wrapped in t
      message: 'SMS destination not allowed'
    },
    INVALID_PHONE_NUMBER: {
      errno: 34,
      message: INVALID_PHONE_NUMBER_MESSAGE
    }

  };
  /*eslint-enable sorting/sort-object-props*/


  module.exports = _.extend({}, Errors, {
    ERRORS: ERRORS,
    NAMESPACE: 'sms'
  });
});
