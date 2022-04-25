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

import MISC_DOCS from '../../../docs/swagger/misc-api';
import OAUTH_DOCS from '../../../docs/swagger/oauth-api';
import DESCRIPTION from '../../../docs/swagger/shared/descriptions';

/*jshint camelcase: false*/
const crypto = require('crypto');
const OauthError = require('../../oauth/error');
const AuthError = require('../../error');
const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('@hapi/joi');

const {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_SESSION_TOKEN,
} = require('fxa-shared/oauth/constants');
const config = require('../../../config');
const encrypt = require('fxa-shared/auth/encrypt');
const util = require('../../oauth/util');
const oauthRouteUtils = require('../utils/oauth');
const token = require('../../oauth/token');
const validators = require('../../oauth/validators');
const { validateRequestedGrant, generateTokens } = require('../../oauth/grant');
const verifyAssertion = require('../../oauth/assertion');
const { makeAssertionJWT } = require('../../oauth/util');
const {
  authenticateClient,
  clientAuthValidators,
} = require('../../oauth/client');
const ScopeSet = require('fxa-shared').oauth.scopes;

const MAX_TTL_S = config.get('oauthServer.expiration.accessToken') / 1000;

const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_REFRESH_TOKEN = 'refresh_token';
// This is a custom grant type, so we use our standard "fxa-" prefix to avoid collisions.
// It's similar to the "Resource Owner Password Credentials" grant from [1] but uses an
// FxA identity assertion rather than directly specifying a password.
// [1] https://tools.ietf.org/html/rfc6749#section-1.3.3
const GRANT_FXA_ASSERTION = 'fxa-credentials';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const DISABLED_CLIENTS = new Set(config.get('oauthServer.disabledClients'));

// These scopes are used to request a one-off exchange of claims or credentials,
// but they don't make sense to use on an ongoing basis via refresh tokens.
const SCOPES_TO_EXCLUDE_FROM_REFRESH_TOKEN_GRANTS = ScopeSet.fromArray([
  'openid',
  'https://identity.mozilla.com/tokens/session',
]);

const PAYLOAD_SCHEMA = Joi.object({
  client_id: clientAuthValidators.clientId,

  // The client_secret can be specified in Authorization header or request body,
  // but not both.  In the code flow it is exclusive with `code_verifier`, and
  // in the refresh and fxa-credentials flows it's optional because of public clients.
  client_secret: clientAuthValidators.clientSecret
    .when('code_verifier', {
      is: Joi.string().required(),
      then: Joi.forbidden(),
    })
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      then: Joi.optional(),
    })
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      then: Joi.optional(),
    }),

  redirect_uri: validators.redirectUri.optional().when('grant_type', {
    is: GRANT_AUTHORIZATION_CODE,
    otherwise: Joi.forbidden(),
  }),

  grant_type: Joi.string()
    .valid(GRANT_AUTHORIZATION_CODE, GRANT_REFRESH_TOKEN, GRANT_FXA_ASSERTION)
    .default(GRANT_AUTHORIZATION_CODE)
    .optional(),

  ttl: Joi.number().positive().default(MAX_TTL_S).optional(),

  scope: Joi.alternatives()
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      then: validators.scope.optional(),
    })
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      then: validators.scope.required(),
      otherwise: Joi.forbidden(),
    }),

  access_type: Joi.string()
    .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
    .default(ACCESS_TYPE_ONLINE)
    .optional()
    .when('grant_type', {
      is: GRANT_FXA_ASSERTION,
      otherwise: Joi.forbidden(),
    }),
  code: Joi.string()
    .length(config.get('oauthServer.unique.code') * 2)
    .regex(validators.HEX_STRING)
    .required()
    .when('grant_type', {
      is: GRANT_AUTHORIZATION_CODE,
      otherwise: Joi.forbidden(),
    }),

  code_verifier: validators.codeVerifier.when('code', {
    is: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  refresh_token: validators.token.required().when('grant_type', {
    is: GRANT_REFRESH_TOKEN,
    otherwise: Joi.forbidden(),
  }),

  assertion: validators.assertion.required().when('grant_type', {
    is: GRANT_FXA_ASSERTION,
    otherwise: Joi.forbidden(),
  }),

  ppid_seed: validators.ppidSeed.optional(),

  resource: validators.resourceUrl.optional(),
});

