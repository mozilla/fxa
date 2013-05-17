/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const account = require('./account');

// Prerequesites can be included in a route's configuration and will run
// before the route's handler is called. Results are set on
// the request.pre object using the method's name for the property name,
// or otherwise using the value of the "assign" property.
//
// Methods specified as strings are helpers. Check ./helpers.js for
// definitions.

module.exports = {
  principle: {
    method: function(request, next) {
      if(request.payload.email) return next(request.payload.email);

      var token = request.payload.token;
      if (!token) next(Hapi.Error.badRequest('MissingSignToken'));
      account.getPrinciple(token, function(err, principle) {
        if (err) next(err);
        else next(principle);
      });
    },
    assign: 'principle'
  }
};
