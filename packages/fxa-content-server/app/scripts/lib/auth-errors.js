/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
],
function () {
  var t = function (msg) {
    return msg;
  };

  return {
    // errors returned by the auth server
    999: t('Unexpected error'),
    110: t('Invalid authentication token in request signature'),
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
    114: t('Client has sent too many requests'),
    201: t('Service unavailable'),
    116: t('This endpoint is no longer supported')
  };

});
