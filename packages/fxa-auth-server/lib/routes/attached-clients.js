/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import isA from 'joi';
import * as validators from './validators';
import authorizedClients from '../oauth/authorized_clients';
import error from '../error';

const HEX_STRING = validators.HEX_STRING;
import { schema as DEVICES_SCHEMA } from '../devices';
import { default as DEVICES_AND_SESSIONS_DOC } from '../../docs/swagger/devices-and-sessions-api';

import { ConnectedServicesFactory } from 'fxa-shared/connected-services';
import { default as DESCRIPTIONS } from '../../docs/swagger/shared/descriptions';

export default (log, db, devices, clientUtils) => {
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
      method: 'POST',
      path: '/account/attached_client/destroy',
      options: {
        ...DEVICES_AND_SESSIONS_DOC.ACCOUNT_ATTACHED_CLIENT_DESTROY_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
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

        return {};
      },
    },
  ];
};
