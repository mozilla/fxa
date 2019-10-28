/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const auth = require('../../auth_client_management');
const db = require('../../db');
const encrypt = require('../../encrypt');
const hex = require('buf').to.hex;
const unique = require('../../unique');
const validators = require('../../validators');
const AppError = require('../../error');

module.exports = {
  auth: {
    strategy: auth.AUTH_STRATEGY,
    scope: auth.SCOPE_CLIENT_MANAGEMENT.getImplicantValues(),
  },
  validate: {
    payload: {
      name: Joi.string()
        .max(256)
        .required(),
      image_uri: Joi.string()
        .max(256)
        .allow(''),
      redirect_uri: Joi.string()
        .max(256)
        .required(),
      can_grant: Joi.boolean(),
      trusted: Joi.boolean(),
    },
  },
  response: {
    schema: {
      id: validators.clientId,
      secret: validators.clientSecret,
      name: Joi.string().required(),
      image_uri: Joi.string().allow(''),
      redirect_uri: Joi.string().required(),
      can_grant: Joi.boolean().required(),
      trusted: Joi.boolean().required(),
    },
  },
  handler: async function registerEndpoint(req, h) {
    var payload = req.payload;
    var secret = unique.secret();
    var client = {
      id: unique.id(),
      hashedSecret: encrypt.hash(secret),
      name: payload.name,
      redirectUri: payload.redirect_uri,
      imageUri: payload.image_uri || '',
      canGrant: !!payload.can_grant,
      trusted: !!payload.trusted,
    };
    var developerEmail = req.auth.credentials.email;
    var developerId = null;

    return db
      .getDeveloper(developerEmail)
      .then(function(developer) {
        // must be a developer to register clients
        if (!developer) {
          throw AppError.unauthorized('Illegal Developer');
        }

        developerId = developer.developerId;

        return db.registerClient(client);
      })
      .then(function() {
        return db.registerClientDeveloper(developerId, hex(client.id));
      })
      .then(function() {
        return h
          .response({
            id: hex(client.id),
            secret: hex(secret),
            name: client.name,
            redirect_uri: client.redirectUri,
            image_uri: client.imageUri,
            can_grant: client.canGrant,
            trusted: client.trusted,
          })
          .code(201);
      });
  },
};
