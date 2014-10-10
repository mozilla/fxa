/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const auth = require('../../auth');
const db = require('../../db');
const validators = require('../../validators');


/*jshint camelcase: false*/
module.exports = {
  auth: {
    strategy: auth.AUTH_STRATEGY,
    scope: [auth.SCOPE_CLIENT_MANAGEMENT]
  },
  validate: {
    params: {
      client_id: validators.clientId
    }
  },
  handler: function clientDeleteEndpoint(req, reply) {
    db.removeClient(req.params.client_id).done(function() {
      reply().code(204);
    }, reply);
  }
};
