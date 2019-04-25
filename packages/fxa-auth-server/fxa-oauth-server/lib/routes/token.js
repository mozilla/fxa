/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 // This file implements the OAuth "token endpoint", the core endpoint of the OAuth
 // system at which clients can exchange their various types of authorization grant
 // for some OAuth tokens.   There's significant complexity here because of the
 // different types of grant:
 //
 //   * `grant_type=authorization_code` for vanilla exchange-a-code-for-a-token OAuth
 //   * `grant_type=refresh_token` for refreshing a previously-granted token
 //   * `grant_type=fxa-credentials` for directly granting via an FxA identity assertion
 //
 // And because of the different types of token that can be requested:
 //
 //   * A short-lived `access_token`
 //   * A long-lived `refresh_token`, via `access_type=offline`
 //   * An OpenID Connect `id_token`, via `scope=openid`
 //
 // And because of the different client authentication methods:
 //
 //   * `client_secret`, provided in either header or request body
 //   * PKCE parameters, if using `grant_type=authorization_code` with a public client
 //
 // So, we've tried to make it as readable as possible, but...be careful in there!

/*jshint camelcase: false*/
const crypto = require('crypto');
const AppError = require('../error');
const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('joi');

const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const logger = require('../logging')('routes.token');
const util = require('../util');
const validators = require('../validators');
const { validateRequestedGrant, generateTokens } = require('../grant');
const verifyAssertion = require('../assertion');

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;

const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_REFRESH_TOKEN = 'refresh_token';
// This is a custom grant type, so we use our standard "fxa-" prefix to avoid collisions.
// It's similar to the "Resource Owner Password Credentials" grant from [1] but uses an
// FxA identity assertion rather than directly specifying a password.
// [1] https://tools.ietf.org/html/rfc6749#section-1.3.3
const GRANT_FXA_ASSERTION = 'fxa-credentials';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const REFRESH_LAST_USED_AT_UPDATE_AFTER_MS = config.get('refreshToken.updateAfter');
const DISABLED_CLIENTS = new Set(config.get('disabledClients'));

const BASIC_AUTH_REGEX = /^Basic\s+([a-z0-9+\/]+)$/i;

const PAYLOAD_SCHEMA = Joi.object({

  // The client_id can be specified in Authorization header or request body,
  // but not both.
  client_id: validators.clientId
    .when('$headers.authorization', {
      is: Joi.string().required(),
      then: Joi.forbidden()
    }),

  // The client_secret can be specified in Authorization header or request body,
  // but not both.  In the code flow it is exclusive with `code_verifier`, and
  // in the refresh and fxa-credentials flows it's optional because of public clients.
  client_secret: validators.clientSecret
    .when('code_verifier', {
      is: Joi.string().required(),
      then: Joi.forbidden()
    })
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      then: Joi.optional()
    })
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      then: Joi.optional()
    })
    .when('$headers.authorization', {
      is: Joi.string().required(),
      then: Joi.forbidden()
    }),

  redirect_uri: validators.redirectUri.optional()
    .when('grant_type', {
      is: GRANT_AUTHORIZATION_CODE,
      otherwise: Joi.forbidden()
    }),

  grant_type: Joi.string()
    .valid(GRANT_AUTHORIZATION_CODE, GRANT_REFRESH_TOKEN, GRANT_FXA_ASSERTION)
    .default(GRANT_AUTHORIZATION_CODE)
    .optional(),

  ttl: Joi.number()
    .positive()
    .max(MAX_TTL_S)
    .default(MAX_TTL_S)
    .optional(),

  scope: validators.scope
    .when('grant_type', {
      is: Joi.string().valid(GRANT_REFRESH_TOKEN, GRANT_FXA_ASSERTION),
      otherwise: Joi.forbidden()
    }),

  access_type: Joi.string()
    .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
    .default(ACCESS_TYPE_ONLINE)
    .optional()
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      otherwise: Joi.forbidden()
    }),
  code: Joi.string()
    .length(config.get('unique.code') * 2)
    .regex(validators.HEX_STRING)
    .required()
    .when('grant_type', {
      is: GRANT_AUTHORIZATION_CODE,
      otherwise: Joi.forbidden()
    }),

  code_verifier: validators.codeVerifier
    .when('code', {
      is: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),

  refresh_token: validators.token
    .required()
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      otherwise: Joi.forbidden()
    }),

  assertion: validators.assertion
    .required()
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      otherwise: Joi.forbidden()
    })

});

