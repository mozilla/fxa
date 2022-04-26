/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../docs/swagger/misc-api';
import OAUTH_DOCS from '../../../docs/swagger/oauth-api';

const Joi = require('@hapi/joi');

const OauthError = require('../../oauth/error');
const AuthError = require('../../error');
const config = require('../../../config').getProperties();
const validators = require('../../oauth/validators');
const verifyAssertion = require('../../oauth/assertion');
const { validateRequestedGrant } = require('../../oauth/grant');
const { makeAssertionJWT } = require('../../oauth/util');

/**
 * We don't yet support rotating individual scoped keys,
 * so for now we use a fixed buffer of zeros as the rotation secret.
 * When we come to add fine-grained key rotation these values will
 * need to be looked up dynamically from the db or config,
 * @type {String}
 */

const DEFAULT_KEY_ROTATION_SECRET = Buffer.alloc(32).toString('hex');
const DEFAULT_KEY_ROTATION_TIMESTAMP = 0;

const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
  config.oauth.disableNewConnectionsForClients || []
);

function checkDisabledClientId(payload) {
  const clientId = payload.client_id;
  if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
    throw AuthError.disabledClientId(clientId);
  }
}

module.exports = ({ log, oauthDB }) => {
  async function keyDataHandler(req) {
    const claims = await verifyAssertion(req.payload.assertion);

    const client = await oauthDB.getClient(
      Buffer.from(req.payload.client_id, 'hex')
    );
    if (!client) {
      log.debug('keyDataRoute.clientNotFound', {
        id: req.payload.client_id,
      });
      throw OauthError.unknownClient(req.payload.client_id);
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
    const keysChangedAt =
      claims['fxa-keysChangedAt'] || claims['fxa-generation'];
    const response = {};
    for (const keyScope of keyBearingScopes) {
      const keyRotationTimestamp = Math.max(
        keysChangedAt,
        keyScope.keyRotationTimestamp
      );
      // If the assertion certificate was issued prior to a key-rotation event,
      // we don't want to revel the new secrets to such stale assertions,
      // even if they are technically still valid.
      if (iat < Math.floor(keyRotationTimestamp / 1000)) {
        throw OauthError.staleAuthAt(iat);
      }
      response[keyScope.scope] = {
        identifier: keyScope.scope,
        keyRotationSecret: keyScope.keyRotationSecret,
        keyRotationTimestamp,
      };
    }

    return response;
  }

  return [
    {
      method: 'POST',
      path: '/key-data',
      config: {
        ...MISC_DOCS.KEY_DATA_POST,
        cors: { origin: 'ignore' },
        validate: {
          payload: Joi.object({
            client_id: validators.clientId,
            assertion: validators.assertion.required(),
            scope: validators.scope.required(),
          }).label('KeyData_payload'),
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
        handler: keyDataHandler,
      },
    },
    {
      method: 'POST',
      path: '/account/scoped-key-data',
      config: {
        ...OAUTH_DOCS.ACCOUNT_SCOPED_KEY_DATA_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: Joi.object({
            client_id: validators.clientId.required(),
            scope: validators.scope.required(),
            assertion: Joi.forbidden(),
          }).label('Oauth.scopedKeyData_payload'),
        },
        response: {
          schema: Joi.object().pattern(
            Joi.any(),
            Joi.object({
              identifier: validators.scope.required(),
              keyRotationSecret: validators.hexString.length(64).required(),
              keyRotationTimestamp: Joi.number().required(),
            }).label('Oauth.scopedKeyData_response')
          ),
        },
      },
      handler: async function (req) {
        checkDisabledClientId(req.payload);
        const sessionToken = req.auth.credentials;
        req.payload.assertion = await makeAssertionJWT(config, sessionToken);
        try {
          return await keyDataHandler(req);
        } catch (err) {
          if (err.errno === 101) {
            throw new AuthError.unknownClientId(req.payload.client_id);
          }
          throw err;
        }
      },
    },
  ];
};
