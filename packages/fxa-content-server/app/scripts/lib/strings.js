/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a temporary file that contains strings that can be extracted for the
// l10n team to start translations.

'use strict';

define([
],
function () {
  var t = function (msg) {
    return msg;
  };

  // tooltips specified by rfeeley and johngruen
  t('Valid email required');
  t('Valid password required');
  t('Invalid password');
  t('Invalid email and password');
  t('Invalid email or password');
  t('Must be at least 8 characters');
  t('Year of birth required');
  t('Account already exists');
  t('Old password invalid');
  t('New password invalid');
  t('Passwords don\'t match');
  t('Please enter an email');
  t('Cannot connect to the internet');

  // strings returned by the auth server
  t('Unspecified error');
  t('Unknown credentials');
  t('Invalid credentials');
  t('Stale timestamp');
  t('Invalid nonce');
  t('Account already exists');
  t('Unknown account');
  t('Incorrect email case');
  t('Incorrect password');
  t('Unverified account');
  t('Invalid verification code');
  t('Invalid JSON in request body');
  t('Invalid parameter in request body: %(param)s');
  t('Missing parameter in request body: %(param)s');
  t('Invalid request signature');
  t('Invalid authentication token in request signature');
  t('Invalid timestamp in request signature');
  t('Invalid nonce in request signature');
  t('Missing content-length header');
  t('Request body too large');
  t('Client has sent too many requests');
  t('Service unavailable');
  t('This endpoint is no longer supported');
});

