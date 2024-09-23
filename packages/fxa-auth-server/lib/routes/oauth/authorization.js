/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hexModule from "buf";

const hex = hexModule.to.hex;
import Joi from 'joi';
import OauthError from '../../oauth/error';
import AuthError from '../../error';
import validators from '../../oauth/validators';
import { validateRequestedGrant, generateTokens } from '../../oauth/grant';
import { makeAssertionJWT } from '../../oauth/util';
import verifyAssertion from '../../oauth/assertion';
import { default as OAUTH_DOCS } from '../../../docs/swagger/oauth-api';
import { default as OAUTH_SERVER_DOCS } from '../../../docs/swagger/oauth-server-api';
import { default as DESCRIPTION } from '../../../docs/swagger/shared/descriptions';

const RESPONSE_TYPE_CODE = 'code';
const RESPONSE_TYPE_TOKEN = 'token';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const PKCE_SHA256_CHALLENGE_METHOD = 'S256'; // This server only supports S256 PKCE, no 'plain'
const PKCE_CODE_CHALLENGE_LENGTH = 43;

function isLocalHost(url) {
  var host = new URL(url).hostname;
  return host === 'localhost' || host === 'localhost';
}

export default ({ log, oauthDB, config }) => {
  if (!config) {
    config = require('../../../config').default.getProperties();
  }
  const MAX_TTL_S = config.oauthServer.expiration.accessToken / 1000;

  const DISABLED_CLIENTS = new Set(config.oauthServer.disabledClients);

  const ALLOWED_SCHEMES = ['https'];

  if (config.oauthServer.allowHttpRedirects === true) {
    // http scheme used when developing OAuth clients
    ALLOWED_SCHEMES.push('http');
  }
  const contentUrl = config.oauthServer.contentUrl;
  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    // TODO: dedupe config param with `oauthServer.disabledClients`
    config.oauth.disableNewConnectionsForClients || []
  );

  function checkDisabledClientId(payload) {
    const clientId = payload.client_id;
    if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw AuthError.disabledClientId(clientId);
    }
  }
  async function generateAuthorizationCode(client, payload, grant) {
    // Clients must use PKCE if and only if they are a public client.
    if (client.publicClient) {
      if (!payload.code_challenge_method || !payload.code_challenge) {
        log.info('client.missingPkceParameters');
        throw OauthError.missingPkceParameters();
      }
    } else {
      if (payload.code_challenge_method || payload.code_challenge) {
        log.info('client.notPublicClient');
        throw OauthError.notPublicClient({ id: payload.client_id });
      }
    }

    const state = payload.state;

    let code = await oauthDB.generateCode(
      Object.assign(grant, {
        codeChallengeMethod: payload.code_challenge_method,
        codeChallenge: payload.code_challenge,
        sessionTokenId:
          grant.sessionTokenId && Buffer.from(grant.sessionTokenId, 'hex'),
      })
    );
    code = hex(code);

    const redirect = new URL(payload.redirect_uri);
    redirect.searchParams.set('code', code);
    redirect.searchParams.set('state', state);
    return {
      code,
      state,
      redirect: redirect.href,
    };
  }

  // N.B. We do not correctly implement the "implicit grant" flow from
  // RFC6749 which defines `response_type=token`. Instead, we have a
  // privileged set of clients that use `response_type=token` for something
  // approximating the "resource owner password grant" flow, using an identity
  // assertion to just directly grant tokens for their own use. Known current
  // users of this functionality include:
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
      log.warn('grantType.notAllowed', {
        id: hex(client.id),
        grant_type: 'fxa-credentials',
      });
      throw OauthError.invalidResponseType();
    }
    const ttl = Math.min(payload.ttl, MAX_TTL_S);
    return generateTokens({
      ...grant,
      grantType: 'fxa-credentials',
      resource: payload.resource,
      ttl,
    });
  }

  function validateClientDetails(client, payload) {
    if (!payload.redirect_uri && !client.redirectUri) {
      throw OauthError.incorrectRedirect();
    }

    // Starting in train-248, FxA added the ability for an OAuth client to support
    // multiple redirect uris (comma separated list). The authorization flow redirect uri
    // must match one of these exactly. Pattern matching is not supported.
    const redirectUris = client.redirectUri.split(',');

    // Authorization flow must use a single specific redirect_uri,
    // but allowed to not provide one and have us fill it in automatically.
    payload.redirect_uri = payload.redirect_uri || redirectUris[0];

    const validUri = redirectUris.some((uri) => {
      if (uri === payload.redirect_uri) {
        return true;
      }
    });

    if (!validUri) {
      if (
        config.oauthServer.localRedirects &&
        isLocalHost(payload.redirect_uri)
      ) {
        log.debug('redirect.local', { uri: payload.redirect_uri });
      } else {
        throw OauthError.incorrectRedirect(payload.redirect_uri);
      }
    } else {
      log.debug('redirect.mismatch', {
        param: payload.redirect_uri,
        registered: client.redirectUri,
      });
    }
  }

  async function authorizationHandler(req) {
    const claims = await verifyAssertion(req.payload.assertion);

    const client = await oauthDB.getClient(
      Buffer.from(req.payload.client_id, 'hex')
    );
    if (!client) {
      log.debug('notFound', { id: req.payload.client_id });
      throw OauthError.unknownClient(req.payload.client_id);
    }
    validateClientDetails(client, req.payload);
    const grant = await validateRequestedGrant(claims, client, req.payload);
    switch (req.payload.response_type) {
      case RESPONSE_TYPE_CODE:
        return await generateAuthorizationCode(client, req.payload, grant);
      case RESPONSE_TYPE_TOKEN: {
        const tokens = await generateImplicitGrant(client, req.payload, grant);
        req.emitMetricsEvent('token.created', {
          service: hex(grant.clientId),
          uid: hex(grant.userId),
        });
        return tokens;
      }
      default:
        // Joi validation means this should never happen.
        log.fatal('joi.response_type', {
          response_type: req.payload.response_type,
        });
        throw OauthError.invalidResponseType();
    }
  }

  return [
    {
      method: 'GET',
      path: '/authorization',
      config: {
        ...OAUTH_SERVER_DOCS.AUTHORIZATION_GET,
        cors: { origin: 'ignore' },
        handler: async function redirectAuthorization(req, h) {
          // keys_jwk is barred from transiting the OAuth server
          // to prevent a malicious OAuth server from stealing
          // a user's Scoped Keys. See bz1456351
          if (req.query.keys_jwk) {
            throw OauthError.invalidRequestParameter({ keys: ['keys_jwk'] });
          }

          const redirect = new URL(contentUrl);
          redirect.pathname = '/authorization';
          redirect.search = new URLSearchParams(req.query);
          return h.redirect(redirect.href);
        },
      },
    },
    {
      method: 'POST',
      path: '/authorization',
      config: {
        ...OAUTH_SERVER_DOCS.AUTHORIZATION_POST,
        cors: { origin: 'ignore' },
        validate: {
          payload: Joi.object({
            client_id: validators.clientId.description(
              DESCRIPTION.clientId + DESCRIPTION.clientIdRegistration
            ),
            assertion: validators.assertion
              .required()
              .description(DESCRIPTION.assertion),
            redirect_uri: Joi.string()
              .max(256)
              // uri validation ref: https://github.com/hapijs/joi/blob/master/API.md#stringurioptions
              .uri({
                scheme: ALLOWED_SCHEMES,
              })
              .description(DESCRIPTION.redirectUri),
            scope: validators.scope.required().description(DESCRIPTION.scope),
            response_type: Joi.string()
              .valid(RESPONSE_TYPE_CODE, RESPONSE_TYPE_TOKEN)
              .default(RESPONSE_TYPE_CODE)
              .description(DESCRIPTION.responseTypeOauth),
            state: Joi.string()
              .max(512)
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.required(),
              })
              .description(DESCRIPTION.state),
            ttl: Joi.number()
              .positive()
              .default(MAX_TTL_S)
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.ttlOauth + DESCRIPTION.ttlOAuthPostAuth),
            access_type: Joi.string()
              .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
              .default(ACCESS_TYPE_ONLINE)
              .optional()
              .description(DESCRIPTION.accessType),
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
              })
              .description(DESCRIPTION.codeChallengeMethod),
            code_challenge: Joi.string()
              .length(PKCE_CODE_CHALLENGE_LENGTH)
              .when('response_type', {
                is: RESPONSE_TYPE_CODE,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.codeChallenge),
            keys_jwe: validators.jwe
              .when('response_type', {
                is: RESPONSE_TYPE_CODE,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.keysJwe),
            acr_values: Joi.string()
              .max(256)
              .optional()
              .allow(null)
              .description(DESCRIPTION.acrValues),
            resource: validators.resourceUrl
              .when('response_type', {
                is: RESPONSE_TYPE_TOKEN,
                then: Joi.optional(),
                otherwise: Joi.forbidden(),
              })
              .description(DESCRIPTION.resource + DESCRIPTION.resourceOauth),
          }),
        },
        response: {
          schema: Joi.object()
            .keys({
              redirect: Joi.string(),
              code: Joi.string().description(DESCRIPTION.codeOauth),
              state: Joi.string().description(DESCRIPTION.state),
              access_token: validators.accessToken.description(
                DESCRIPTION.accessToken
              ),
              token_type: Joi.string()
                .valid('bearer')
                .description(DESCRIPTION.tokenType),
              scope: Joi.string().allow('').description(DESCRIPTION.scope),
              auth_at: Joi.number().description(DESCRIPTION.authAt),
              expires_in: Joi.number().description(DESCRIPTION.expiresIn),
            })
            .with('access_token', [
              'token_type',
              'scope',
              'auth_at',
              'expires_in',
            ])
            .with('code', ['state', 'redirect'])
            .without('code', ['access_token']),
        },
        handler: function (req) {
          // Refuse to generate new codes or tokens for disabled clients.
          if (DISABLED_CLIENTS.has(req.payload.client_id)) {
            throw OauthError.disabledClient(req.payload.client_id);
          }
          return authorizationHandler(req);
        },
      },
    },
    {
      method: 'POST',
      path: '/oauth/authorization',
      config: {
        ...OAUTH_DOCS.OAUTH_AUTHORIZATION_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: Joi.object({
            response_type: Joi.string()
              .valid('code')
              .default('code')
              .description(DESCRIPTION.responseType),
            client_id: validators.clientId
              .required()
              .description(DESCRIPTION.clientId),
            redirect_uri: Joi.string()
              .max(256)
              .uri({
                scheme: ['http', 'https'],
              })
              .optional()
              .description(DESCRIPTION.redirectUri),
            scope: validators.scope.optional().description(DESCRIPTION.scope),
            state: Joi.string()
              .max(512)
              .required()
              .description(DESCRIPTION.state),
            access_type: Joi.string()
              .valid('offline', 'online')
              .default('online')
              .description(DESCRIPTION.accessType),
            code_challenge_method: validators.pkceCodeChallengeMethod
              .optional()
              .description(DESCRIPTION.codeChallengeMethod),
            code_challenge: validators.pkceCodeChallenge
              .optional()
              .description(DESCRIPTION.codeChallenge),
            keys_jwe: validators.jwe
              .optional()
              .description(DESCRIPTION.keysJwe),
            acr_values: Joi.string()
              .max(256)
              .allow(null)
              .optional()
              .description(DESCRIPTION.acrValues),
            assertion: Joi.forbidden(),
            resource: Joi.forbidden(),
          }).and('code_challenge', 'code_challenge_method'),
        },
        response: {
          schema: Joi.object({
            redirect: Joi.string(),
            code: Joi.string(),
            state: Joi.string().max(512),
          }),
        },
      },
      handler: async function (req) {
        checkDisabledClientId(req.payload);
        const sessionToken = req.auth.credentials;
        req.payload.assertion = await makeAssertionJWT(config, sessionToken);
        const result = await authorizationHandler(req);

        const geoData = req.app.geo;
        const country = geoData.location && geoData.location.country;
        const countryCode = geoData.location && geoData.location.countryCode;
        const { email, uid } = sessionToken;
        const devices = await req.app.devices;
        await log.notifyAttachedServices('login', req, {
          country,
          countryCode,
          deviceCount: devices.length,
          email,
          service: req.payload.client_id,
          clientId: req.payload.client_id,
          uid,
          userAgent: req.headers['user-agent'],
        });
        return result;
      },
    },
  ];
};
