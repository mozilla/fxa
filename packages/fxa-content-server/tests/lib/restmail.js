/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/lib/request',
  'intern/browser_modules/dojo/Promise'
], function (request, Promise) {

  /**
   * Wait for an email.
   *
   * @param {string} uri - email uri
   * @param {number} number
   * @param {object} [options]
   *   @param {number} [options.minAttemptsBeforeLog] - Minimum number of
   *   attempts before attempts are logged. Defaults to 2.
   *   @param {number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   */
  function waitForEmail(uri, number, options) {
    options = options || {};
    var requestAttempts = 0;
    if (! number) {
      number = 1;
    }

    var maxAttempts = options.maxAttempts || 10;
    var minAttemptsBeforeLog = options.minAttemptsBeforeLog ||
                               options.maxAttempts ||
                               2;

    return function checkIt () {
      if (requestAttempts > minAttemptsBeforeLog) {
        // only log if too many attempts, probably means the service is
        // not properly responding
        console.log('Waiting for email at:', uri);
      }

      return request(uri, 'GET', null)
        .then(function (result) {
          requestAttempts++;

          if (result.length >= number) {
            return result;
          } else if (requestAttempts >= maxAttempts) {
            return Promise.reject(new Error('EmailTimeout'));
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
