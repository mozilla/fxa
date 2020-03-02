/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const isA = require('@hapi/joi');
const validators = require('./validators');
const error = require('../error');

const HEX_STRING = validators.HEX_STRING;
const DEVICES_SCHEMA = require('../devices').schema;

module.exports = (log, db, oauthdb, devices, clientUtils) => {
  return [
    {
      method: 'GET',
      path: '/account/attached_clients',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA.array().items(
            isA.object({
              clientId: isA
                .string()
                .regex(HEX_STRING)
                .allow(null)
                .required(),
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
              createdTime: isA
                .number()
                .min(0)
                .required()
                .allow(null),
              createdTimeFormatted: isA
                .string()
                .optional()
                .allow(''),
              lastAccessTime: isA
                .number()
                .min(0)
                .required()
                .allow(null),
              lastAccessTimeFormatted: isA
                .string()
                .optional()
                .allow(''),
              approximateLastAccessTime: isA
                .number()
                .min(0)
                .optional(),
              approximateLastAccessTimeFormatted: isA
                .string()
                .optional()
                .allow(''),
              scope: isA
                .array()
                .items(validators.scope)
                .required()
                .allow(null),
              location: DEVICES_SCHEMA.location,
              userAgent: isA
                .string()
                .max(255)
                .required()
                .allow(''),
              os: isA
                .string()
                .max(255)
                .allow('')
                .allow(null),
            })
          ),
        },
      },
      handler: async function(request) {
        log.begin('Account.attachedClients', request);

        const uid = request.auth.credentials.uid;

        const attachedClients = [];

        const defaultFields = {
          clientId: null,
          deviceId: null,
          sessionTokenId: null,
          refreshTokenId: null,
          isCurrentSession: false,
          deviceType: null,
          name: null,
          createdTime: Infinity,
          lastAccessTime: 0,
          scope: null,
          location: null,
          userAgent: '',
          os: null,
        };

        // To generate the full list of attached clients, we have to merge three lists:
        //  * The auth-server's list of active session tokens
        //  * The auth-server's list of active device records
        //  * The oauth-server's list of authorized clients
        // Fetch them in parallel.
        // XXX TODO: we could obtain `sessions` and `devices` in a single query to the DB,
        // but would need to add a new db-server endpoint because each set can contain items
        // that the other does not.
        const devicesList = await request.app.devices;
        const oauthClientsP = oauthdb.listAuthorizedClients(
          request.auth.credentials
        );
        const sessionsP = db.sessions(uid);

        // Let's start with the devices, since each device is annotated with
        // the appropriate `sessionTokenId` and/or `refreshTokenId` to merge
        // with the other lists.
        const clientsBySessionTokenId = new Map();
        const clientsByRefreshTokenId = new Map();
        for (const device of devicesList) {
          const client = {
            ...defaultFields,
            sessionTokenId: device.sessionTokenId || null,
            refreshTokenId: device.refreshTokenId || null,
            deviceId: device.id,
            deviceType: device.type,
            name: device.name,
            createdTime: device.createdAt,
            lastAccessTime: device.createdAt,
          };
          attachedClients.push(client);
          if (device.sessionTokenId) {
            clientsBySessionTokenId.set(device.sessionTokenId, client);
          }
          if (device.refreshTokenId) {
            clientsByRefreshTokenId.set(device.refreshTokenId, client);
          }
        }

        // Merge with OAuth clients, which may or may not be linked to a device record.
        for (const oauthClient of await oauthClientsP) {
          let client = clientsByRefreshTokenId.get(
            oauthClient.refresh_token_id
          );
          if (!client) {
            client = {
              ...defaultFields,
              refreshTokenId: oauthClient.refresh_token_id || null,
              createdTime: oauthClient.created_time,
              lastAccessTime: oauthClient.last_access_time,
            };
            attachedClients.push(client);
          }
          client.clientId = oauthClient.client_id;
          client.scope = oauthClient.scope;
          client.createdTime = Math.min(
            client.createdTime,
            oauthClient.created_time
          );
          client.lastAccessTime = Math.max(
            client.lastAccessTime,
            oauthClient.last_access_time
          );
          // We fill in a default device name from the OAuth client name,
          // but indidivual clients can override this in their device record registration.
          if (!client.name) {
            client.name = oauthClient.client_name;
          }
          // For now we assume that all oauth clients that register a device record are mobile apps.
          // Ref https://github.com/mozilla/fxa/issues/449
          if (client.deviceId && !client.deviceType) {
            client.deviceType = 'mobile';
          }
        }

        // Merge with sessions, which may or may not be linked to a device record.
        for (const session of await sessionsP) {
          let client = clientsBySessionTokenId.get(session.id);
          if (!client) {
            client = {
              ...defaultFields,
              sessionTokenId: session.id,
              createdTime: session.createdAt,
            };
            attachedClients.push(client);
          }
          client.createdTime = Math.min(client.createdTime, session.createdAt);
          client.lastAccessTime = Math.max(
            client.lastAccessTime,
            session.lastAccessTime
          );
          if (client.sessionTokenId === request.auth.credentials.id) {
            client.isCurrentSession = true;
          }
          // Any client holding a sessionToken can grant themselves any scope.
          client.scope = null;
          // Location, OS and UA are currently only available on sessionTokens, so we can
          // copy across without worrying about merging with data from the device record.
          client.location = session.location ? { ...session.location } : null;
          client.os = session.uaOS || null;
          if (!session.uaBrowser) {
            client.userAgent = '';
          } else if (!session.uaBrowserVersion) {
            client.userAgent = session.uaBrowser;
          } else {
            const { uaBrowser: browser, uaBrowserVersion: version } = session;
            client.userAgent = `${browser} ${version.split('.')[0]}`;
          }
          if (!client.name) {
            client.name = devices.synthesizeName(session);
          }
        }

        // Now we can do some final tweaks of each item for display.
        for (const client of attachedClients) {
          clientUtils.formatTimestamps(client, request);
          clientUtils.formatLocation(client, request);
          if (client.deviceId && !client.deviceType) {
            client.deviceType = 'desktop';
          }
        }

        return attachedClients;
      },
    },
    {
      method: 'POST',
      path: '/account/attached_client/destroy',
      options: {
        auth: {
          strategy: 'sessionToken',
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
          schema: {},
        },
      },
      handler: async function(request) {
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
            await oauthdb.revokeAuthorizedClient(credentials, {
              client_id: payload.clientId,
              refresh_token_id: payload.refreshTokenId,
            });
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
          await oauthdb.revokeAuthorizedClient(credentials, {
            client_id: payload.clientId,
          });
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

        return {};
      },
    },
  ];
};
