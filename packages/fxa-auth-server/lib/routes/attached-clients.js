/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const isA = require('joi');
const validators = require('./validators');
const authorizedClients = require('../oauth/authorized_clients');
const { AppError: error } = require('@fxa/accounts/errors');

const HEX_STRING = validators.HEX_STRING;
const DEVICES_SCHEMA = require('../devices').schema;
const DEVICES_AND_SESSIONS_DOC =
  require('../../docs/swagger/devices-and-sessions-api').default;

const { ConnectedServicesFactory } = require('fxa-shared/connected-services');
const DESCRIPTIONS = require('../../docs/swagger/shared/descriptions').default;
const {
  computeSessionTokenHandle,
} = require('./utils/session-token-handle');

module.exports = (log, db, devices, clientUtils, config) => {
  const sessionTokenHandleKey = config.sessionTokenHandle.key;
  return [
    {
      method: 'GET',
      path: '/account/attached_clients',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_CLIENTS_GET,
        auth: {
          strategies: ['sessionTokenBearer', 'sessionToken'],
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
              sessionTokenHandle: isA
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
          // The factory opaques the raw sessionTokenId (a bearer credential)
          // into a uid-bound handle before it leaves the builder. The destroy
          // endpoint can resolve this handle back to the real session.
          serializeSessionTokenId: (sessionTokenId) =>
            computeSessionTokenHandle(sessionTokenHandleKey, uid, sessionTokenId),
        });
        const clients = await factory.build(id, request.app.acceptLanguage);

        // The builder already opaqued the raw id into a handle, but still
        // exposes it under the factory's `sessionTokenId` field; rename it to
        // `sessionTokenHandle` here so the raw id name never appears on the wire.
        return clients.map(
          ({ sessionTokenId: sessionTokenHandle, ...client }) => ({
            ...client,
            sessionTokenHandle,
          })
        );
      },
    },
    {
      method: 'GET',
      path: '/account/attached_oauth_clients',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_OAUTH_CLIENTS_GET,
        auth: {
          strategies: ['sessionTokenBearer', 'sessionToken'],
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
          // No sessions are listed here, but the binding is required; opaque
          // the id the same way in case that ever changes.
          serializeSessionTokenId: (sessionTokenId) =>
            computeSessionTokenHandle(
              sessionTokenHandleKey,
              request.auth.credentials.uid,
              sessionTokenId
            ),
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
          strategies: ['verifiedSessionTokenBearer', 'verifiedSessionToken'],
          payload: false,
        },
        validate: {
          payload: isA
            .object({
              clientId: validators.clientId.allow(null).optional(),
              sessionTokenHandle: isA
                .string()
                .regex(HEX_STRING)
                .allow(null)
                .optional(),
              refreshTokenId: validators.refreshToken.allow(null).optional(),
              deviceId: DEVICES_SCHEMA.id.allow(null).optional(),
            })
            .or('clientId', 'sessionTokenHandle', 'refreshTokenId', 'deviceId')
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

        if (payload.deviceId) {
          // If we got a `deviceId`, then deleting that should also delete `sessionTokenId` and `refreshTokenId`,
          // assuming that they match the ones that were actually on the device record.
          const destroyedDevice = await devices.destroy(
            request,
            payload.deviceId
          );
          if (payload.sessionTokenHandle) {
            const deviceHandle = destroyedDevice.sessionTokenId
              ? computeSessionTokenHandle(
                  sessionTokenHandleKey,
                  credentials.uid,
                  destroyedDevice.sessionTokenId
                )
              : null;
            if (deviceHandle !== payload.sessionTokenHandle) {
              throw error.invalidRequestParameter(
                'sessionTokenHandle did not match device record'
              );
            }
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
          if (payload.sessionTokenHandle) {
            throw error.invalidRequestParameter(
              'sessionTokenHandle cannot be present for non-device OAuth client'
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
          if (payload.sessionTokenHandle) {
            throw error.invalidRequestParameter(
              'sessionTokenHandle cannot be present for non-device OAuth client'
            );
          }
          await authorizedClients.destroy(payload.clientId, credentials.uid);
        } else if (payload.sessionTokenHandle) {
          // We've got a plain web session on our hands. Resolve the opaque
          // handle back to the real sessionTokenId by scanning the caller's own
          // sessions (a bounded set) and matching on the recomputed handle. A
          // handle that matches none of them is unknown/stale.
          const sessions = await db.sessions(credentials.uid);
          const match = sessions.find(
            (session) =>
              computeSessionTokenHandle(
                sessionTokenHandleKey,
                credentials.uid,
                session.id
              ) === payload.sessionTokenHandle
          );
          if (!match) {
            throw error.invalidRequestParameter('sessionTokenHandle');
          }
          if (match.id === credentials.id) {
            await db.deleteSessionToken(credentials);
          } else {
            const sessionToken = await db.sessionToken(match.id);
            if (!sessionToken || sessionToken.uid !== credentials.uid) {
              throw error.invalidRequestParameter('sessionTokenHandle');
            }
            await db.deleteSessionToken(sessionToken);
          }
        }

        return {};
      },
    },
  ];
};
