/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

module.exports = (log, db, push) => {
  return { upsert, synthesizeName }

  function upsert (request, sessionToken, deviceInfo) {
    let operation, event, result
    if (deviceInfo.id) {
      operation = 'updateDevice'
      event = 'device.updated'
    } else {
      operation = 'createDevice'
      event = 'device.created'
    }
    const isPlaceholderDevice = ! deviceInfo.id && ! deviceInfo.name && ! deviceInfo.type

    return db[operation](sessionToken.uid, sessionToken.tokenId, deviceInfo)
      .then(device => {
        result = device
        return request.emitMetricsEvent(event, {
          uid: sessionToken.uid,
          device_id: result.id,
          is_placeholder: isPlaceholderDevice
        })
      })
      .then(() => {
        if (operation === 'createDevice') {
          // Clients expect this notification to always include a name,
          // so try to synthesize one if necessary.
          let deviceName = result.name
          if (! deviceName) {
            deviceName = synthesizeName(deviceInfo)
          }
          if (sessionToken.tokenVerified) {
            push.notifyDeviceConnected(sessionToken.uid, deviceName, result.id)
          }
          if (isPlaceholderDevice) {
            log.info({
              op: 'device:createPlaceholder',
              uid: sessionToken.uid,
              id: result.id
            })
          }
          return log.notifyAttachedServices('device:create', request, {
            uid: sessionToken.uid,
            id: result.id,
            type: result.type,
            timestamp: result.createdAt,
            isPlaceholder: isPlaceholderDevice
          })
        }
      })
      .then(function () {
        return result
      })
  }

  function synthesizeName (device) {
    const uaBrowser = device.uaBrowser
    const uaBrowserVersion = device.uaBrowserVersion
    const uaOS = device.uaOS
    const uaOSVersion = device.uaOSVersion
    const uaFormFactor = device.uaFormFactor
    let result = ''

    if (uaBrowser) {
      if (uaBrowserVersion) {
        result = `${uaBrowser} ${uaBrowserVersion}`
      } else {
        result = uaBrowser
      }

      if (uaOS || uaFormFactor) {
        result += ', '
      }
    }

    if (uaOS) {
      result += uaOS

      if (uaFormFactor) {
        result += ' '
      } else if (uaOSVersion) {
        result += ` ${uaOSVersion}`
      }
    }

    if (uaFormFactor) {
      result += uaFormFactor
    }

    return result
  }
}

