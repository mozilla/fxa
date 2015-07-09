/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/lib/request',
  'intern/node_modules/dojo/Promise'
], function (request, Promise) {

  function waitForEmail(uri, number) {
    var requestAttempts = 0;
    if (! number) {
      number = 1;
    }

    return function checkIt () {
      if (requestAttempts > 2) {
        // only log if too many attempts, probably means the service is not properly responding
        console.log('Waiting for email at:', uri);
      }

      return request(uri, 'GET', null)
        .then(function (result) {
          requestAttempts++;

          if (result.length >= number) {
            return result;
          } else {
            var dfd = new Promise.Deferred();
            setTimeout(function () {
              checkIt().then(dfd.resolve, dfd.reject);
            }, 1000);

            return dfd.promise;
          }
        });
    };
  }

  return waitForEmail;
});
