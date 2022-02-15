/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AttachedDevice } from './models/AttachedDevice';
import { AttachedSession } from './models/AttachedSession';
import { Device } from './models/Device';
import { DeviceSessionToken } from './models/DeviceSessionToken';
import { SerializableAttachedClient } from './models/SerializableAttachedClient';
import { Token } from './models/Token';
import { SessionToken } from './models/SessionToken';

export const hex = require('buf').to.hex;

// Helper function to render each returned record in the expected form.
export function serialize(
  clientIdHex: string,
  token: Token
): SerializableAttachedClient {
  const createdTime = token.createdAt.getTime();
  const lastAccessTime = token.lastUsedAt.getTime();
  return {
    client_id: clientIdHex,
    refresh_token_id: token.tokenId ? hex(token.tokenId) : undefined,
    client_name: token.clientName,
    created_time: createdTime,
    last_access_time: lastAccessTime,
    // Sort the scopes alphabetically, for consistent output.
    scope: token.scope.getScopeValues().sort(),
  };
}

export function synthesizeClientName(device: AttachedSession): string {
  const uaBrowser = device.uaBrowser;
  const uaBrowserVersion = device.uaBrowserVersion;
  const uaOS = device.uaOS;
  const uaOSVersion = device.uaOSVersion;
  const uaFormFactor = device.uaFormFactor;
  let result = '';

  if (uaBrowser) {
    if (uaBrowserVersion) {
      const splitIndex = uaBrowserVersion.indexOf('.');
      result = `${uaBrowser} ${
        splitIndex === -1
          ? uaBrowserVersion
          : uaBrowserVersion.substr(0, splitIndex)
      }`;
    } else {
      result = uaBrowser;
    }

    if (uaOS || uaFormFactor) {
      result += ', ';
    }
  }

  if (uaFormFactor) {
    return `${result}${uaFormFactor}`;
  }

  if (uaOS) {
    result += uaOS;

    if (uaOSVersion) {
      result += ` ${uaOSVersion}`;
    }
  }

  return result;
}

export function mergeDevicesAndSessionTokens(
  devices: Device[],
  sessionTokens: Record<string, DeviceSessionToken>,
  lastAccessTimeEnabled: boolean
): AttachedDevice[] {
  return devices.map((device) => {
    const token = sessionTokens[device.sessionTokenId];
    return mergeDeviceAndSessionToken(device, token, lastAccessTimeEnabled);
  });
}

export function mergeDeviceAndSessionToken(
  device: Device,
  token: DeviceSessionToken,
  lastAccessTimeEnabled: boolean
): AttachedDevice {
  // If there's a matching sessionToken in redis, use the more up-to-date
  // location and access-time info from there rather than from the DB.
  const mergedInfo = Object.assign({}, device, token);
  const merged: AttachedDevice = {
    id: mergedInfo.id,
    sessionTokenId: mergedInfo.sessionTokenId,
    refreshTokenId: mergedInfo.refreshTokenId,
    lastAccessTime: lastAccessTimeEnabled
      ? mergedInfo.lastAccessTime
      : undefined,
    location: mergedInfo.location,
    name: mergedInfo.name,
    type: mergedInfo.type,
    createdAt: mergedInfo.createdAt,
    pushCallback: mergedInfo.callbackURL,
    pushPublicKey: mergedInfo.callbackPublicKey,
    pushAuthKey: mergedInfo.callbackAuthKey,
    pushEndpointExpired: !!mergedInfo.callbackIsExpired,
    availableCommands: mergedInfo.availableCommands || {},
    uaBrowser: mergedInfo.uaBrowser,
    uaBrowserVersion: mergedInfo.uaBrowserVersion,
    uaOS: mergedInfo.uaOS,
    uaOSVersion: mergedInfo.uaOSVersion,
    uaDeviceType: mergedInfo.uaDeviceType,
    uaFormFactor: mergedInfo.uaFormFactor,
  };

  return merged;
}

export function filterExpiredTokens(
  sessionTokens: SessionToken[],
  MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE: number
) {
  const expiredSessionTokens: SessionToken[] = [];

  if (!MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE) {
    return {
      sessionTokens,
      expiredSessionTokens,
    };
  }

  // Filter out any expired sessions
  sessionTokens = sessionTokens.filter((sessionToken) => {
    if (sessionToken.deviceId) {
      return true;
    }

    if (
      sessionToken.createdAt >
      Date.now() - MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE
    ) {
      return true;
    }

    expiredSessionTokens.push(
      Object.assign({}, sessionToken, { id: sessionToken.tokenId })
    );
    return false;
  });

  return {
    sessionTokens,
    expiredSessionTokens,
  };
}

export function mergeCachedSessionTokens(
  mySqlSessionTokens: SessionToken[],
  redisSessionTokens: Record<string, SessionToken>,
  lastAccessTimeEnabled: boolean
): SessionToken[] {
  return mySqlSessionTokens.map((sessionToken: SessionToken) => {
    const id = sessionToken.tokenId;
    const redisToken = redisSessionTokens[id || ''];
    const mergedToken: SessionToken = Object.assign(
      {},
      sessionToken,
      redisToken,
      { id }
    );

    if (mergedToken.tokenId) {
      delete mergedToken.tokenId;
    }

    if (!lastAccessTimeEnabled) {
      mergedToken.lastAccessTime = null;
    }

    return mergedToken;
  });
}
