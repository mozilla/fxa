/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const auth = require('../../auth');
const db = require('../../db');
const validators = require('../../validators');
const AppError = require('../../error');

module.exports = {
  auth: {
    strategy: auth.AUTH_STRATEGY,
    scope: auth.SCOPE_CLIENT_MANAGEMENT.getImplicantValues()
  },
  validate: {
    params: {
      client_id: validators.clientId
    }
  },
  handler: function clientDeleteEndpoint(req, reply) {
    var email = req.auth.credentials.email;
    var clientId = req.params.client_id;

    return db.developerOwnsClient(email, clientId)
      .then(
        function () {
          return db.removeClient(clientId).done(function() {
            reply().code(204);
          }, reply);
        },
        function () {
          return reply(AppError.unauthorized('Illegal Developer'));
        }
      );
  }
};
