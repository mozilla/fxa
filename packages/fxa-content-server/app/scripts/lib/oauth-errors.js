/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

'use strict';

define([
  'underscore',
  'lib/auth-errors'
],
function (_, AuthErrors) {
  var t = function (msg) {
    return msg;
  };

  var ERROR_TO_CODE = {
    UNEXPECTED_ERROR: 999,
    UNKNOWN_CLIENT: 101,
    INCORRECT_REDIRECT: 103,
    INVALID_ASSERTION: 104,
    INVALID_PARAMETER: 108,
    INVALID_REQUEST_SIGNATURE: 109
  };

  var CODE_TO_MESSAGES = {
    // errors returned by the oauth server
    999: t('Unexpected error'),
    101: t('Unknown client'),
    103: t('Incorrect redirect_uri'),
    104: t('Invalid assertion'),
    108: t('Invalid parameter in request body: %(param)s'),
    109: t('Invalid request signature')
  };

  return _.extend({}, AuthErrors, {
    ERROR_TO_CODE: ERROR_TO_CODE,
    CODE_TO_MESSAGES: CODE_TO_MESSAGES
  });
});
