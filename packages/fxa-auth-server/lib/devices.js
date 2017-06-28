/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

module.exports = function (log, db, push) {
  return {
    upsert: upsert,
    synthesizeName: synthesizeName
  }

  function upsert (request, sessionToken, deviceInfo) {
    var operation, event, result
    if (deviceInfo.id) {
      operation = 'updateDevice'
      event = 'device.updated'
    } else {
      operation = 'createDevice'
      event = 'device.created'
    }
    var isPlaceholderDevice = ! deviceInfo.id && ! deviceInfo.name && ! deviceInfo.type

    return db[operation](sessionToken.uid, sessionToken.tokenId, deviceInfo)
      .then(function (device) {
        result = device
        return request.emitMetricsEvent(event, {
          uid: sessionToken.uid,
          device_id: result.id,
          is_placeholder: isPlaceholderDevice
        })
      })
      .then(function () {
        if (operation === 'createDevice') {
          // Clients expect this notification to always include a name,
          // so try to synthesize one if necessary.
          var deviceName = result.name
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
    var browserPart = part('uaBrowser')
    var osPart = part('uaOS')

    if (browserPart) {
      if (osPart) {
        return browserPart + ', ' + osPart
      }

      return browserPart
    }

    return osPart || ''

    function part (key) {
      if (device[key]) {
        var versionKey = key + 'Version'

        if (device[versionKey]) {
          return device[key] + ' ' + device[versionKey]
        }

        return device[key]
      }
    }
  }
}

