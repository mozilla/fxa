/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const db = require('../db');
const logger = require('../logging')('routes.key_data');
const validators = require('../validators');
const verifyAssertion = require('../assertion');
const { validateRequestedGrant } = require('../grant');

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
      scope: validators.scope.required(),
    },
  },
  response: {
    schema: Joi.object().pattern(/^/, [
      Joi.object({
        identifier: Joi.string().required(),
        keyRotationSecret: Joi.string().required(),
        keyRotationTimestamp: Joi.number().required(),
      }),
    ]),
  },
  handler: async function keyDataRoute(req) {
    const claims = await verifyAssertion(req.payload.assertion);

    const client = await db.getClient(
      Buffer.from(req.payload.client_id, 'hex')
    );
    if (!client) {
      logger.debug('keyDataRoute.clientNotFound', {
        id: req.payload.client_id,
      });
      throw AppError.unknownClient(req.payload.client_id);
    }

    const requestedGrant = await validateRequestedGrant(
      claims,
      client,
      req.payload
    );

    const keyBearingScopes = [];
    for (const scope of req.payload.scope.getScopeValues()) {
      const s = requestedGrant.scopeConfig[scope];
      if (s && s.hasScopedKeys) {
        // When we implement key rotation these values will come from the db.
        // For now all scoped keys have the default values.
        s.keyRotationSecret = DEFAULT_KEY_ROTATION_SECRET;
        s.keyRotationTimestamp = DEFAULT_KEY_ROTATION_TIMESTAMP;
        keyBearingScopes.push(s);
      }
    }

    const iat = claims.iat || claims['fxa-lastAuthAt'];
    const response = {};
    for (const keyScope of keyBearingScopes) {
      const keyRotationTimestamp = Math.max(
        claims['fxa-generation'],
        keyScope.keyRotationTimestamp
      );
      // If the assertion certificate was issued prior to a key-rotation event,
      // we don't want to revel the new secrets to such stale assertions,
      // even if they are technically still valid.
      if (iat < Math.floor(keyRotationTimestamp / 1000)) {
        throw AppError.staleAuthAt(iat);
      }
      response[keyScope.scope] = {
        identifier: keyScope.scope,
        keyRotationSecret: keyScope.keyRotationSecret,
        keyRotationTimestamp,
      };
    }

    return response;
  },
};
