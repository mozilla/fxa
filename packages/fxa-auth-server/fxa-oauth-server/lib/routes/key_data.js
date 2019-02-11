/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const db = require('../db');
const logger = require('../logging')('routes.key_data');
const P = require('../promise');
const validators = require('../validators');
const verifyAssertion = require('../assertion');
const ScopeSet = require('fxa-shared').oauth.scopes;

/**
 * We don't yet support rotating individual scoped keys,
 * so for now we use a fixed buffer of zeros as the rotation secret.
 * When we come to add fine-grained key rotation these values will
 * need to be looked up dynamically from the db or config,
 * @type {String}
 */

const DEFAULT_KEY_ROTATION_SECRET = Buffer.alloc(32).toString('hex');
const DEFAULT_KEY_ROTATION_TIMESTAMP = 0;

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
  handler: async function keyDataRoute(req) {
    logger.debug('keyDataRoute.start', {
      params: req.params,
      payload: req.payload
    });

    const requestedScopes = req.payload.scope;
    const requestedClientId = req.payload.client_id;

    const [claims, scopes] = await P.all([
      verifyAssertion(req.payload.assertion),
      db.getClient(Buffer.from(requestedClientId, 'hex')).then((client) => {
        if (client) {
          // find all requested scopes that are allowed for this client.
          const allowedScopes = ScopeSet.fromString(client.allowedScopes || '');
          const scopeLookups = requestedScopes.filtered(allowedScopes).getScopeValues().map(scope => db.getScope(scope));
          return P.all(scopeLookups).then(scopeRecords => {
            return scopeRecords.filter(scope => !! (scope && scope.hasScopedKeys))
              .map(scope => {
                // When we implement key rotation these values will come from the db.
                // For now all scoped keys have the default values.
                scope.keyRotationSecret = DEFAULT_KEY_ROTATION_SECRET;
                scope.keyRotationTimestamp = DEFAULT_KEY_ROTATION_TIMESTAMP;
                return scope;
              });
          });
        } else {
          logger.debug('keyDataRoute.clientNotFound', { id: req.payload.client_id });
          throw AppError.unknownClient(requestedClientId);
        }
      })
    ]);

    const iat = claims.iat || claims['fxa-lastAuthAt'];
    const response = {};
    scopes.forEach((keyScope) => {
      const keyRotationTimestamp = Math.max(claims['fxa-generation'], keyScope.keyRotationTimestamp);
      // If the assertion certificate was issued prior to a key-rotation event,
      // we don't want to revel the new secrets to such stale assertions,
      // even if they are technically still valid.
      if (iat < Math.floor(keyRotationTimestamp / 1000)) {
        throw AppError.staleAuthAt(iat);
      }
      response[keyScope.scope] = {
        identifier: keyScope.scope,
        keyRotationSecret: keyScope.keyRotationSecret,
        keyRotationTimestamp
      };
    });

    return response;
  }
};