module.exports = {
  validate: {
    headers: Joi.object({
      'authorization': Joi.string().regex(BASIC_AUTH_REGEX).optional()
    }).options({ allowUnknown: true }),
    // stripUnknown is used to allow various oauth2 libraries to be used
    // with FxA OAuth. Sometimes, they will send other parameters that
    // we don't use, such as `response_type`, or something else. Instead
    // of giving an error here, we can just ignore them.
    payload: PAYLOAD_SCHEMA.options({ stripUnknown: true })
  },
  response: {
    schema: Joi.object().keys({
      access_token: Joi.string().required(),//validators.token.required(),
      refresh_token: validators.token,
      id_token: validators.assertion,
      scope: validators.scope.required(),
      token_type: Joi.string().valid('bearer').required(),
      expires_in: Joi.number().max(MAX_TTL_S).required(),
      auth_at: Joi.number(),
      keys_jwe: validators.jwe.optional()
    })
  },
  handler: async function tokenEndpoint(req) {
    var params = req.payload;

    // Clients are allowed to provide credentials in either
    // the Authorization header or request body.  Normalize.
    const authzMatch = BASIC_AUTH_REGEX.exec(req.headers.authorization || '');
    if (authzMatch) {
      const creds = Buffer.from(authzMatch[1], 'base64').toString().split(':');
      const err = new AppError.invalidRequestParameter('authorization');
      if (creds.length !== 2) {
        throw err;
      }
      params.client_id = Joi.attempt(creds[0], validators.clientId, err);
      params.client_secret = Joi.attempt(creds[1], validators.clientSecret, err);
    }

    // Refuse to generate new access tokens for disabled clients that are already
    // connected to the account.  We allow disabled clients to claim existing authorization
    // codes, because otherwise we risk erroring out halfway through an app login flow
    // and presenting a very confusing user experience.  The /authorization endpoint refuses
    // to create new codes for disabled clients.
    if (DISABLED_CLIENTS.has(params.client_id) && params.grant_type !== GRANT_AUTHORIZATION_CODE) {
      throw AppError.disabledClient(req.payload.client_id);
    }

    const client = await authenticateClient(params);
    const requestedGrant = await validateGrantParameters(client, params);
    return await generateTokens(requestedGrant);
  }
};


async function authenticateClient(params) {
  const client = await getClientById(params.client_id);
  // Public clients can't be authenticated in any useful way,
  // and should never submit a client_secret.
  if (client.publicClient) {
    if (params.client_secret) {
      throw new AppError.invalidRequestParameter('client_secret');
    }
    return client;
  }
  // Check client_secret against both current and previous stored secrets,
  // to allow for seamless rotation of the secret.
  if (! params.client_secret) {
    throw new AppError.invalidRequestParameter('client_secret');
  }
  const submitted = encrypt.hash(buf(params.client_secret));
  const stored = client.hashedSecret;
  if (crypto.timingSafeEqual(submitted, stored)) {
    return client;
  }
  const storedPrevious = client.hashedSecretPrevious;
  if (storedPrevious) {
    if (crypto.timingSafeEqual(submitted, storedPrevious)) {
      logger.info('client.matchSecretPrevious', { client: client.id });
      return client;
    }
  }
  logger.info('client.mismatchSecret', { client: client.id });
  logger.verbose('client.mismatchSecret.details', {
    submitted: submitted,
    db: stored,
    dbPrevious: storedPrevious
  });
  throw AppError.incorrectSecret(client.id);
}


async function getClientById(clientId) {
  const client = await db.getClient(buf(clientId));
  if (! client) {
    logger.debug('client.notFound', { id: clientId });
    throw AppError.unknownClient(clientId);
  }
  return client;
}


async function validateGrantParameters(client, params) {
  let requestedGrant;
  switch (params.grant_type) {
  case GRANT_AUTHORIZATION_CODE:
    requestedGrant = await validateAuthorizationCodeGrant(client, params);
    break;
  case GRANT_REFRESH_TOKEN:
    requestedGrant = await validateRefreshTokenGrant(client, params);
    break;
  case GRANT_FXA_ASSERTION:
    requestedGrant = await validateAssertionGrant(client, params);
    break;
  default:
    // Joi validation means this should never happen.
    logger.critical('joi.grant_type', { grant_type: params.grant_type } );
    throw Error('unreachable');
  }
  requestedGrant.ttl = params.ttl;
  return requestedGrant;
}


