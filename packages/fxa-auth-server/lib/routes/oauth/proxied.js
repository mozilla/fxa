/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* Routes for managing OAuth authorization grants.
 *
 * These routes are a more-or-less direct proxy through to
 * routes on the underlying "fxa-oauth-server", treating it
 * as a kind of back-end microservice.  We want to eventually
 * merge that codebase directly into the main auth-server
 * here, at which point these routes will become the direct
 * implementation of their respesctive features.
 *
 */

const Joi = require('@hapi/joi');
const validators = require('../../routes/validators');

const error = require('../../error');
const token = require('../../oauth/token');
const oauthRouteUtils = require('../utils/oauth');
const {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_SESSION_TOKEN,
} = require('../../constants');
const ScopeSet = require('fxa-shared').oauth.scopes;

/**
 * @deprecated to be replaced with direct implementations
 */
module.exports = (log, config, oauthService, db, mailer, devices) => {
  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    config.oauth.disableNewConnectionsForClients || []
  );

  function checkDisabledClientId(payload) {
    const clientId = payload.client_id;
    if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw error.disabledClientId(clientId);
    }
  }

  const routes = [
    {
      method: 'POST',
      path: '/account/scoped-key-data',
      config: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            client_id: validators.clientId.required(),
            scope: validators.scope.required(),
            assertion: Joi.forbidden(),
          },
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
      handler: async function (request) {
        checkDisabledClientId(request.payload);
        const sessionToken = request.auth.credentials;
        return oauthService.getScopedKeyData(sessionToken, request.payload);
      },
    },
    {
      method: 'POST',
      path: '/oauth/token',
      config: {
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
                .default('authorization_code'),
              client_id: validators.clientId.required(),
              client_secret: validators.clientSecret.optional(),
              code: validators.authorizationCode.required(),
              code_verifier: validators.pkceCodeVerifier.optional(),
              redirect_uri: validators.url().optional(),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number().positive().optional(),
              ppid_seed: validators.ppidSeed.optional(),
              resource: validators.resourceUrl.optional(),
            }).xor('client_secret', 'code_verifier'),
            // refresh token
            Joi.object({
              grant_type: Joi.string().valid('refresh_token').required(),
              client_id: validators.clientId.required(),
              client_secret: validators.clientSecret.optional(),
              refresh_token: validators.refreshToken.required(),
              scope: validators.scope.optional(),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number().positive().optional(),
              ppid_seed: validators.ppidSeed.optional(),
              resource: validators.resourceUrl.optional(),
            }),
            // credentials
            Joi.object({
              grant_type: Joi.string()
                .valid('fxa-credentials')
                .default('fxa-credentials'),
              client_id: validators.clientId.required(),
              scope: validators.scope.optional(),
              access_type: Joi.string()
                .valid('online', 'offline')
                .default('online'),
              // Note: the max allowed TTL is currently configured in oauth-server config,
              // making it hard to know what limit to set here.
              ttl: Joi.number().positive().optional(),
              resource: validators.resourceUrl.optional(),
              assertion: Joi.forbidden(),
            })
          ),
        },
        response: {
          schema: Joi.alternatives().try(
            // authorization code
            Joi.object({
              access_token: validators.accessToken.required(),
              refresh_token: validators.refreshToken.optional(),
              id_token: validators.assertion.optional(),
              session_token: validators.sessionToken.optional(),
              scope: validators.scope.required(),
              token_type: Joi.string().valid('bearer').required(),
              expires_in: Joi.number().required(),
              auth_at: Joi.number().required(),
              keys_jwe: validators.jwe.optional(),
            }),
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
      handler: async function (request) {
        const sessionToken = request.auth.credentials;
        let grant;
        switch (request.payload.grant_type) {
          case 'authorization_code':
            grant = await oauthService.grantTokensFromAuthorizationCode(
              request.payload
            );
            break;
          case 'refresh_token':
            grant = await oauthService.grantTokensFromRefreshToken(
              request.payload
            );
            break;
          case 'fxa-credentials':
            if (!sessionToken) {
              throw error.invalidToken();
            }
            grant = await oauthService.grantTokensFromSessionToken(
              sessionToken,
              request.payload
            );
            break;
          default:
            throw error.internalValidationError();
        }

        const scopeSet = ScopeSet.fromString(grant.scope);

        if (scopeSet.contains(OAUTH_SCOPE_SESSION_TOKEN)) {
          // the OAUTH_SCOPE_SESSION_TOKEN allows the client to create a new session token.
          // the sessionTokens live in the auth-server db, we create them here after the oauth-server has validated the request.
          let origSessionToken;
          try {
            origSessionToken = await db.sessionToken(grant.session_token_id);
          } catch (e) {
            throw error.unknownAuthorizationCode();
          }

          const newTokenData = await origSessionToken.copyTokenState();

          // Update UA info based on the requesting device.
          const { ua } = request.app;
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
            request,
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

          const account = await db.account(uid);
          const ecosystemAnonId = account.ecosystemAnonId;

          await request.emitMetricsEvent('oauth.token.created', {
            grantType: request.payload.grant_type,
            uid,
            ecosystemAnonId,
            clientId: request.payload.client_id,
            service: request.payload.client_id,
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
            const service = config.oauth.oldSyncClientIds.includes(
              request.payload.client_id
            )
              ? 'sync'
              : request.payload.client_id;
            await request.emitMetricsEvent('account.signed', {
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
  return routes;
};
