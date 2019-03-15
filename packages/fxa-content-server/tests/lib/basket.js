/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const request = require('./request');
const config = require('../../server/lib/configuration');
var API_KEY = config.get('marketing_email.api_key');
var API_URL = config.get('marketing_email.api_url');

var LOOKUP_URL = API_URL + '/lookup-user/?email=';

function waitUntilUserIsRegistered(email) {

  const maxAttempts = 10;
  var requestAttempts = 0;

  return function checkIt () {
    requestAttempts++;

    if (requestAttempts > 2) {
      // only log if too many attempts, probably means the service is not properly responding
      console.log('Waiting for %s to register at: %s', email, API_URL);
    }

    var url = LOOKUP_URL + encodeURIComponent(email);
    return request(url, 'GET', null, { 'X-API-Key': API_KEY })
      .then(function (result) {
        if (result.status === 'ok') {
          return result;
        } else if (requestAttempts >= maxAttempts) {
          return Promise.reject(new Error('EmailTimeout'));
        } else {
          return new Promise((resolve, reject) => {
            setTimeout(function () {
              checkIt().then(resolve, reject);
            }, 1000);

          });
        }
      });
  };
}

module.exports = waitUntilUserIsRegistered;
