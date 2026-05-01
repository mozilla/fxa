/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const isA = require('joi');
const validators = require('./validators');
const authorizedClients = require('../oauth/authorized_clients');
const oauthDB = require('../oauth/db');
const { getAuthorizationScope } = require('../oauth/browser-services');
const { AppError: error } = require('@fxa/accounts/errors');

const HEX_STRING = validators.HEX_STRING;
const DEVICES_SCHEMA = require('../devices').schema;
const DEVICES_AND_SESSIONS_DOC =
  require('../../docs/swagger/devices-and-sessions-api').default;

const { ConnectedServicesFactory } = require('fxa-shared/connected-services');
const DESCRIPTIONS = require('../../docs/swagger/shared/descriptions').default;

// Sign-out cleanup. After destroy, list the user's accountAuthorizations rows
// and delete any whose service no longer has a backing refresh token. Walks
// post-destroy refreshTokens to build the set of services still backed.
//
// Read-then-delete is not atomic; a parallel grant in the same window can
// race the delete. Self-heals via the throttled touch on the next
// refresh-token use.
async function cleanupAccountAuthorizations(uid, log) {
  try {
    const refreshTokenRows = await oauthDB.getRefreshTokensByUid(uid);
    const stillBacked = new Set();
    for (const row of refreshTokenRows) {
      const clientIdHex = row.clientId?.toString('hex');
      for (const value of row.scope.getScopeValues()) {
        const resolved = getAuthorizationScope(clientIdHex, undefined, value);
        if (resolved) stillBacked.add(resolved.name);
      }
    }

    const authzRows = await oauthDB.listAccountAuthorizationsByUid(uid);
    for (const row of authzRows) {
      if (stillBacked.has(row.service)) continue;
      await oauthDB.deleteAccountAuthorization(uid, row.scope, row.service);
    }
  } catch (err) {
    log?.warn?.('accountAuthorizations.cleanupFailed', {
      err: err && err.message,
    });
  }
}

