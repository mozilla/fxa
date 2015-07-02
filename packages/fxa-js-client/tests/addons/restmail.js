/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'client/lib/request',
  'components/p/p'
], function (Request, p) {
  'use strict';

  function Restmail(server, xhr) {
    this.request = new Request(server, xhr);
  }

  // utility function that waits for a restmail email to arrive
  Restmail.prototype.wait = function (user, number) {
    var self = this;

    if (!number) number = 1; //eslint-disable-line curly
    console.log('Waiting for email...');

    return self.request.send('/mail/' + user, 'GET')
      .then(function (result) {
        if (result.length === number) {
          return result;
        } else {
          var deferred = p.defer();

          setTimeout(function () {
            self.wait(user, number)
              .then(function (emails) {
                deferred.resolve(emails);
              }, function (err) {
                deferred.reject(err);
              });
          }, 1000);
          return deferred.promise;
        }
      });
  };

  return Restmail;
});
