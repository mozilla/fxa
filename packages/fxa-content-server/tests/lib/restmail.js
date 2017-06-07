/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'tests/lib/request',
  'intern/browser_modules/dojo/Promise'
], function (intern, request, Promise) {
  'use strict';

  const config = intern.config;
  const EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  /**
   * Wait for an email.
   *
   * @param {String} user
   * @param {Number} number
   * @param {Object} [options]
   *   @param {Number} [options.minAttemptsBeforeLog] - Minimum number of
   *   attempts before attempts are logged. Defaults to 2.
   *   @param {Number} [options.maxAttempts] - number of email fetch attempts
   *   to make. Defaults to 10.
   */
  function waitForEmail(user, number, options) {
    options = options || {};
    let requestAttempts = 0;
    if (! number) {
      number = 1;
    }

    const maxAttempts = options.maxAttempts || 10;
    const minAttemptsBeforeLog = options.minAttemptsBeforeLog ||
                               options.maxAttempts ||
                               2;

    const uri = getUserUri(user);
    function checkIt () {
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
        }, (err) => {
          console.log('error', err);
        });
    }

    return checkIt();
  }

  function deleteAllEmails(user) {
    // restmail returns an empty response, which causes a blowup. Ignore the error.
    return request(getUserUri(user), 'DELETE', null).then(null, (err) => {});

  }

  function getUserUri(user) {
    return EMAIL_SERVER_ROOT + '/mail/' + user;
  }

  return {
    deleteAllEmails,
    waitForEmail
  };
});
