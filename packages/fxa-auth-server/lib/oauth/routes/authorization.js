/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const Joi = require('@hapi/joi');
const URI = require('urijs');

const AppError = require('../error');
const config = require('../../../config');
const db = require('../db');
const logger = require('../logging')('routes.authorization');
const validators = require('../validators');
const { validateRequestedGrant, generateTokens } = require('../grant');
const verifyAssertion = require('../assertion');

const RESPONSE_TYPE_CODE = 'code';
const RESPONSE_TYPE_TOKEN = 'token';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const PKCE_SHA256_CHALLENGE_METHOD = 'S256'; // This server only supports S256 PKCE, no 'plain'
const PKCE_CODE_CHALLENGE_LENGTH = 43;

const MAX_TTL_S = config.get('oauthServer.expiration.accessToken') / 1000;

const DISABLED_CLIENTS = new Set(config.get('oauthServer.disabledClients'));

var ALLOWED_SCHEMES = ['https'];

if (config.get('oauthServer.allowHttpRedirects') === true) {
  // http scheme used when developing OAuth clients
  ALLOWED_SCHEMES.push('http');
}

function isLocalHost(url) {
  var host = new URI(url).hostname();
  return host === 'localhost' || host === 'localhost';
}

module.exports = {
  validate: {
    payload: {
      client_id: validators.clientId,
      assertion: validators.assertion.required(),
      redirect_uri: Joi.string()
        .max(256)
        // uri validation ref: https://github.com/hapijs/joi/blob/master/API.md#stringurioptions
        .uri({
          scheme: ALLOWED_SCHEMES,
        }),
      scope: validators.scope.required(),
      response_type: Joi.string()
        .valid(RESPONSE_TYPE_CODE, RESPONSE_TYPE_TOKEN)
        .default(RESPONSE_TYPE_CODE),
      state: Joi.string().max(256).when('response_type', {
        is: RESPONSE_TYPE_TOKEN,
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      ttl: Joi.number()
        .positive()
        .max(MAX_TTL_S)
        .default(MAX_TTL_S)
        .when('response_type', {
          is: RESPONSE_TYPE_TOKEN,
          then: Joi.optional(),
          otherwise: Joi.forbidden(),
        }),
      access_type: Joi.string()
        .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
        .default(ACCESS_TYPE_ONLINE)
        .optional(),
      code_challenge_method: Joi.string()
        .valid(PKCE_SHA256_CHALLENGE_METHOD)
        .when('response_type', {
          is: RESPONSE_TYPE_CODE,
          then: Joi.optional(),
          otherwise: Joi.forbidden(),
        })
        .when('code_challenge', {
          is: Joi.string().required(),
          then: Joi.required(),
        }),
      code_challenge: Joi.string()
        .length(PKCE_CODE_CHALLENGE_LENGTH)
        .when('response_type', {
          is: RESPONSE_TYPE_CODE,
          then: Joi.optional(),
          otherwise: Joi.forbidden(),
        }),
      keys_jwe: validators.jwe.when('response_type', {
        is: RESPONSE_TYPE_CODE,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
      acr_values: Joi.string().max(256).optional().allow(null),

      resource: validators.resourceUrl.when('response_type', {
        is: RESPONSE_TYPE_TOKEN,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    },
  },
  response: {
    schema: Joi.object()
      .keys({
        redirect: Joi.string(),
        code: Joi.string(),
        state: Joi.string(),
        access_token: validators.accessToken,
        token_type: Joi.string().valid('bearer'),
        scope: Joi.string().allow(''),
        auth_at: Joi.number(),
        expires_in: Joi.number(),
      })
      .with('access_token', ['token_type', 'scope', 'auth_at', 'expires_in'])
      .with('code', ['state', 'redirect'])
      .without('code', ['access_token']),
  },
  handler: async function authorizationEndpoint(req) {
    // Refuse to generate new codes or tokens for disabled clients.
    if (DISABLED_CLIENTS.has(req.payload.client_id)) {
      throw AppError.disabledClient(req.payload.client_id);
    }

    const claims = await verifyAssertion(req.payload.assertion);

    const client = await db.getClient(
      Buffer.from(req.payload.client_id, 'hex')
    );
    if (!client) {
      logger.debug('notFound', { id: req.payload.client_id });
      throw AppError.unknownClient(req.payload.client_id);
    }
    validateClientDetails(client, req.payload);
    const grant = await validateRequestedGrant(claims, client, req.payload);
    switch (req.payload.response_type) {
      case RESPONSE_TYPE_CODE:
        return await generateAuthorizationCode(client, req.payload, grant);
      case RESPONSE_TYPE_TOKEN:
        return await generateImplicitGrant(client, req.payload, grant);
      default:
        // Joi validation means this should never happen.
        logger.critical('joi.response_type', {
          response_type: req.payload.response_type,
        });
        throw AppError.invalidResponseType();
    }
  },
};

async function generateAuthorizationCode(client, payload, grant) {
  // Clients must use PKCE if and only if they are a pubic client.
  if (client.publicClient) {
    if (!payload.code_challenge_method || !payload.code_challenge) {
      logger.info('client.missingPkceParameters');
      throw AppError.missingPkceParameters();
    }
  } else {
    if (payload.code_challenge_method || payload.code_challenge) {
      logger.info('client.notPublicClient');
      throw AppError.notPublicClient({ id: payload.client_id });
    }
  }

  const state = payload.state;

  let code = await db.generateCode(
    Object.assign(grant, {
      codeChallengeMethod: payload.code_challenge_method,
      codeChallenge: payload.code_challenge,
      sessionTokenId:
        grant.sessionTokenId && Buffer.from(grant.sessionTokenId, 'hex'),
    })
  );
  code = hex(code);

  const redirect = URI(payload.redirect_uri).addQuery({ code, state });

  return {
    code,
    state,
    redirect: String(redirect),
  };
}

// N.B. We do not correctly implement the "implicit grant" flow from
// RFC6749 which defines `response_type=token`. Instead we have a
// privileged set of clients that use `response_type=token` for something
// approximating the "resource owner password grant" flow, using an identity
// assertion to just directly grant tokens for their own use. Known current
// users of this functinality include:
//
//  * Firefox Desktop, for getting "profile"-scoped tokens to access profile data
//  * Firefox for Android, for getting "profile"-scoped tokens to access profile data
//  * Firefox for iOS, for getting "profile"-scoped tokens to access profile data
//
// New clients should not do this, and should instead of `grant_type=fxa-credentials`
// on the /token endpoint.
//
// This route is kept for backwards-compatibility only.
async function generateImplicitGrant(client, payload, grant) {
  if (!client.canGrant) {
    logger.warn('grantType.notAllowed', {
      id: hex(client.id),
      grant_type: 'fxa-credentials',
    });
    throw AppError.invalidResponseType();
  }
  return generateTokens({
    ...grant,
    grantType: 'fxa-credentials',
    resource: payload.resource,
    ttl: payload.ttl,
  });
}

function validateClientDetails(client, payload) {
  // Clients must use a single specific redirect_uri,
  // but they're allowed to not provide one and have us fill it in automatically.
  payload.redirect_uri = payload.redirect_uri || client.redirectUri;
  if (payload.redirect_uri !== client.redirectUri) {
    logger.debug('redirect.mismatch', {
      param: payload.redirect_uri,
      registered: client.redirectUri,
    });
    if (
      config.get('oauthServer.localRedirects') &&
      isLocalHost(payload.redirect_uri)
    ) {
      logger.debug('redirect.local', { uri: payload.redirect_uri });
    } else {
      throw AppError.incorrectRedirect(payload.redirect_uri);
    }
  }
}