module.exports = ({ log, oauthDB, db, mailer, devices }) => {
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
        throw Error('unreachable');
    }
    requestedGrant.name = client.name;
    requestedGrant.canGrant = client.canGrant;
    requestedGrant.publicClient = client.publicClient;
    requestedGrant.grantType = params.grant_type;
    requestedGrant.ppidSeed = params.ppid_seed;
    requestedGrant.resource = params.resource;
    requestedGrant.ttl = Math.min(params.ttl, MAX_TTL_S);
    return requestedGrant;
  }

  async function validateAuthorizationCodeGrant(client, params) {
    const code = params.code;
    // PKCE should only be used by public clients, and we can check this
    // before even looking up the code in the db.
    let pkceHashValue;
    if (params.code_verifier) {
      if (!client.publicClient) {
        log.debug('client.notPublicClient', { id: client.id });
        throw OauthError.notPublicClient(client.id);
      }
      pkceHashValue = pkceHash(params.code_verifier);
    }
    // Does the code actually exist?
    const codeObj = await oauthDB.getCode(buf(code));
    if (!codeObj) {
      log.debug('code.notFound', { code: code });
      throw OauthError.unknownCode(code);
    }
    // Does it belong to this client?
    if (!crypto.timingSafeEqual(codeObj.clientId, client.id)) {
      log.debug('code.mismatch', {
        client: hex(client.id),
        code: hex(codeObj.code),
      });
      throw OauthError.mismatchCode(code, client.id);
    }
    // Has it expired?
    // The + is because loldatemath; without it, it does string concat.
    const expiresAt =
      +codeObj.createdAt + config.get('oauthServer.expiration.code');
    if (Date.now() > expiresAt) {
      log.debug('code.expired', { code: code });
      throw OauthError.expiredCode(code, expiresAt);
    }
    // If it used PKCE...
    if (codeObj.codeChallenge) {
      // Was it using the one variant that we support?
      // We should never have written such data, but double-checking in case we add
      // other methods in future but forget to update the code here.
      if (codeObj.codeChallengeMethod !== 'S256') {
        throw OauthError.mismatchCodeChallenge(pkceHashValue);
      }
      // Did they provide a challenge verifier at all?
      if (!pkceHashValue) {
        throw OauthError.missingPkceParameters();
      }
      // Did they provide the *correct* challenge verifier?
      if (
        !crypto.timingSafeEqual(
          Buffer.from(codeObj.codeChallenge),
          Buffer.from(pkceHashValue)
        )
      ) {
        throw OauthError.mismatchCodeChallenge(pkceHashValue);
      }
    }
    // Is a very confused client is attempting to use PCKE to claim a code
    // that wasn't actually created using PKCE?
    if (params.code_verifier && !codeObj.codeChallenge) {
      throw OauthError.mismatchCodeChallenge(pkceHashValue);
    }
    // Looks legit! Codes are one-time-use, so remove it from the db.
    await oauthDB.removeCode(buf(code));
    return codeObj;
  }

  async function validateRefreshTokenGrant(client, params) {
    // Does the refresh token actually exist?
    const tokObj = await oauthDB.getRefreshToken(
      encrypt.hash(params.refresh_token)
    );
    if (!tokObj) {
      log.debug('refresh_token.notFound', {
        refresh_token: params.refresh_token,
      });
      throw OauthError.invalidToken();
    }
    // Does it belong to this client?
    if (!crypto.timingSafeEqual(tokObj.clientId, client.id)) {
      log.debug('refresh_token.mismatch', {
        client: hex(client.id),
        code: tokObj.clientId,
      });
      throw OauthError.invalidToken();
    }
    // Scope should default to those previously requested,
    // but can be further limited on request.
    if (params.scope) {
      // You can't request *extra* scopes using this grant though!
      if (!tokObj.scope.contains(params.scope)) {
        log.debug('refresh_token.invalidScopes', {
          allowed: tokObj.scope,
          requested: params.scope,
        });
        throw OauthError.invalidScopes(
          params.scope.difference(tokObj.scope).getScopeValues()
        );
      }
      tokObj.scope = params.scope;
    }
    // Some scopes represent a one-off exchange of claims or credentials and
    // don't make sense to use with a refresh token. Exclude them.
    tokObj.scope = tokObj.scope.difference(
      SCOPES_TO_EXCLUDE_FROM_REFRESH_TOKEN_GRANTS
    );
    // An additional sanity-check that we don't accidentally grant refresh tokens
    // from other refresh tokens.  There should be no way to trigger this in practice.
    if (tokObj.offline) {
      throw OauthError.invalidRequestParameter();
    }
    return tokObj;
  }

  async function validateAssertionGrant(client, params) {
    // Is the client allowed to do direct grants?
    if (!client.canGrant) {
      log.warn('grantType.notAllowed', {
        id: hex(client.id),
        grant_type: 'fxa-credentials',
      });
      throw OauthError.invalidGrantType();
    }
    // There's no reason a non-public client should ever be allowed
    // to do direct grants, check that as well for extra safety.
    if (!client.publicClient) {
      throw OauthError.notPublicClient(client.id);
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
    return util.base64URLEncode(
      crypto.createHash('sha256').update(input).digest()
    );
  }

  async function tokenHandler(req) {
    var params = req.payload;
    const client = await authenticateClient(req.headers, params);

    // Refuse to generate new access tokens for disabled clients that are already
    // connected to the account.  We allow disabled clients to claim existing authorization
    // codes, because otherwise we risk erroring out halfway through an app login flow
    // and presenting a very confusing user experience.  The /authorization endpoint refuses
    // to create new codes for disabled clients.
    if (
      DISABLED_CLIENTS.has(hex(client.id)) &&
      params.grant_type !== GRANT_AUTHORIZATION_CODE
    ) {
      throw OauthError.disabledClient(hex(client.id));
    }
    const grant = await validateGrantParameters(client, params);
    const tokens = await generateTokens(grant);
    req.emitMetricsEvent('token.created', {
      service: hex(grant.clientId),
      uid: hex(grant.userId),
    });
    return tokens;
  }

  return [
    {
      method: 'POST',
      path: '/token',
      config: {
        ...MISC_DOCS.TOKEN_POST,
        cors: { origin: 'ignore' },
        validate: {
          headers: clientAuthValidators.headers,
          // stripUnknown is used to allow various oauth2 libraries to be used
          // with FxA OAuth. Sometimes, they will send other parameters that
          // we don't use, such as `response_type`, or something else. Instead
          // of giving an error here, we can just ignore them.
          payload: PAYLOAD_SCHEMA.options({ stripUnknown: true }).label(
            'Token_payload'
          ),
        },
        response: {
          schema: Joi.object()
            .keys({
              access_token: validators.accessToken.required(),
              refresh_token: validators.token,
              id_token: validators.assertion,
              session_token_id: validators.sessionTokenId.optional(),
              scope: validators.scope.required(),
              token_type: Joi.string().valid('bearer').required(),
              expires_in: Joi.number().max(MAX_TTL_S).required(),
              auth_at: Joi.number(),
              keys_jwe: validators.jwe.optional(),
            })
            .label('Token_response'),
        },
        handler: tokenHandler,
      },
    },
    {
      method: 'POST',
      path: '/oauth/token',
      config: {
        ...OAUTH_DOCS.OAUTH_TOKEN_POST,
        auth: {
          // XXX TODO: To be able to fully replace the /token route from oauth-server,
          // this route must also be able to accept 'client_secret' as Basic Auth in header.
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          // Note: the use of 'alternatives' here means that `grant_type` will default to
          // `authorization_code` if a `code` parameter is provided, or `fxa-credentials`
          // otherwise. This is intended behaviour.
          payload: Joi.alternatives().try(
            // authorization code
            Joi.object({
              grant_type: Joi.string()
                .valid('authorization_code')
                .default('authorization_code')
                .description(DESCRIPTION.grantType),
              client_id: validators.clientId.description(DESCRIPTION.clientId),
              client_secret: validators.clientSecret
                .optional()
                .description(DESCRIPTION.clientSecret),
              code: validators.authorizationCode.required(),
              code_verifier: validators.pkceCodeVerifier.optional(),
              redirect_uri: validators.url().optional(),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number()
                .positive()
                .optional()
                .description(DESCRIPTION.ttlValidate),
              ppid_seed: validators.ppidSeed
                .optional()
                .description(DESCRIPTION.ppidSeed),
              resource: validators.resourceUrl
                .optional()
                .description(DESCRIPTION.resource),
            })
              .xor('client_secret', 'code_verifier')
              .label('Oauth.token_authorizationCode'),
            // refresh token
            Joi.object({
              grant_type: Joi.string().valid('refresh_token').required(),
              client_id: validators.clientId,
              client_secret: validators.clientSecret.optional(),
              refresh_token: validators.refreshToken.required(),
              scope: validators.scope.optional(),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number().positive().optional(),
              ppid_seed: validators.ppidSeed.optional(),
              resource: validators.resourceUrl.optional(),
            }).label('Oauth.token_refreshToken'),
            // credentials
            Joi.object({
              grant_type: Joi.string()
                .valid('fxa-credentials')
                .default('fxa-credentials'),
              client_id: validators.clientId,
              scope: validators.scope.optional(),
              access_type: Joi.string()
                .valid('online', 'offline')
                .default('online'),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number().positive().optional(),
              resource: validators.resourceUrl.optional(),
              assertion: Joi.forbidden(),
            }).label('Oauth.token_fxaCredentials')
          ),
        },
        response: {
          schema: Joi.alternatives().try(
            // authorization code
            Joi.object({
              access_token: validators.accessToken
                .required()
                .description(DESCRIPTION.accessToken),
              refresh_token: validators.refreshToken
                .optional()
                .description(DESCRIPTION.refreshToken),
              id_token: validators.assertion
                .optional()
                .description(DESCRIPTION.idToken),
              session_token: validators.sessionToken.optional(),
              scope: validators.scope.required().description(DESCRIPTION.scope),
              token_type: Joi.string()
                .valid('bearer')
                .required()
                .description(DESCRIPTION.tokenType),
              expires_in: Joi.number()
                .required()
                .description(DESCRIPTION.expiresIn),
              auth_at: Joi.number().required().description(DESCRIPTION.authAt),
              keys_jwe: validators.jwe.optional(),
            }).label('Oauth.token_response'),
            // refresh token
            Joi.object({
              access_token: validators.accessToken.required(),
              id_token: validators.assertion.optional(),
              scope: validators.scope.required(),
              token_type: Joi.string().valid('bearer').required(),
              expires_in: Joi.number().required(),
            }),
            // credentials
            Joi.object({
              access_token: validators.accessToken.required(),
              refresh_token: validators.refreshToken.optional(),
              id_token: validators.assertion.optional(),
              scope: validators.scope.required(),
              auth_at: Joi.number().required(),
              token_type: Joi.string().valid('bearer').required(),
              expires_in: Joi.number().required(),
            })
          ),
        },
      },
      handler: async function (req) {
        const sessionToken = req.auth.credentials;
        delete req.headers.authorization;
        let grant;
        switch (req.payload.grant_type) {
          case 'authorization_code':
          case 'refresh_token':
            try {
              grant = await tokenHandler(req);
            } catch (err) {
              // TODO auth/oauth error reconciliation
              if (err.errno === 108) {
                throw AuthError.invalidToken();
              }
              throw err;
            }
            break;
          case 'fxa-credentials':
            if (!sessionToken) {
              throw AuthError.invalidToken();
            }
            req.payload.assertion = await makeAssertionJWT(
              config.getProperties(),
              sessionToken
            );
            grant = await tokenHandler(req);
            break;
          default:
            throw AuthError.internalValidationError();
        }

        const scopeSet = ScopeSet.fromString(grant.scope);

        if (scopeSet.contains(OAUTH_SCOPE_SESSION_TOKEN)) {
          // the OAUTH_SCOPE_SESSION_TOKEN allows the client to create a new session token.
          // the sessionTokens live in the auth-server db, we create them here after the oauth-server has validated the request.
          let origSessionToken;
          try {
            origSessionToken = await db.sessionToken(grant.session_token_id);
          } catch (e) {
            throw AuthError.unknownAuthorizationCode();
          }

          const newTokenData = await origSessionToken.copyTokenState();

          // Update UA info based on the requesting device.
          const { ua } = req.app;
          const newUAInfo = {
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uaFormFactor: ua.formFactor,
          };

          const sessionTokenOptions = {
            ...newTokenData,
            ...newUAInfo,
          };

          const newSessionToken = await db.createSessionToken(
            sessionTokenOptions
          );
          // the new session token information is later
          // used in 'newTokenNotification' to attach it to device records
          grant.session_token_id = newSessionToken.id;
          grant.session_token = newSessionToken.data;
        }

        if (grant.refresh_token) {
          // if a refresh token has
          // been provisioned as part of the flow
          // then we want to send some notifications to the user
          await oauthRouteUtils.newTokenNotification(
            db,
            mailer,
            devices,
            req,
            grant
          );
        }

        // done with 'session_token_id' at this point, do not return it.
        delete grant.session_token_id;

        // attempt to record metrics, but swallow the error if one is thrown.
        try {
          let uid = sessionToken && sessionToken.uid;

          // As mentioned in lib/routes/utils/oauth.js, some grant flows won't
          // have the uid in `credentials`, so we get it from the oauth DB.
          if (!uid) {
            const tokenVerify = await token.verify(grant.access_token);
            uid = tokenVerify.user;
          }

          await req.emitMetricsEvent('oauth.token.created', {
            grantType: req.payload.grant_type,
            uid,
            clientId: req.payload.client_id,
            service: req.payload.client_id,
          });

          // This is a bit of a hack, but we emit the `account.signed`
          // event to signal to the flow it has been completed (see flowCompleteSignal).
          // Previously, this event would get emitted on the `/certificate/sign`
          // endpoint however, with the move to sync oauth, this does not happen anymore
          // and we need to "fake" it.
          //
          // A "fxa_activity - cert_signed" event will be emitted since
          // "account.signed" is mapped to it.  And cert_signed is used in a
          // rollup to generate the "fxa_activity - active" event in Amplitude
          // (ref: https://bugzilla.mozilla.org/show_bug.cgi?id=1632635), where
          // we need the 'service' event property to distinguish between sync
          // and browser.
          if (
            scopeSet.contains(OAUTH_SCOPE_OLD_SYNC) &&
            // Desktop requests a profile scope token before adding the device
            // to the account. To ensure we record accurate device counts, only
            // emit this event if the request is for an oldsync scope, not a
            // profile scope. See #6578 for details on the order of API calls
            // made by both desktop and fenix.
            !scopeSet.contains('profile')
          ) {
            // For desktop, the 'service' parameter for this event gets
            // special-cased to 'sync' so that it matches its pre-oauth
            // `/certificate/sign` event.
            // ref: https://github.com/mozilla/fxa/pull/6581#issuecomment-702248031
            // Otherwise, for mobile browsers, just use the existing client ID
            // to service name mapping used in the metrics code (see the
            // OAUTH_CLIENT_IDS config value). #5143
            const service = config
              .get('oauth.oldSyncClientIds')
              .includes(req.payload.client_id)
              ? 'sync'
              : req.payload.client_id;
            await req.emitMetricsEvent('account.signed', {
              uid: uid,
              device_id: sessionToken.deviceId,
              service,
            });
          }
        } catch (ex) {}

        return grant;
      },
    },
  ];
};
