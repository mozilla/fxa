/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/addons/sinon'
], function (Sinon) {

  return {
    useFakeXMLHttpRequest: Sinon.useFakeXMLHttpRequest,
    respond: function (req, mock) {
      req.respond(mock.status, mock.headers, mock.body);
    }
  }
});
