/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError } = require('@fxa/accounts/errors');
const joi = require('joi');
const validators = require('../validators');
const { BEARER_AUTH_REGEX } = validators;
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const encrypt = require('fxa-shared/auth/encrypt');
const oauthDB = require('../../oauth/db');
const client = require('../../oauth/client');
const ScopeSet = require('fxa-shared/oauth/scopes').scopeSetHelpers;

// the refresh token scheme is currently used by things connected to sync,
// and we're at a transitionary stage of its evolution into something more generic,
// so we limit to the scope below as a safety mechanism
const ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES = ScopeSet.fromArray([
  OAUTH_SCOPE_OLD_SYNC,
]);

module.exports = function schemeRefreshTokenScheme(config, db) {
  return function schemeRefreshToken(server, options) {
    return {
      async authenticate(request, h) {
        if (config.oauth.deviceAccessEnabled === false) {
          throw AppError.featureNotEnabled();
        }

        const bearerMatch = BEARER_AUTH_REGEX.exec(
          request.headers.authorization
        );
        const bearerMatchErr =
          AppError.invalidRequestParameter('authorization');
        const bearerToken = bearerMatch && bearerMatch[1];
        if (bearerToken) {
          joi.attempt(bearerMatch[1], validators.refreshToken, bearerMatchErr);
        } else {
          throw bearerMatchErr;
        }

        const tokenId = encrypt.hash(bearerToken);
        const refreshToken = await oauthDB.getRefreshToken(tokenId);
        if (!refreshToken) {
          return h.unauthenticated(AppError.invalidToken());
        }
        if (
          !refreshToken.scope.intersects(ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES)
        ) {
          // unauthenticated if refreshToken is missing the required scope
          return h.unauthenticated(AppError.invalidScopes(refreshToken.scope));
        }

        const { ua = {} } = request.app;

        const credentials = {
          uid: refreshToken.userId.toString('hex'),
          emailVerified: true,
          tokenVerified: true,
          refreshTokenId: tokenId.toString('hex'),
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uaFormFactor: ua.formFactor,
        };

        credentials.client = await client.getClientById(refreshToken.clientId);
        if (!credentials.client || !credentials.client.publicClient) {
          return h.unauthenticated(AppError.notPublicClient());
        }
        const device = await db.deviceFromRefreshTokenId(
          credentials.uid,
          credentials.refreshTokenId
        );

        if (device) {
          credentials.deviceId = device.id;
          credentials.deviceName = device.name;
          credentials.deviceType = device.type;
          credentials.deviceCreatedAt = device.createdAt;
          credentials.deviceCallbackURL = device.callbackURL;
          credentials.deviceCallbackPublicKey = device.callbackPublicKey;
          credentials.deviceCallbackAuthKey = device.callbackAuthKey;
          credentials.deviceCallbackIsExpired = device.callbackIsExpired;
          credentials.deviceAvailableCommands = device.availableCommands;
        }

        return h.authenticated({
          credentials: credentials,
        });
      },
    };
  };
};