module.exports = (log, db, devices, clientUtils) => {
  return [
    {
      method: 'GET',
      path: '/account/attached_clients',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_CLIENTS_GET,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: isA.object({
            filterIdleDevicesTimestamp: isA
              .number()
              .description(DESCRIPTIONS.filterIdleDevicesTimestamp)
              .optional(),
          }),
        },
        response: {
          schema: isA.array().items(
            isA.object({
              clientId: isA.string().regex(HEX_STRING).allow(null).required(),
              deviceId: DEVICES_SCHEMA.id.allow(null).required(),
              sessionTokenId: isA
                .string()
                .regex(HEX_STRING)
                .allow(null)
                .required(),
              refreshTokenId: isA
                .string()
                .regex(HEX_STRING)
                .allow(null)
                .required(),
              isCurrentSession: isA.boolean().required(),
              deviceType: DEVICES_SCHEMA.type.allow(null).required(),
              name: DEVICES_SCHEMA.nameResponse
                .allow('')
                .allow(null)
                .required(),
              createdTime: isA.number().min(0).required().allow(null),
              createdTimeFormatted: isA.string().optional().allow(''),
              lastAccessTime: isA.number().min(0).required().allow(null),
              lastAccessTimeFormatted: isA.string().optional().allow(''),
              approximateLastAccessTime: isA.number().min(0).optional(),
              approximateLastAccessTimeFormatted: isA
                .string()
                .optional()
                .allow(''),
              scope: isA.array().items(validators.scope).required().allow(null),
              location: DEVICES_SCHEMA.location,
              userAgent: isA.string().max(255).required().allow(''),
              os: isA.string().max(255).allow('').allow(null),
            })
          ),
        },
      },
      handler: async function (request) {
        log.begin('Account.attachedClients', request);

        const sessionToken = request.auth && request.auth.credentials;

        sessionToken.lastAccessTime = Date.now();
        await db.touchSessionToken(sessionToken, {}, true);
        const { uid, id } = sessionToken;
        const factory = new ConnectedServicesFactory({
          formatTimestamps: (...args) => {
            clientUtils.formatTimestamps(...args);
          },
          formatLocation: (...args) => {
            clientUtils.formatLocation(...args);
          },
          deviceList: async () => {
            let devices = await request.app.devices;

            // To help reduce duplicate devices
            // a client can request to filter device last access
            // time by a specified number of days. For reference, Sync currently
            // considers devices that have been accessed in the last 21 days to
            // be active.
            const idleDeviceTimestamp =
              request.query.filterIdleDevicesTimestamp;
            if (idleDeviceTimestamp) {
              devices = devices.filter((device) => {
                return device.lastAccessTime > idleDeviceTimestamp;
              });
            }

            return devices;
          },
          oauthClients: async () => {
            return await authorizedClients.list(request.auth.credentials.uid);
          },
          sessions: async () => {
            return await db.sessions(uid);
          },
        });
        return await factory.build(id, request.app.acceptLanguage);
      },
    },
    {
      method: 'GET',
      path: '/account/attached_oauth_clients',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_OAUTH_CLIENTS_GET,
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA
            .array()
            .items({
              clientId: isA.string().regex(HEX_STRING).required(),
              lastAccessTime: isA.number().min(0).required(),
            })
            .unique('clientId', { ignoreUndefined: true }),
        },
      },
      handler: async function (request) {
        log.begin('Account.attachedOAuthClients', request);

        const sessionToken = request.auth && request.auth.credentials;

        sessionToken.lastAccessTime = Date.now();
        await db.touchSessionToken(sessionToken, {}, true);
        const factory = new ConnectedServicesFactory({
          formatTimestamps: (...args) => {
            clientUtils.formatTimestamps(...args);
          },
          formatLocation: (...args) => {
            clientUtils.formatLocation(...args);
          },
          deviceList: async () => {
            return Promise.resolve([]); // not needed for this endpoint, but required by factory
          },
          oauthClients: async () => {
            return await authorizedClients.listUnique(
              request.auth.credentials.uid
            );
          },
          sessions: async () => {
            return Promise.resolve([]); // not needed for this endpoint, but required by factory
          },
        });

        const clients = await factory.build(
          sessionToken.id,
          request.app.acceptLanguage
        );

        return clients.map((client) => ({
          clientId: client.clientId,
          lastAccessTime: client.lastAccessTime,
        }));
      },
    },
    {
      method: 'POST',
      path: '/account/attached_client/destroy',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_CLIENT_DESTROY_POST,
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        validate: {
          payload: isA
            .object({
              clientId: validators.clientId.allow(null).optional(),
              sessionTokenId: isA
                .string()
                .regex(HEX_STRING)
                .allow(null)
                .optional(),
              refreshTokenId: validators.refreshToken.allow(null).optional(),
              deviceId: DEVICES_SCHEMA.id.allow(null).optional(),
            })
            .or('clientId', 'sessionTokenId', 'refreshTokenId', 'deviceId')
            .with('refreshTokenId', ['clientId']),
        },
        response: {
          schema: isA.object({}),
        },
      },
      handler: async function (request) {
        log.begin('Account.attachedClientDestroy', request);

        const credentials = request.auth.credentials;
        const payload = request.payload;

        // sessionTokenId-only destroys never affect refresh tokens, so skip
        // the cleanup roundtrips for those.
        const willTouchOAuth = !!(
          payload.deviceId ||
          payload.refreshTokenId ||
          (payload.clientId && !payload.sessionTokenId)
        );

        if (payload.deviceId) {
          // If we got a `deviceId`, then deleting that should also delete `sessionTokenId` and `refreshTokenId`,
          // assuming that they match the ones that were actually on the device record.
          const destroyedDevice = await devices.destroy(
            request,
            payload.deviceId
          );
          if (
            payload.sessionTokenId &&
            destroyedDevice.sessionTokenId !== payload.sessionTokenId
          ) {
            throw error.invalidRequestParameter(
              'sessionTokenId did not match device record'
            );
          }
          if (
            payload.refreshTokenId &&
            destroyedDevice.refreshTokenId !== payload.refreshTokenId
          ) {
            throw error.invalidRequestParameter(
              'refreshTokenId did not match device record'
            );
          }
        } else if (payload.refreshTokenId) {
          // We've got device-less refreshToken. There should be no sessionToken.
          if (payload.sessionTokenId) {
            throw error.invalidRequestParameter(
              'sessionTokenId cannot be present for non-device OAuth client'
            );
          }
          // If we find the refresh_token_id doesn't exist, swallow the error.
          // It was probably some sort of race in deleting the token, and the account
          // is in the desired state.
          try {
            await authorizedClients.destroy(
              payload.clientId,
              credentials.uid,
              payload.refreshTokenId
            );
          } catch (err) {
            if (err.errno !== error.ERRNO.REFRESH_TOKEN_UNKNOWN) {
              throw err;
            }
          }
        } else if (payload.clientId) {
          // We've got an OAuth client that isn't using refresh tokens. There should be no sessionToken.
          if (payload.sessionTokenId) {
            throw error.invalidRequestParameter(
              'sessionTokenId cannot be present for non-device OAuth client'
            );
          }
          await authorizedClients.destroy(payload.clientId, credentials.uid);
        } else if (payload.sessionTokenId) {
          // We've got a plain web session on our hands.
          // Need to check that it actually belongs to this user, unless it's the current session.
          if (payload.sessionTokenId === credentials.id) {
            await db.deleteSessionToken(credentials);
          } else {
            const sessionToken = await db.sessionToken(payload.sessionTokenId);
            if (!sessionToken || sessionToken.uid !== credentials.uid) {
              throw error.invalidRequestParameter('sessionTokenId');
            }
            await db.deleteSessionToken(sessionToken);
          }
        }

        if (willTouchOAuth) {
          await cleanupAccountAuthorizations(credentials.uid, log);
        }

        return {};
      },
    },
  ];
};
