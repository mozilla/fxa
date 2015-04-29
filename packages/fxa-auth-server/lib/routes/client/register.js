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
const AppError = require('../../error');

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
      terms_uri: Joi.string().max(256).allow(''),
      privacy_uri: Joi.string().max(256).allow(''),
      can_grant: Joi.boolean(),
      // XXX TODO: a future PR will remove legacy "whitelisted" property
      whitelisted: Joi.boolean(),
      trusted: Joi.boolean()
    }
  },
  response: {
    schema: {
      id: validators.clientId,
      secret: validators.clientSecret,
      name: Joi.string().required(),
      image_uri: Joi.string().allow(''),
      redirect_uri: Joi.string().required(),
      terms_uri: Joi.string().required().allow(''),
      privacy_uri: Joi.string().required().allow(''),
      can_grant: Joi.boolean().required(),
      // XXX TODO: a future PR will remove legacy "whitelisted" property
      whitelisted: Joi.boolean().required(),
      trusted: Joi.boolean().required()
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
      termsUri: payload.terms_uri || '',
      privacyUri: payload.privacy_uri || '',
      canGrant: !!payload.can_grant,
      // XXX TODO: a future PR will remove legacy "whitelisted" property.
      // Accept both for now for API b/w compat.
      trusted: !!(typeof payload.trusted !== 'undefined' ?
                    payload.trusted :
                    payload.whitelist)
    };
    var developerEmail = req.auth.credentials.email;
    var developerId = null;

    return db.getDeveloper(developerEmail)
      .then(function (developer) {

        // must be a developer to register clients
        if (! developer) {
          throw AppError.unauthorized('Illegal Developer');
        }

        developerId = developer.developerId;

        return db.registerClient(client);
      })
      .then(function() {
        return db.registerClientDeveloper(developerId, hex(client.id));
      })
      .then(function() {
        reply({
          id: hex(client.id),
          secret: hex(secret),
          name: client.name,
          redirect_uri: client.redirectUri,
          image_uri: client.imageUri,
          terms_uri: client.termsUri,
          privacy_uri: client.privacyUri,
          can_grant: client.canGrant,
          // XXX TODO: a future PR will remove legacy "whitelisted" property
          whitelisted: client.trusted,
          trusted: client.trusted
        }).code(201);
      }, reply);
  }
};
