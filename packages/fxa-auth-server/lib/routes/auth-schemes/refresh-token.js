/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AppError = require('../../error');
const joi = require('@hapi/joi');
const validators = require('../validators');
const { BEARER_AUTH_REGEX } = validators;
const { OAUTH_SCOPE_OLD_SYNC } = require('../../constants');
const ScopeSet = require('fxa-shared').oauth.scopes;

// the refresh token scheme is currently used by things connected to sync,
// and we're at a transitionary stage of its evolution into something more generic,
// so we limit to the scope below as a safety mechanism
const ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES = ScopeSet.fromArray([
  OAUTH_SCOPE_OLD_SYNC,
]);

module.exports = function schemeRefreshTokenScheme(config, db, oauthdb) {
  return function schemeRefreshToken(server, options) {
    return {
      async authenticate(request, h) {
        if (config.oauth.deviceAccessEnabled === false) {
          throw new AppError.featureNotEnabled();
        }

        const bearerMatch = BEARER_AUTH_REGEX.exec(
          request.headers.authorization
        );
        const bearerMatchErr = new AppError.invalidRequestParameter(
          'authorization'
        );
        const refreshToken = bearerMatch && bearerMatch[1];
        if (refreshToken) {
          joi.attempt(bearerMatch[1], validators.refreshToken, bearerMatchErr);
        } else {
          throw bearerMatchErr;
        }

        const refreshTokenInfo = await oauthdb.checkRefreshToken(refreshToken);
        if (!refreshTokenInfo || !refreshTokenInfo.active) {
          return h.unauthenticated(new AppError.invalidToken());
        }

        const credentials = {
          uid: refreshTokenInfo.sub,
          emailVerified: true,
          tokenVerified: true,
          refreshTokenId: refreshTokenInfo.jti,
        };

        const scopeSet = ScopeSet.fromString(refreshTokenInfo.scope);

        if (!scopeSet.intersects(ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES)) {
          // unauthenticated if refreshToken is missing the required scope
          return h.unauthenticated(
            AppError.invalidScopes(refreshTokenInfo.scope)
          );
        }

        credentials.client = await oauthdb.getClientInfo(
          refreshTokenInfo.client_id
        );
        const devices = await db.devices(refreshTokenInfo.sub);

        // use the hashed refreshToken id to find devices
        const device = devices.filter(
          (device) => device.refreshTokenId === credentials.refreshTokenId
        )[0];
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
