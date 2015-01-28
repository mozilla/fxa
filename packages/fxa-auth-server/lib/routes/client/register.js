/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const auth = require('../../auth');
const db = require('../../db');
const encrypt = require('../../encrypt');
const hex = require('buf').to.hex;
const unique = require('../../unique');
const validators = require('../../validators');


/*jshint camelcase: false*/
module.exports = {
  auth: {
    strategy: auth.AUTH_STRATEGY,
    scope: [auth.SCOPE_CLIENT_MANAGEMENT]
  },
  validate: {
    payload: {
      name: Joi.string().max(256).required(),
      image_uri: Joi.string().max(256).allow(''),
      redirect_uri: Joi.string().max(256).required(),
      can_grant: Joi.boolean(),
      whitelisted: Joi.boolean()
    }
  },
  response: {
    schema: {
      id: validators.clientId,
      secret: validators.clientSecret,
      name: Joi.string().required(),
      image_uri: Joi.string().allow(''),
      redirect_uri: Joi.string().required(),
      can_grant: Joi.boolean().required(),
      whitelisted: Joi.boolean().required()
    }
  },
  handler: function registerEndpoint(req, reply) {
    var payload = req.payload;
    var secret = unique.secret();
    var client = {
      id: unique.id(),
      hashedSecret: encrypt.hash(secret),
      name: payload.name,
      redirectUri: payload.redirect_uri,
      imageUri: payload.image_uri || '',
      canGrant: !!payload.can_grant,
      whitelisted: !!payload.whitelisted
    };
    db.registerClient(client).then(function() {
      reply({
        id: hex(client.id),
        secret: hex(secret),
        name: client.name,
        redirect_uri: client.redirectUri,
        image_uri: client.imageUri,
        can_grant: client.canGrant,
        whitelisted: client.whitelisted
      }).code(201);
    }, reply);
  }
};
