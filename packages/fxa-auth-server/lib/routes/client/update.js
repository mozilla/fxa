/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf').hex;
const Joi = require('joi');

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
    },
    payload: {
      name: Joi.string().max(256),
      image_uri: Joi.string().max(256),
      redirect_uri: Joi.string().max(256),
      can_grant: Joi.boolean()
    }
  },
  handler: function updateClientEndpoint(req, reply) {
    var clientId = req.params.client_id;
    var payload = req.payload;
    var email = req.auth.credentials.email;

    return db.developerOwnsClient(email, clientId)
      .then(
        function () {
          return db.updateClient({
            id: buf(clientId),
            name: payload.name,
            redirectUri: payload.redirect_uri,
            imageUri: payload.image_uri,
            canGrant: payload.can_grant
          }).done(function() {
            reply({});
          }, reply);
        },
        function () {
          return reply(AppError.unauthorized('Illegal Developer'));
        }
      );
  }
};
