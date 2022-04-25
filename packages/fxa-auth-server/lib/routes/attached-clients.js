/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import doc from '../../docs/swagger/devices-and-sessions-api';

const isA = require('@hapi/joi');
const validators = require('./validators');
const authorizedClients = require('../oauth/authorized_clients');
const error = require('../error');

const HEX_STRING = validators.HEX_STRING;
const DEVICES_SCHEMA = require('../devices').schema;

const { ConnectedServicesFactory } = require('fxa-shared/connected-services');

module.exports = (log, db, devices, clientUtils) => {
  return [
    {
      method: 'GET',
      path: '/account/attached_clients',
      options: {
        ...doc.ACCOUNT_ATTACHED_CLIENTS_GET,
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA
            .array()
            .items(
              isA
                .object({
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
                  createdTime: isA.number().min(0).required().allow(null),
                  createdTimeFormatted: isA.string().optional().allow(''),
                  lastAccessTime: isA.number().min(0).required().allow(null),
                  lastAccessTimeFormatted: isA.string().optional().allow(''),
                  approximateLastAccessTime: isA.number().min(0).optional(),
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
                  userAgent: isA.string().max(255).required().allow(''),
                  os: isA.string().max(255).allow('').allow(null),
                })
                .label('Account.attachedClient_model')
            )
            .label('Account.attachedClients_response'),
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
            return await request.app.devices;
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
        ...doc.ACCOUNT_ATTACHED_CLIENT_DESTROY_POST,
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
            .with('refreshTokenId', ['clientId'])
            .label('Account.attachedClientDestroy_payload'),
        },
        response: {
          schema: {},
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
