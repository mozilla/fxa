/* eslint-disable id-blacklist */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Request = require('../../client/lib/request');

function Restmail(server, xhr) {
  this.request = new Request(server, xhr);
}

// utility function that waits for a restmail email to arrive
Restmail.prototype.wait = function(user, number = 1, requestAttempts = 0) {
  const self = this;
  const path = '/mail/' + user;

  if (requestAttempts > 0) {
    // only log if too many attempts, probably means the service is
    // not properly responding
    console.log('Waiting for email at:', path);
  }

  return this.request.send(path, 'GET').then(function(result) {
    requestAttempts++;
    if (result.length === number) {
      return result;
    } else {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          self.wait(user, number, requestAttempts).then(resolve, reject);
        }, 1000);
      });
    }
  });
};

module.exports = Restmail;
