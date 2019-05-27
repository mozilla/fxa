/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const i18n = require('i18n-abide');
const isA = require('joi');
const validators = require('./validators');

const HEX_STRING = validators.HEX_STRING;
const DEVICES_SCHEMA = require('../devices').schema;

module.exports = (log, db, config, customs, push, pushbox, devices, oauthdb) => {

  const earliestSaneAccessTime = config.lastAccessTimeUpdates.earliestSaneTimestamp;
  const { supportedLanguages, defaultLanguage } = config.i18n;

  const localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
    supportedLanguages,
    defaultLanguage
  });

  function formatTimestamps(client, request) {
    const languages = request.app.acceptLanguage;
    if (client.lastAccessTime < earliestSaneAccessTime) {
      client.lastAccessTime = earliestSaneAccessTime;
    }
    client.createdTimeFormatted = localizeTimestamp.format(client.createdTime, languages);
    client.lastAccessTimeFormatted = localizeTimestamp.format(client.lastAccessTime, languages);
  }

  function formatLocation(client, request) {
    let language;
    if (client.location) {
      const location = client.location;
      try {
        const languages = i18n.parseAcceptLanguage(request.app.acceptLanguage);
        language = i18n.bestLanguage(languages, supportedLanguages, defaultLanguage);
        // For English, we can just leave all the location components intact.
        // For other languages, only return what we can translate
        if (language[0] !== 'e' || language[1] !== 'n') {
          const territories = require(`cldr-localenames-full/main/${language}/territories.json`);
          client.location = {
            country: territories.main[language].localeDisplayNames.territories[location.countryCode]
          }
        }
      } catch (err) {
        log.warn('connected-clients.formatLocation.warning', {
          err: err.message,
          languages: request.app.acceptLanguage,
          language,
          location,
        });
      }
    }
  }

  return [
    {
      method: 'GET',
      path: '/account/connected_clients',
      options: {
        auth: {
          strategy : 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            clientId: isA.string().regex(HEX_STRING).allow(null).required(),
            sessionTokenId: isA.string().regex(HEX_STRING).allow(null).required(),
            refreshTokenId: isA.string().regex(HEX_STRING).allow(null).required(),
            deviceId: DEVICES_SCHEMA.id.allow(null).required(),
            deviceName: DEVICES_SCHEMA.nameResponse.allow('').allow(null).required(),
            deviceType: DEVICES_SCHEMA.type.allow(null).required(),
            isCurrentDevice: isA.boolean().required(),
            createdTime: isA.number().min(0).required().allow(null),
            createdTimeFormatted: isA.string().optional().allow(''),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            approximateLastAccessTime: isA.number().min(0).optional(),
            approximateLastAccessTimeFormatted: isA.string().optional().allow(''),
            location: DEVICES_SCHEMA.location,
            userAgent: isA.string().max(255).required().allow(''),
            os: isA.string().max(255).allow('').allow(null),
          }))
        }
      },
      handler: async function (request) {
        log.begin('Account.connectedClients', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        const connectedClients = [];

        const defaultFields = {
          clientId: null,
          sessionTokenId: null,
          refreshTokenId: null,
          deviceId: null,
          deviceName: null,
          deviceType: null,
          isCurrentDevice: false,
          createdTime: null,
          lastAccessTime: null,
          location: null,
          userAgent: null,
          os: null,
        };

        // To generate the full list of connected clients, we have to merge three lists:
        //  * The auth-server's list of active session tokens
        //  * The auth-server's list of active device records
        //  * The oauth-server's list of authorized clients
        // Fetch them in parallel.
        // XXX TODO: we could obtain `sessions` and `devices` in a single query,
        // but would need to add a new endpoint because each set can contain items
        // that the other does not.
        const devicesP = request.app.devices;
        const sessionsP = db.sessions(uid);
        const oauthClientsP = oauthdb.listAuthorizedClients(sessionToken);

        // Let's start with the devices, since each device is annotated with
        // the appropriate `sessionTokenId` and/or `refreshTokenId` to merge
        // with the other lists.
        const clientsBySessionTokenId = new Map();
        const clientsByRefreshTokenId = new Map();
        for (const device of await devicesP) {
          const client = {
            ...defaultFields,
            sessionTokenId: device.sessionTokenId || null,
            refreshTokenId: device.refreshTokenId || null,
            deviceId: device.id,
            deviceName: device.name,
            deviceType: device.type,
            isCurrentDevice: device.sessionTokenId === sessionToken.id,
            createdTime: device.createdAt,
          };
          connectedClients.push(client);
          if (device.sessionTokenId) {
            clientsBySessionTokenId.set(device.sessionTokenId, client);
          }
          if (device.refreshTokenId) {
            clientsByRefreshTokenId.set(device.refreshTokenId, client);
          }
        }

        // Merge with sessions, which may or may not be linked
        // to a device record.
        for (const session of await sessionsP) {
          let client = clientsBySessionTokenId.get(session.id);
          if (! client) {
            client = {
              ...defaultFields,
              sessionTokenId: session.id,
              isCurrentDevice: session.id === sessionToken.id,
              createdTime: session.createdAt,
            };
            connectedClients.push(client);
          }
          client.createdTime = Math.min(client.createdTime, session.createdTime);
          client.lastAccessTime = Math.max(client.lastAccessTime, session.lastAccessTime);
          // Location, OS and UA are currently only available on sessionTokens
          // so we can copy across without worrying about merging.
          client.location = session.location ? { ...session.location } : null;
          client.os = session.uaOS;
          if (! session.uaBrowser) {
            client.userAgent = '';
          } else if (! session.uaBrowserVersion) {
            client.userAgent = session.uaBrowser;
          } else {
            const { uaBrowser: browser, uaBrowserVersion: version } = session;
            client.userAgent = `${browser} ${version.split('.')[0]}`;
          }
        }

        // Merge with OAuth clients, which may or may not be linked
        // to a device record.
        for (const oauthClient in await oauthClientsP) {
          let client = clientsBySessionTokenId.get(oauthClient.refresh_token_id);
          if (! client) {
            client = {
              ...defaultFields,
              refreshTokenId: oauthClient.refresh_token_id,
              createdTime: oauthClient.creation_time,
            };
            connectedClients.push(client);
          }
          client.clientId = oauthClient.client_id;
          client.createdTime = Math.min(client.createdTime, oauthClient.createdTime);
          client.lastAccessTime = Math.max(client.lastAccessTime, oauthClient.lastAccessTime);
        }

        // Now we can do some final tweaks of each item for display.
        for (const client of connectedClients) {
          formatTimestamps(client, request);
          formatLocation(client, request);
        }

        return connectedClients;
      }
    },
    {
      method: 'POST',
      path: '/account/connected_clients/destroy',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.object({
            clientId: validators.clientId.allow(null).optional(),
            sessionTokenId: isA.string().regex(HEX_STRING).allow(null).optional(),
            refreshTokenId: validators.refreshToken.allow(null).optional(),
            deviceId: DEVICES_SCHEMA.id.allow(null).optional(),
          })
          .or('clientId', 'sessionTokenId', 'refreshTokenId', 'deviceId')
          .with('refreshTokenId', ['clientId'])
        },
        response: {
          schema: {}
        }
      },
      handler: async function (request) {
        log.begin('Account.connectedClientsDestroy', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        if (request.payload.deviceId) {
          // If we got a `deviceId`, then deleting that should also delete the sessionToken
          // and should return the refreshToken. It's fishy if the values returned here don't
          // match ones we were given in the request.
          // XXX TODO: needs to trigger notifications, like `/account/device/destroy`.
          const device = await db.deleteDevice(uid, request.payload.deviceId);
          if (device && device.refreshTokenId) {
            await oauthdb.revokeRefreshTokenById(device.refreshTokenId);
          }
          // XXX TODO: check that sessionToken and refreshToken matched the ones in the request.
        } else if (request.payload.refreshTokenId) {
          // We've got device-less refreshToken. There should be no sessionToken.
          await oauthdb.revokeAuthorizedClient(request.auth.credentials, {
            client_id: request.payload.clientId,
            refresh_token_id: request.payload.refreshTokenId,
          });
        } else if (request.payload.clientId) {
          // We've got an OAuth client that isn't using refresh tokens. There should be no sessionToken.
          await oauthdb.revokeAuthorizedClient(request.auth.credentials, {
            client_id: request.payload.clientId,
          });
        } else if (request.payload.sessionTokenId) {
          // We've got a web session on our hands.
          // XXX TODO: 
          await
        }

        const refreshTokenId = request.payload.refreshTokenId;
        if (request.payload.clientId) {
          if (! refreshTokenId) {
            await oauthdb.revokeAuthorizedClient(request.auth.credentials, {
              client_id: request.payload.clientId
            });
          } else if (refreshTokenId !== device.refreshTokenId) {
            // What if we got a refresh token that's different to the one on the device record.
            // That shouldn't really happen...should we error out or what?

          }
        }

        const sessionTokenId = request.payload.sessionTokenId;
        if (sessionTokenId && sessionTokenId !== device.sessionTokenId) {

        }


        return {};
      }
    },
  ];
};
