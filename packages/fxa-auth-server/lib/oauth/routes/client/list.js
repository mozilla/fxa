/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');
const hex = require('buf').to.hex;

const auth = require('../../auth_client_management');
const db = require('../../db');
const validators = require('../../validators');

function serialize(client) {
  return {
    id: hex(client.id),
    name: client.name,
    image_uri: client.imageUri,
    redirect_uri: client.redirectUri,
    can_grant: client.canGrant,
    trusted: client.trusted,
  };
}

module.exports = {
  auth: {
    strategy: auth.AUTH_STRATEGY,
    scope: auth.SCOPE_CLIENT_MANAGEMENT.getImplicantValues(),
  },
  response: {
    schema: {
      clients: Joi.array().items(
        Joi.object().keys({
          id: validators.clientId,
          name: Joi.string().required(),
          image_uri: Joi.string().allow(''),
          redirect_uri: Joi.string()
            .allow('')
            .required(),
          can_grant: Joi.boolean().required(),
          trusted: Joi.boolean().required(),
        })
      ),
    },
  },
  handler: async function listEndpoint(req) {
    const developerEmail = req.auth.credentials.email;

    return db.getClients(developerEmail).then(function(clients) {
      return {
        clients: clients.map(serialize),
      };
    });
  },
};
