/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/lib/request',
], function (request) {
  'use strict';

  function waitForEmail(uri, number, cb) {
    if (!number) {
      number = 1;
    }
    console.log('Waiting for email...');

    request(uri, 'GET', null, function (err, result) {
      if (err) {
        return cb(err);
      }

      if (result.length >= number) {
        return cb(null, result);
      } else {
        setTimeout(function() {
          waitForEmail(uri, number, cb);
        }, 1000);
      }
    });
  }

  return waitForEmail;
});
