/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const { URL } = require('url')
const Ajv = require('ajv')
const ajv = new Ajv()
const error = require('../error')
const fs = require('fs')
const i18n = require('i18n-abide')
const isA = require('joi')
const P = require('../promise')
const path = require('path')
const validators = require('./validators')

const HEX_STRING = validators.HEX_STRING
const DEVICES_SCHEMA = require('../devices').schema
const PUSH_PAYLOADS_SCHEMA_PATH = path.resolve(__dirname, '../../docs/pushpayloads.schema.json')


module.exports = (log, db, config, customs, push, pushbox, devices) => {
  // Loads and compiles a json validator for the payloads received
  // in /account/devices/notify
  const validatePushSchema = JSON.parse(fs.readFileSync(PUSH_PAYLOADS_SCHEMA_PATH))
  const validatePushPayloadAjv = ajv.compile(validatePushSchema)
  const { supportedLanguages, defaultLanguage } = config.i18n
  const localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
    supportedLanguages,
    defaultLanguage
  })
  const earliestSaneTimestamp = config.lastAccessTimeUpdates.earliestSaneTimestamp

  function validatePushPayload(payload, endpoint) {
    if (endpoint === 'accountVerify') {
      if (isEmpty(payload)) {
        return true
      }
      return false
    }

    return validatePushPayloadAjv(payload)
  }

  function isEmpty(payload) {
    return payload && Object.keys(payload).length === 0
  }

  function marshallLastAccessTime (lastAccessTime, request) {
    const languages = request.app.acceptLanguage
    const result = {
      lastAccessTime,
      lastAccessTimeFormatted: localizeTimestamp.format(lastAccessTime, languages),
    }

    if (lastAccessTime < earliestSaneTimestamp) {
      // Values older than earliestSaneTimestamp are probably wrong.
      // Signal that to the front end so that it can fall back to
      // an approximate string like "last sync over 2 months ago".
      // And do it using additional properties so we don't affect
      // older content servers that are unfamiliar with the change.
      result.approximateLastAccessTime = earliestSaneTimestamp
      result.approximateLastAccessTimeFormatted = localizeTimestamp.format(earliestSaneTimestamp, languages)
    }

    return result
  }

  function marshallLocation (location, request) {
    let language

    if (! location) {
      // Shortcut the error logging if location isn't set
      return {}
    }

    try {
      const languages = i18n.parseAcceptLanguage(request.app.acceptLanguage)
      language = i18n.bestLanguage(languages, supportedLanguages, defaultLanguage)

      if (language[0] === 'e' && language[1] === 'n') {
        // For English, return all of the location components
        return {
          city: location.city,
          country: location.country,
          state: location.state,
          stateCode: location.stateCode
        }
      }

      // For other languages, only return what we can translate
      const territories = require(`cldr-localenames-full/main/${language}/territories.json`)
      return {
        country: territories.main[language].localeDisplayNames.territories[location.countryCode]
      }
    } catch (err) {
      log.warn({
        op: 'devices.marshallLocation.warning',
        err: err.message,
        languages: request.app.acceptLanguage,
        language,
        location
      })
    }

    // If something failed, don't return location
    return {}
  }

  return [
    {
      method: 'POST',
      path: '/account/device',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              id: DEVICES_SCHEMA.id.required(),
              name: DEVICES_SCHEMA.name.optional(),
              type: DEVICES_SCHEMA.type.optional(),
              pushCallback: DEVICES_SCHEMA.pushCallback.optional(),
              pushPublicKey: DEVICES_SCHEMA.pushPublicKey.optional(),
              pushAuthKey: DEVICES_SCHEMA.pushAuthKey.optional(),
              availableCommands: DEVICES_SCHEMA.availableCommands.optional(),
              // Some versions of desktop firefox send a zero-length
              // "capabilities" array, for historical reasons.
              // We accept but ignore it.
              capabilities: isA.array().length(0).optional()
            })
            .or('name', 'type', 'pushCallback', 'pushPublicKey', 'pushAuthKey', 'availableCommands')
            .and('pushPublicKey', 'pushAuthKey'),
            isA.object({
              name: DEVICES_SCHEMA.name.required(),
              type: DEVICES_SCHEMA.type.required(),
              pushCallback: DEVICES_SCHEMA.pushCallback.optional(),
              pushPublicKey: DEVICES_SCHEMA.pushPublicKey.optional(),
              pushAuthKey: DEVICES_SCHEMA.pushAuthKey.optional(),
              availableCommands: DEVICES_SCHEMA.availableCommands.optional(),
              // Some versions of desktop firefox send a zero-length
              // "capabilities" array, for historical reasons.
              // We accept but ignore it.
              capabilities: isA.array().length(0).optional()
            })
            .and('pushPublicKey', 'pushAuthKey')
          )
        },
        response: {
          schema: isA.object({
            id: DEVICES_SCHEMA.id.required(),
            createdAt: isA.number().positive().optional(),
            name: DEVICES_SCHEMA.nameResponse.optional(),
            type: DEVICES_SCHEMA.type.optional(),
            pushCallback: DEVICES_SCHEMA.pushCallback.optional(),
            pushPublicKey: DEVICES_SCHEMA.pushPublicKey.optional(),
            pushAuthKey: DEVICES_SCHEMA.pushAuthKey.optional(),
            pushEndpointExpired: DEVICES_SCHEMA.pushEndpointExpired.optional(),
            availableCommands: DEVICES_SCHEMA.availableCommands.optional(),
          }).and('pushPublicKey', 'pushAuthKey')
        }
      },
      handler: async function (request) {
        log.begin('Account.device', request)

        const payload = request.payload
        const sessionToken = request.auth.credentials

        // Remove obsolete field, so we don't try to echo it back to the client.
        delete payload.capabilities

        // Some additional, slightly tricky validation to detect bad public keys.
        if (payload.pushPublicKey && ! push.isValidPublicKey(payload.pushPublicKey)) {
          throw error.invalidRequestParameter('invalid pushPublicKey')
        }

        if (payload.id) {
          // Don't write out the update if nothing has actually changed.
          if (devices.isSpuriousUpdate(payload, sessionToken)) {
            return payload
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

        const pushEndpointOk = ! payload.id || // New device.
                               (payload.id && payload.pushCallback &&
                                payload.pushCallback !== sessionToken.deviceCallbackURL) // Updating the pushCallback
        if (pushEndpointOk) {
          payload.pushEndpointExpired = false
        }
        if (payload.pushCallback) {
          if (! payload.pushPublicKey || ! payload.pushAuthKey) {
            payload.pushPublicKey = ''
            payload.pushAuthKey = ''
          }
        }

        // We're doing a gradual rollout of the 'device commands' feature
        // in support of pushbox, so accept an 'availableCommands' field
        // if pushbox is enabled.
        if (payload.availableCommands && ! config.pushbox.enabled) {
            payload.availableCommands = {}
        }

        return devices.upsert(request, sessionToken, payload)
          .then(function (device) {
            // We must respond with the full device record,
            // including any default values for missing fields.
            return Object.assign({
              // These properties can be picked from sessionToken or device as appropriate.
              pushCallback: sessionToken.deviceCallbackURL,
              pushPublicKey: sessionToken.deviceCallbackPublicKey,
              pushAuthKey: sessionToken.deviceCallbackAuthKey,
              pushEndpointExpired: sessionToken.deviceCallbackIsExpired,
              availableCommands: sessionToken.deviceAvailableCommands
            }, device, {
              // But these need to be non-falsey, using default fallbacks if necessary
              id: device.id || sessionToken.deviceId,
              name: device.name || sessionToken.deviceName || devices.synthesizeName(sessionToken),
              type: device.type || sessionToken.deviceType || 'desktop',
            })
          })
      }
    },
    {
      method: 'GET',
      path: '/account/device/commands',
      options: {
        validate: {
          query: {
            index: isA.number().optional(),
            limit: isA.number().optional().min(0).max(100).default(100),
          }
        },
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.object({
            index: isA.number().required(),
            last: isA.boolean().optional(),
            messages: isA.array().items(isA.object({
              index: isA.number().required(),
              data: isA.object({
                command: isA.string().max(255).required(),
                payload: isA.object().required(),
                sender: DEVICES_SCHEMA.id.optional()
              }).required()
            })).optional()
          }).and('last', 'messages')
        }
      },
      handler: async function (request) {
        log.begin('Account.deviceCommands', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const deviceId = sessionToken.deviceId
        const query = request.query || {}
        const {index, limit} = query

        return pushbox.retrieve(uid, deviceId, limit, index)
          .then(resp => {
            log.info({ op: 'commands.fetch', resp: resp })
            return resp
          })
      }
    },
    {
      method: 'POST',
      path: '/account/devices/invoke_command',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            target: DEVICES_SCHEMA.id.required(),
            command: isA.string().required(),
            payload: isA.object().required(),
            ttl: isA.number().integer().min(0).max(10000000).optional()
          }
        },
        response: {
          schema: {}
        }
      },
      handler: async function (request) {
        log.begin('Account.invokeDeviceCommand', request)

        const {target, command, payload, ttl} = request.payload
        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const sender = sessionToken.deviceId
        const ip = request.app.clientAddress

        return customs.checkAuthenticated('invokeDeviceCommand', ip, uid)
          .then(() => db.device(uid, target))
          .then(device => {
            if (! device.availableCommands.hasOwnProperty(command)) {
              throw error.unavailableDeviceCommand()
            }
            const data = {
              command,
              payload,
              sender,
            }
            return pushbox.store(uid, device.id, data, ttl)
              .then(({index}) => {
                const url = new URL('v1/account/device/commands', config.publicUrl)
                url.searchParams.set('index', index)
                url.searchParams.set('limit', 1)
                return push.notifyCommandReceived(uid, device, command, sender, index, url.href, ttl)
              })
          })
          .then(() => { return {} })
      }
    },
    {
      method: 'POST',
      path: '/account/devices/notify',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              to: isA.string().valid('all').required(),
              _endpointAction: isA.string().valid('accountVerify').optional(),
              excluded: isA.array().items(isA.string().length(32).regex(HEX_STRING)).optional(),
              payload: isA.object().when('_endpointAction', { is: 'accountVerify', then: isA.required(), otherwise: isA.required() }),
              TTL: isA.number().integer().min(0).optional()
            }),
            isA.object({
              to: isA.array().items(isA.string().length(32).regex(HEX_STRING)).required(),
              _endpointAction: isA.string().valid('accountVerify').optional(),
              payload: isA.object().when('_endpointAction', { is: 'accountVerify', then: isA.required(), otherwise: isA.required() }),
              TTL: isA.number().integer().min(0).optional()
            })
          )
        },
        response: {
          schema: {}
        }
      },
      handler: async function (request) {
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
        const endpointAction = body._endpointAction || 'devicesNotify'


        if (! validatePushPayload(payload, endpointAction)) {
          throw error.invalidRequestParameter('invalid payload')
        }

        const pushOptions = {
          data: payload
        }

        if (body.TTL) {
          pushOptions.TTL = body.TTL
        }

        return customs.checkAuthenticated(endpointAction, ip, uid)
          .then(() => request.app.devices)
          .then(devices => {
            if (body.to !== 'all') {
              const include = new Set(body.to)
              devices = devices.filter(device => include.has(device.id))

              if (devices.length === 0) {
                log.error({
                  op: 'Account.devicesNotify',
                  uid: uid,
                  error: 'devices empty'
                })
                return
              }
            } else if (body.excluded) {
              const exclude = new Set(body.excluded)
              devices = devices.filter(device => ! exclude.has(device.id))
            }

            return push.sendPush(uid, devices, endpointAction, pushOptions)
              .catch(catchPushError)
          })
          .then(() => {
            // Emit a metrics event for when a user sends tabs between devices.
            // In the future we will aim to get this event directly from sync telemetry,
            // but we're doing it here for now as a quick way to get metrics on the feature.
            if (
              payload &&
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
          .then(() => { return {} })

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
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            id: DEVICES_SCHEMA.id.required(),
            isCurrentDevice: isA.boolean().required(),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            approximateLastAccessTime: isA.number().min(earliestSaneTimestamp).optional(),
            approximateLastAccessTimeFormatted: isA.string().optional().allow(''),
            location: DEVICES_SCHEMA.location,
            name: DEVICES_SCHEMA.nameResponse.allow('').required(),
            type: DEVICES_SCHEMA.type.required(),
            pushCallback: DEVICES_SCHEMA.pushCallback.allow(null).optional(),
            pushPublicKey: DEVICES_SCHEMA.pushPublicKey.allow(null).optional(),
            pushAuthKey: DEVICES_SCHEMA.pushAuthKey.allow(null).optional(),
            pushEndpointExpired: DEVICES_SCHEMA.pushEndpointExpired.optional(),
            availableCommands: DEVICES_SCHEMA.availableCommands.optional(),
          }).and('pushPublicKey', 'pushAuthKey'))
        }
      },
      handler: async function (request) {
        log.begin('Account.devices', request)

        const sessionToken = request.auth.credentials

        return request.app.devices
          .then(deviceArray => {
            return deviceArray.map(device => {
              return Object.assign({
                id: device.id,
                isCurrentDevice: device.sessionToken === sessionToken.id,
                location: marshallLocation(device.location, request),
                name: device.name || devices.synthesizeName(device),
                type: device.type || device.uaDeviceType || 'desktop',
                pushCallback: device.pushCallback,
                pushPublicKey: device.pushPublicKey,
                pushAuthKey: device.pushAuthKey,
                pushEndpointExpired: device.pushEndpointExpired,
                availableCommands: device.availableCommands
              }, marshallLastAccessTime(device.lastAccessTime, request))
            })
          }
        )
      }
    },
    {
      method: 'GET',
      path: '/account/sessions',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            id: isA.string().regex(HEX_STRING).required(),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            approximateLastAccessTime: isA.number().min(earliestSaneTimestamp).optional(),
            approximateLastAccessTimeFormatted: isA.string().optional().allow(''),
            createdTime: isA.number().min(0).required().allow(null),
            createdTimeFormatted: isA.string().optional().allow(''),
            location: DEVICES_SCHEMA.location,
            userAgent: isA.string().max(255).required().allow(''),
            os: isA.string().max(255).allow('').allow(null),
            deviceId: DEVICES_SCHEMA.id.allow(null).required(),
            deviceName: DEVICES_SCHEMA.nameResponse.allow('').allow(null).required(),
            deviceAvailableCommands: DEVICES_SCHEMA.availableCommands.allow(null).required(),
            deviceType: DEVICES_SCHEMA.type.allow(null).required(),
            deviceCallbackURL: DEVICES_SCHEMA.pushCallback.allow(null).required(),
            deviceCallbackPublicKey: DEVICES_SCHEMA.pushPublicKey.allow(null).required(),
            deviceCallbackAuthKey: DEVICES_SCHEMA.pushAuthKey.allow(null).required(),
            deviceCallbackIsExpired: DEVICES_SCHEMA.pushEndpointExpired.allow(null).required(),
            isDevice: isA.boolean().required(),
            isCurrentDevice: isA.boolean().required()
          }))
        }
      },
      handler: async function (request) {
        log.begin('Account.sessions', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        return db.sessions(uid)
          .then(sessions => {
            return sessions.map(session => {
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
                const { uaBrowser: browser, uaBrowserVersion: version } = session
                userAgent = `${browser} ${version.split('.')[0]}`
              }

              return Object.assign({
                deviceId,
                deviceName,
                deviceType: session.uaDeviceType || 'desktop',
                deviceAvailableCommands: session.deviceAvailableCommands || null,
                deviceCallbackURL: session.deviceCallbackURL,
                deviceCallbackPublicKey: session.deviceCallbackPublicKey,
                deviceCallbackAuthKey: session.deviceCallbackAuthKey,
                deviceCallbackIsExpired: !! session.deviceCallbackIsExpired,
                id: session.id,
                isCurrentDevice: session.id === sessionToken.id,
                isDevice,
                location: marshallLocation(session.location, request),
                createdTime: session.createdAt,
                createdTimeFormatted: localizeTimestamp.format(
                  session.createdAt,
                  request.headers['accept-language']
                ),
                os: session.uaOS,
                userAgent
              }, marshallLastAccessTime(session.lastAccessTime, request))
            })
          }
        )
      }
    },
    {
      method: 'POST',
      path: '/account/device/destroy',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            id: DEVICES_SCHEMA.id.required()
          }
        },
        response: {
          schema: {}
        }
      },
      handler: async function (request) {
        log.begin('Account.deviceDestroy', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const id = request.payload.id
        let devices

        // We want to inculde the disconnected device in the list
        // of devices to notify, so list them before disconnecting.
        return request.app.devices
          .then(res => {
            devices = res
            return db.deleteDevice(uid, id)
          })
          .then(res => {
            push.notifyDeviceDisconnected(uid, devices, id)
              .catch(() => {})
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
          .then(() => { return {} })
      }
    }
  ]
}