async function validateAuthorizationCodeGrant(client, params) {
  const code = params.code;
  // PKCE should only be used by public clients, and we can check this
  // before even looking up the code in the db.
  let pkceHashValue;
  if (params.code_verifier) {
    if (! client.publicClient) {
      logger.debug('client.notPublicClient', { id: client.id });
      throw AppError.notPublicClient(client.id);
    }
    pkceHashValue = pkceHash(params.code_verifier);
  }
  // Does the code actually exist?
  const codeObj = await db.getCode(buf(code));
  if (! codeObj) {
    logger.debug('code.notFound', { code: code });
    throw AppError.unknownCode(code);
  }
  // Does it belong to this client?
  if (! crypto.timingSafeEqual(codeObj.clientId, client.id)) {
    logger.debug('code.mismatch', {
      client: hex(client.id),
      code: hex(codeObj.clientId)
    });
    throw AppError.mismatchCode(code, client.id);
  }
  // Has it expired?
  // The + is because loldatemath; without it, it does string concat.
  const expiresAt = +codeObj.createdAt + config.get('expiration.code');
  if (Date.now() > expiresAt) {
    logger.debug('code.expired', { code: code });
    throw AppError.expiredCode(code, expiresAt);
  }
  // If it used PKCE...
  if (codeObj.codeChallenge) {
    // Was it using the one variant that we support?
    // We should never have written such data, but double-checking in case we add
    // other methods in future but forget to update the code here.
    if (codeObj.codeChallengeMethod !== 'S256') {
      throw AppError.mismatchCodeChallenge(pkceHashValue);
    }
    // Did they provide a challenge verifier at all?
    if (! pkceHashValue) {
      throw AppError.missingPkceParameters();
    }
    // Did they provide the *correct* challenge verifier?
    if (! crypto.timingSafeEqual(Buffer.from(codeObj.codeChallenge), Buffer.from(pkceHashValue))) {
      throw AppError.mismatchCodeChallenge(pkceHashValue);
    }
  }
  // Is a very confused client is attempting to use PCKE to claim a code
  // that wasn't actually created using PKCE?
  if (params.code_verifier && ! codeObj.codeChallenge) {
    throw AppError.mismatchCodeChallenge(pkceHashValue);
  }
  // Looks legit! Codes are one-time-use, so remove it from the db.
  await db.removeCode(buf(code));
  return codeObj;
}


async function validateRefreshTokenGrant(client, params) {
  // Does the refresh token actually exist?
  const tokObj = await db.getRefreshToken(encrypt.hash(params.refresh_token));
  if (! tokObj) {
    logger.debug('refresh_token.notFound', { refresh_token: params.refresh_token });
    throw AppError.invalidToken();
  }
  // Does it belong to this client?
  if (! crypto.timingSafeEqual(tokObj.clientId, client.id)) {
    logger.debug('refresh_token.mismatch', {
      client: params.client_id,
      code: tokObj.clientId
    });
    throw AppError.invalidToken();
  }
  // Does it have all the requested scopes?
  if (! tokObj.scope.contains(params.scope)) {
    logger.debug('refresh_token.invalidScopes', {
      allowed: tokObj.scope,
      requested: params.scope
    });
    throw AppError.invalidScopes(params.scope.difference(tokObj.scope).getScopeValues());
  }
  // Limit the new grant to just the requested scopes.
  tokObj.scope = params.scope;
  // An additional sanity-check that we don't accidentally grant refresh tokens
  // from other refresh tokens.  There should be no way to trigger this in practice.
  if (tokObj.offline) {
    throw AppError.invalidRequestParameter();
  }
  // Periodically update last-used-at timestamp in the db.
  // We don't do this every time because of the write load.
  var now = new Date();
  var lastUsedAt = tokObj.lastUsedAt;
  if ((now - lastUsedAt) > REFRESH_LAST_USED_AT_UPDATE_AFTER_MS) {
    await db.usedRefreshToken(encrypt.hash(params.refresh_token));
    logger.debug('usedRefreshToken.updated', { now });
  } else {
    logger.debug('usedRefreshToken.not_updated');
  }
  return tokObj;
}


async function validateAssertionGrant(client, params) {
  // Is the client allowed to do direct grants?
  if (! client.canGrant) {
    logger.warn('grantType.notAllowed', {
      id: hex(client.id),
      grant_type: 'fxa-credentials'
    });
    throw AppError.invalidGrantType();
  }
  // There's no reason a non-public client should ever be allowed
  // to do direct grants, check that as well for extra safety.
  if (! client.publicClient) {
    throw AppError.notPublicClient(client.id);
  }
  // Did it provide a valid identity assertion?
  const claims = await verifyAssertion(params.assertion);
  // Is the client allowed to have all the scopes etc in the requested grant?
  return await validateRequestedGrant(claims, client, params);
}


/**
 * Generate a PKCE code_challenge
 * See https://tools.ietf.org/html/rfc7636#section-4.6 for details
 */
function pkceHash(input) {
  return util.base64URLEncode(crypto.createHash('sha256').update(input).digest());
}

