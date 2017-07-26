/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const Ajv = require('ajv')
const ajv = new Ajv()
const error = require('../error')
const fs = require('fs')
const isA = require('joi')
const P = require('../promise')
const path = require('path')
const validators = require('./validators')

const HEX_STRING = validators.HEX_STRING
const DISPLAY_SAFE_UNICODE = validators.DISPLAY_SAFE_UNICODE
const URL_SAFE_BASE_64 = validators.URL_SAFE_BASE_64
const PUSH_PAYLOADS_SCHEMA_PATH = path.resolve(__dirname, '../../docs/pushpayloads.schema.json')

module.exports = (log, db, config, customs, push, devices) => {
  // Loads and compiles a json validator for the payloads received
  // in /account/devices/notify
  const validatePushSchema = JSON.parse(fs.readFileSync(PUSH_PAYLOADS_SCHEMA_PATH))
  const validatePushPayload = ajv.compile(validatePushSchema)
  const localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
    supportedLanguages: config.i18n.supportedLanguages,
    defaultLanguage: config.i18n.defaultLanguage
  })

  const PUSH_SERVER_REGEX = config.push && config.push.allowedServerRegex

  return [
    {
      method: 'POST',
      path: '/account/device',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              id: isA.string().length(32).regex(HEX_STRING).required(),
              name: isA.string().max(255).regex(DISPLAY_SAFE_UNICODE).optional(),
              type: isA.string().max(16).optional(),
              pushCallback: isA.string().uri({ scheme: 'https' }).regex(PUSH_SERVER_REGEX).max(255).optional().allow(''),
              pushPublicKey: isA.string().max(88).regex(URL_SAFE_BASE_64).optional().allow(''),
              pushAuthKey: isA.string().max(24).regex(URL_SAFE_BASE_64).optional().allow('')
            }).or('name', 'type', 'pushCallback', 'pushPublicKey', 'pushAuthKey').and('pushPublicKey', 'pushAuthKey'),
            isA.object({
              name: isA.string().max(255).regex(DISPLAY_SAFE_UNICODE).required(),
              type: isA.string().max(16).required(),
              pushCallback: isA.string().uri({ scheme: 'https' }).regex(PUSH_SERVER_REGEX).max(255).optional().allow(''),
              pushPublicKey: isA.string().max(88).regex(URL_SAFE_BASE_64).optional().allow(''),
              pushAuthKey: isA.string().max(24).regex(URL_SAFE_BASE_64).optional().allow('')
            }).and('pushPublicKey', 'pushAuthKey')
          )
        },
        response: {
          schema: isA.object({
            id: isA.string().length(32).regex(HEX_STRING).required(),
            createdAt: isA.number().positive().optional(),
            // We previously allowed devices to register with arbitrary unicode names,
            // so we can't assert DISPLAY_SAFE_UNICODE in the response schema.
            name: isA.string().max(255).optional(),
            type: isA.string().max(16).optional(),
            pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow(''),
            pushPublicKey: isA.string().max(88).regex(URL_SAFE_BASE_64).optional().allow(''),
            pushAuthKey: isA.string().max(24).regex(URL_SAFE_BASE_64).optional().allow('')
          }).and('pushPublicKey', 'pushAuthKey')
        }
      },
      handler (request, reply) {
        log.begin('Account.device', request)

        const payload = request.payload
        const sessionToken = request.auth.credentials

        // Some additional, slightly tricky validation to detect bad public keys.
        if (payload.pushPublicKey && ! push.isValidPublicKey(payload.pushPublicKey)) {
          throw error.invalidRequestParameter('invalid pushPublicKey')
        }

        if (payload.id) {
          // Don't write out the update if nothing has actually changed.
          if (isSpuriousUpdate(payload, sessionToken)) {
            return reply(payload)
          }

          // We also reserve the right to disable updates until
          // we're confident clients are behaving correctly.
          if (config.deviceUpdatesEnabled === false) {
            throw error.featureNotEnabled()
          }
        } else if (sessionToken.deviceId) {
          // Keep the old id, which is probably from a synthesized device record
          payload.id = sessionToken.deviceId
        }

        if (payload.pushCallback && (! payload.pushPublicKey || ! payload.pushAuthKey)) {
          payload.pushPublicKey = ''
          payload.pushAuthKey = ''
        }

        devices.upsert(request, sessionToken, payload)
          .then(reply, reply)

        // Clients have been known to send spurious device updates,
        // which generates lots of unnecessary database load.
        // Check if anything has actually changed, and log lots metrics on what.
        function isSpuriousUpdate (payload, token) {
          let spurious = true

          if (! token.deviceId || payload.id !== token.deviceId) {
            spurious = false
          }

          if (payload.name && payload.name !== token.deviceName) {
            spurious = false
          }

          if (payload.type && payload.type !== token.deviceType) {
            spurious = false
          }

          if (payload.pushCallback && payload.pushCallback !== token.deviceCallbackURL) {
            spurious = false
          }

          if (payload.pushPublicKey && payload.pushPublicKey !== token.deviceCallbackPublicKey) {
            spurious = false
          }

          return spurious
        }
      }
    },
    {
      method: 'POST',
      path: '/account/devices/notify',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              to: isA.string().valid('all').required(),
              excluded: isA.array().items(isA.string().length(32).regex(HEX_STRING)).optional(),
              payload: isA.object().required(),
              TTL: isA.number().integer().min(0).optional()
            }),
            isA.object({
              to: isA.array().items(isA.string().length(32).regex(HEX_STRING)).required(),
              payload: isA.object().required(),
              TTL: isA.number().integer().min(0).optional()
            })
          )
        },
        response: {
          schema: {}
        }
      },
      handler (request, reply) {
        log.begin('Account.devicesNotify', request)

        // We reserve the right to disable notifications until
        // we're confident clients are behaving correctly.
        if (config.deviceNotificationsEnabled === false) {
          throw error.featureNotEnabled()
        }

        const body = request.payload
        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const ip = request.app.clientAddress
        const payload = body.payload

        if (! validatePushPayload(payload)) {
          throw error.invalidRequestParameter('invalid payload')
        }

        const pushOptions = {
          data: Buffer.from(JSON.stringify(payload))
        }

        if (body.excluded) {
          pushOptions.excludedDeviceIds = body.excluded
        }

        if (body.TTL) {
          pushOptions.TTL = body.TTL
        }

        const endpointAction = 'devicesNotify'

        return customs.checkAuthenticated(endpointAction, ip, uid)
          .then(() => {
            if (body.to === 'all') {
              push.pushToAllDevices(uid, endpointAction, pushOptions)
                .catch(catchPushError)
            } else {
              push.pushToDevices(uid, body.to, endpointAction, pushOptions)
                .catch(catchPushError)
            }
          })
          .then(() => {
            // Emit a metrics event for when a user sends tabs between devices.
            // In the future we will aim to get this event directly from sync telemetry,
            // but we're doing it here for now as a quick way to get metrics on the feature.
            if (
              payload.command === 'sync:collection_changed' &&
              // Note that payload schema validation ensures that these properties exist.
              payload.data.collections.length === 1 &&
              payload.data.collections[0] === 'clients'
            ) {
              let deviceId = undefined

              if (sessionToken.deviceId) {
                deviceId = sessionToken.deviceId
              }

              return request.emitMetricsEvent('sync.sentTabToDevice', {
                device_id: deviceId,
                service: 'sync',
                uid: uid
              })
            }
          })
          .then(
            () => reply({}),
            reply
          )

        function catchPushError (err) {
          // push may fail due to not found devices or a bad push action
          // log the error but still respond with a 200.
          log.error({
            op: 'Account.devicesNotify',
            uid: uid,
            error: err
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/account/devices',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            id: isA.string().length(32).regex(HEX_STRING).required(),
            isCurrentDevice: isA.boolean().required(),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            // We previously allowed devices to register with arbitrary unicode names,
            // so we can't assert DISPLAY_SAFE_UNICODE in the response schema.
            name: isA.string().max(255).required().allow(''),
            type: isA.string().max(16).required(),
            pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow('').allow(null),
            pushPublicKey: isA.string().max(88).regex(URL_SAFE_BASE_64).optional().allow('').allow(null),
            pushAuthKey: isA.string().max(24).regex(URL_SAFE_BASE_64).optional().allow('').allow(null),
          }).and('pushPublicKey', 'pushAuthKey'))
        }
      },
      handler (request, reply) {
        log.begin('Account.devices', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        db.devices(uid)
          .then(deviceArray => {
            reply(deviceArray.map(device => {
              if (! device.name) {
                device.name = devices.synthesizeName(device)
              }

              if (! device.type) {
                device.type = device.uaDeviceType || 'desktop'
              }

              device.isCurrentDevice = device.sessionToken === sessionToken.tokenId

              device.lastAccessTimeFormatted = localizeTimestamp.format(
                device.lastAccessTime,
                request.headers['accept-language']
              )
              delete device.sessionToken
              delete device.uaBrowser
              delete device.uaBrowserVersion
              delete device.uaOS
              delete device.uaOSVersion
              delete device.uaDeviceType

              return device
            }))
          },
          reply
        )
      }
    },
    {
      method: 'GET',
      path: '/account/sessions',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            id: isA.string().regex(HEX_STRING).required(),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            createdTime: isA.number().min(0).required().allow(null),
            createdTimeFormatted: isA.string().optional().allow(''),
            location: isA.object({
              state: isA.string().allow(null),
              country: isA.string().allow(null)
            }),
            userAgent: isA.string().max(255).required().allow(''),
            os: isA.string().max(255).allow('').allow(null),
            deviceId: isA.string().regex(HEX_STRING).allow(null),
            deviceName: isA.string().max(255).required().allow('').allow(null),
            deviceType: isA.string().max(16).required().allow(null),
            deviceCallbackURL: isA.string().uri({ scheme: 'https' }).max(255).optional().allow('').allow(null),
            deviceCallbackPublicKey: isA.string().max(88).regex(URL_SAFE_BASE_64).optional().allow('').allow(null),
            deviceCallbackAuthKey: isA.string().max(24).regex(URL_SAFE_BASE_64).optional().allow('').allow(null),
            isDevice: isA.boolean().required(),
            isCurrentDevice: isA.boolean().required()
          }))
        }
      },
      handler (request, reply) {
        log.begin('Account.sessions', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        db.sessions(uid)
          .then(sessions => {
            reply(sessions.map(session => {
              const deviceId = session.deviceId
              const isDevice = !! deviceId

              let deviceName = session.deviceName
              if (! deviceName) {
                deviceName = devices.synthesizeName(session)
              }

              let userAgent
              if (! session.uaBrowser) {
                userAgent = ''
              } else if (! session.uaBrowserVersion) {
                userAgent = session.uaBrowser
              } else {
                userAgent = `${session.uaBrowser} ${session.uaBrowserVersion}`
              }

              return {
                deviceId,
                deviceName,
                deviceType: session.uaDeviceType || 'desktop',
                deviceCallbackURL: session.deviceCallbackURL,
                deviceCallbackPublicKey: session.deviceCallbackPublicKey,
                deviceCallbackAuthKey: session.deviceCallbackAuthKey,
                id: session.tokenId,
                isCurrentDevice: session.tokenId === sessionToken.tokenId,
                isDevice,
                location: {
                  state: session.location && session.location.state,
                  country: session.location && session.location.country
                },
                lastAccessTime: session.lastAccessTime,
                lastAccessTimeFormatted: localizeTimestamp.format(
                  session.lastAccessTime,
                  request.headers['accept-language']
                ),
                createdTime: session.createdAt,
                createdTimeFormatted: localizeTimestamp.format(
                  session.createdAt,
                  request.headers['accept-language']
                ),
                os: session.uaOS,
                userAgent
              }
            }))
          },
          reply
        )
      }
    },
    {
      method: 'POST',
      path: '/account/device/destroy',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            id: isA.string().length(32).regex(HEX_STRING).required()
          }
        },
        response: {
          schema: {}
        }
      },
      handler (request, reply) {
        log.begin('Account.deviceDestroy', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const id = request.payload.id
        let result

        return push.notifyDeviceDisconnected(uid, id)
          .catch(() => {})
          .then(() => db.deleteDevice(uid, id))
          .then(res => {
            result = res
            return P.all([
              request.emitMetricsEvent('device.deleted', {
                uid: uid,
                device_id: id
              }),
              log.notifyAttachedServices('device:delete', request, {
                uid: uid,
                id: id,
                timestamp: Date.now()
              })
            ])
          })
          .then(() => result)
          .then(reply, reply)
      }
    }
  ]
}
