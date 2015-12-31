/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')

var ERR_NO_PUSH_CALLBACK = 'No Push Callback'

var LOG_UPDATE_INCREMENT_SEND = 'push.send'
var LOG_UPDATE_INCREMENT_SUCCESS = 'push.success'
var LOG_UPDATE_INCREMENT_FAIL = 'push.failed'
var LOG_UPDATE_INCREMENT_NO_CALLBACK = 'push.no_push_callback'
var LOG_OP_NOTIFY_UPDATE = 'push.notifyUpdate'

module.exports = function (log, db) {
  return {
    /**
     *  Notifies all devices that there was an update to the account
     *
     * @param uid
     * @promise
     */
    notifyUpdate: function notifyUpdate(uid) {
      return db.devices(uid).then(
        function (devices) {
          devices.forEach(function (device) {
            var deviceId = device.id.toString('hex')

            log.trace({
              op: LOG_OP_NOTIFY_UPDATE,
              deviceId: deviceId,
              pushCallback: device.pushCallback
            })

            if (device.pushCallback) {
              // send the push notification
              log.increment(LOG_UPDATE_INCREMENT_SEND)
              request.post(device.pushCallback, function (err){
                if (err) {
                  log.error({
                    op: LOG_OP_NOTIFY_UPDATE,
                    deviceId: deviceId,
                    err: err
                  })
                  log.increment(LOG_UPDATE_INCREMENT_FAIL)
                } else {
                  log.increment(LOG_UPDATE_INCREMENT_SUCCESS)
                }
              })
            } else {
              // keep track if there are any devices with no push urls.
              log.error({
                op: LOG_OP_NOTIFY_UPDATE,
                deviceId: deviceId,
                err: ERR_NO_PUSH_CALLBACK
              })
              log.increment(LOG_UPDATE_INCREMENT_NO_CALLBACK)
            }
          })
        })
    }
  }
}
