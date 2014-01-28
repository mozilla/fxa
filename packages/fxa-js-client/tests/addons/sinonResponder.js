/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/addons/sinon'
], function (Sinon) {

  return {
    useFakeXMLHttpRequest: Sinon.useFakeXMLHttpRequest,

    makeMockResponder: function (requests) {
      var self = this;
      var requestIndex = 0;

      return function (returnValue, response) {
        setTimeout(function () {
          self.respond(requests[requestIndex++], response);
        }, 100);

        return returnValue;
      }
    },
    respond: function (req, mock) {
      if (typeof mock === 'undefined') {
        console.log('Mock does not exist!');
      }
      if (req && req.respond) {
        req.respond(mock.status, mock.headers, mock.body);
      }
    }
  }
});
