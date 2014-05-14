/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/lib/request',
  'intern/node_modules/dojo/Deferred'
], function (request, Deferred) {
  'use strict';

  function waitForEmail(uri, number) {
    if (!number) {
      number = 1;
    }
    console.log('Waiting for email at:', uri);

    return request(uri, 'GET', null)
      .then(function (result) {
        if (result.length >= number) {
          return result;
        } else {
          var dfd = new Deferred();
          setTimeout(function() {
            waitForEmail(uri, number)
              .then(dfd.resolve, dfd.reject);
          }, 1000);

          return dfd.promise;
        }
      });
  }

  return waitForEmail;
});
