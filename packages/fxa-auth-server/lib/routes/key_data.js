/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const db = require('../db');
const logger = require('../logging')('routes.key_data');
const P = require('../promise');
const validators = require('../validators');
const verify = require('../browserid');
const ScopeSet = require('fxa-shared').oauth.scopes;
const config = require('../config');

const AUTH_EXPIRES_AFTER_MS = config.get('expiration.keyDataAuth');

/**
 * We're using a static value for key material on purpose, in future this value can read from the DB.
 * @type {String}
 */
const KEY_ROTATION_SECRET = Buffer.alloc(32).toString('hex');

module.exports = {
  validate: {
    payload: {
      client_id: validators.clientId,
      assertion: validators.assertion.required(),
      scope: validators.scope
    }
  },
  response: {
    schema: Joi.object().pattern(/^/, [
      Joi.object({
        identifier: Joi.string().required(),
        keyRotationSecret: Joi.string().required(),
        keyRotationTimestamp: Joi.number().required()
      })
    ])
  },
  handler: function keyDataRoute(req, reply) {
    logger.debug('keyDataRoute.start', {
      params: req.params,
      payload: req.payload
    });

    const requestedScopes = ScopeSet.fromString(req.payload.scope);
    const requestedClientId = req.payload.client_id;

    P.all([
      verify(req.payload.assertion),
      db.getClient(Buffer.from(requestedClientId, 'hex')).then((client) => {
        if (client) {
          // find all requested scopes that are allowed for this client.
          const allowedScopes = ScopeSet.fromString(client.allowedScopes);
          const scopeLookups = requestedScopes.filtered(allowedScopes).getScopeValues().map(s => db.getScope(s));
          return P.all(scopeLookups).then((result) => {
            return result.filter((s) => !! s.hasScopedKeys);
          });
        } else {
          logger.debug('keyDataRoute.clientNotFound', { id: req.payload.client_id });
          throw AppError.unknownClient(requestedClientId);
        }
      })
    ]).then((results => {
      logger.debug('keyDataRoute.results', JSON.stringify(results));
      const assertionData = results[0];
      const scopeResults = results[1];
      const response = {};

      if (assertionData['fxa-lastAuthAt'] < (Date.now() - AUTH_EXPIRES_AFTER_MS) / 1000) {
        throw AppError.staleAuthAt(assertionData['fxa-lastAuthAt']);
      }

      scopeResults.forEach((keyScope) => {
        response[keyScope.scope] = {
          identifier: keyScope.scope,
          keyRotationSecret: KEY_ROTATION_SECRET,
          keyRotationTimestamp: assertionData['fxa-generation']
        };
      });

      return response;
    })).done(reply, reply);

  }
};
