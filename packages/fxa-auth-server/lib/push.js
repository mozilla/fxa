/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')

var ERR_NO_PUSH_CALLBACK = 'No Push Callback'

var LOG_OP_NOTIFY_UPDATE = 'push.notifyUpdate'

var reasonToEvents = {
  accountVerify: {
    send: 'push.send',
    success: 'push.success',
    resetSettings: 'push.reset_settings',
    failed: 'push.failed',
    noCallback: 'push.no_push_callback'
  },
  passwordReset: {
    send: 'push.password_reset.send',
    success: 'push.password_reset.success',
    resetSettings: 'push.password_reset.reset_settings',
    failed: 'push.password_reset.failed',
    noCallback: 'push.password_reset.no_push_callback'
  },
  passwordChange: {
    send: 'push.password_change.send',
    success: 'push.password_change.success',
    resetSettings: 'push.password_change.reset_settings',
    failed: 'push.password_change.failed',
    noCallback: 'push.password_change.no_push_callback'
  }
}

module.exports = function (log, db) {
  function reportPushError(err, deviceId) {
    log.error({
      op: LOG_OP_NOTIFY_UPDATE,
      deviceId: deviceId,
      err: err
    })
  }

  return {
    /**
     *  Notifies all devices that there was an update to the account
     *
     * @param uid
     * @promise
     */
    notifyUpdate: function notifyUpdate(uid, reason) {
      var events = reasonToEvents[reason] || reasonToEvents.accountVerify
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
              log.increment(events.send)
              request.post({
                url: device.pushCallback,
                headers: {
                  'ttl': '0'
                }
              }, function (err, response) {
                if (err) {
                  // 404 or 410 error from the push servers means
                  // the push settings need to be reset.
                  // the clients will check this and re-register push endpoints
                  if (response && (response.statusCode === 404 || response.statusCode === 410)) {
                    // reset device push configuration
                    // Warning: this method is called without any session tokens or auth validation.
                    device.pushCallback = ''
                    device.pushPublicKey = ''
                    db.updateDevice(uid, device.id, device).catch(function (err) {
                      reportPushError(err, deviceId)
                    })
                    log.increment(events.resetSettings)

                  } else {
                    reportPushError(err, deviceId)
                    log.increment(events.failed)
                  }
                } else {
                  log.increment(events.success)
                }
              })
            } else {
              // keep track if there are any devices with no push urls.
              reportPushError(new Error(ERR_NO_PUSH_CALLBACK), deviceId)
              log.increment(events.noCallback)
            }
          })
        })
    }
  }
}
