/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import AppError from '../../error';
import joi from 'joi';
import hexModule from "buf";
import * as validators from '../validators';
import { OAUTH_SCOPE_OLD_SYNC } from 'fxa-shared/oauth/constants';
import encrypt from 'fxa-shared/auth/encrypt';
import oauthDB from '../../oauth/db';
import client from '../../oauth/client';
import { scopeSetHelpers as ScopeSet } from 'fxa-shared/oauth/scopes';

const hex = hexModule.to.hex;
const { BEARER_AUTH_REGEX } = validators;

// the refresh token scheme is currently used by things connected to sync,
// and we're at a transitionary stage of its evolution into something more generic,
// so we limit to the scope below as a safety mechanism
const ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES = ScopeSet.fromArray([
  OAUTH_SCOPE_OLD_SYNC,
]);

export default function schemeRefreshTokenScheme(config, db) {
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
        const bearerToken = bearerMatch && bearerMatch[1];
        if (bearerToken) {
          joi.attempt(bearerMatch[1], validators.refreshToken, bearerMatchErr);
        } else {
          throw bearerMatchErr;
        }

        const tokenId = encrypt.hash(bearerToken);
        const refreshToken = await oauthDB.getRefreshToken(tokenId);
        if (!refreshToken) {
          return h.unauthenticated(new AppError.invalidToken());
        }
        if (
          !refreshToken.scope.intersects(ALLOWED_REFRESH_TOKEN_SCHEME_SCOPES)
        ) {
          // unauthenticated if refreshToken is missing the required scope
          return h.unauthenticated(AppError.invalidScopes(refreshToken.scope));
        }

        const { ua = {} } = request.app;

        const credentials = {
          uid: hex(refreshToken.userId),
          emailVerified: true,
          tokenVerified: true,
          refreshTokenId: hex(tokenId),
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uaFormFactor: ua.formFactor,
        };

        credentials.client = await client.getClientById(refreshToken.clientId);
        if (!credentials.client || !credentials.client.publicClient) {
          return h.unauthenticated(new AppError.notPublicClient());
        }
        const devices = await db.devices(credentials.uid);

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
}
