/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Joi from 'joi';

import OauthError from '../../oauth/error';
import AuthError from '../../error';
import configModule from "../../../config";
const config = configModule.getProperties();
import validators from '../../oauth/validators';
import verifyAssertion from '../../oauth/assertion';
import { validateRequestedGrant } from '../../oauth/grant';
import { makeAssertionJWT } from '../../oauth/util';
import { default as DESCRIPTION } from '../../../docs/swagger/shared/descriptions';
import { default as OAUTH_DOCS } from '../../../docs/swagger/oauth-api';
import { default as OAUTH_SERVER_DOCS } from '../../../docs/swagger/oauth-server-api';

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

export default ({ log, oauthDB, statsd }) => {
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
        ...OAUTH_SERVER_DOCS.KEY_DATA_POST,
        cors: { origin: 'ignore' },
        validate: {
          payload: Joi.object({
            client_id: validators.clientId.description(DESCRIPTION.clientId),
            assertion: validators.assertion
              .required()
              .description(DESCRIPTION.assertion),
            scope: validators.scope.required().description(DESCRIPTION.scope),
          }),
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
          }),
        },
        response: {
          schema: Joi.object().pattern(
            Joi.any(),
            Joi.object({
              identifier: validators.scope.required(),
              keyRotationSecret: validators.hexString.length(64).required(),
              keyRotationTimestamp: Joi.number().required(),
            })
          ),
        },
      },
      handler: async function (req) {
        checkDisabledClientId(req.payload);
        const sessionToken = req.auth.credentials;
        req.payload.assertion = await makeAssertionJWT(config, sessionToken);
        statsd.increment('oauth.rp.scoped-keys-metadata', {
          clientId: req.payload.client_id,
        });
        try {
          return await keyDataHandler(req);
        } catch (err) {
          if (err.errno === 101) {
            throw AuthError.unknownClientId(req.payload.client_id);
          }
          throw err;
        }
      },
    },
  ];
};
