/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var webpush = require('web-push')
var P = require('./promise')

var ERR_NO_PUSH_CALLBACK = 'No Push Callback'
var ERR_DATA_BUT_NO_KEYS = 'Data payload present but missing key(s)'

var LOG_OP_PUSH_TO_DEVICES = 'push.pushToDevices'

var reasonToEvents = {
  accountVerify: {
    send: 'push.account_verify.send',
    success: 'push.account_verify.success',
    resetSettings: 'push.account_verify.reset_settings',
    failed: 'push.account_verify.failed',
    noCallback: 'push.account_verify.no_push_callback',
    noKeys: 'push.account_verify.data_but_no_keys'
  },
  passwordReset: {
    send: 'push.password_reset.send',
    success: 'push.password_reset.success',
    resetSettings: 'push.password_reset.reset_settings',
    failed: 'push.password_reset.failed',
    noCallback: 'push.password_reset.no_push_callback',
    noKeys: 'push.password_reset.data_but_no_keys'
  },
  passwordChange: {
    send: 'push.password_change.send',
    success: 'push.password_change.success',
    resetSettings: 'push.password_change.reset_settings',
    failed: 'push.password_change.failed',
    noCallback: 'push.password_change.no_push_callback',
    noKeys: 'push.password_change.data_but_no_keys'
  }
}

module.exports = function (log, db) {
  function reportPushError(err, deviceId) {
    log.error({
      op: LOG_OP_PUSH_TO_DEVICES,
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
      reason = reason || 'accountVerify'
      return this.pushToDevices(uid, reason)
    },

    /**
     * Send a push notification with or without data to all the devices in the account (except the ones in the excludedDeviceIds)
     *
     * @param uid
     * @param reason
     * @param data
     * @param excludedDeviceIds
     * @promise
     */
    pushToDevices: function pushToDevices(uid, reason, data, excludedDeviceIds) {
      var events = reasonToEvents[reason]
      return db.devices(uid).then(
        function (devices) {
          return P.all(
            devices.map(function(device) {
              var deviceId = device.id.toString('hex')

              if (excludedDeviceIds && excludedDeviceIds.indexOf(deviceId) !== -1) {
                return
              }

              log.trace({
                op: LOG_OP_PUSH_TO_DEVICES,
                deviceId: deviceId,
                pushCallback: device.pushCallback
              })

              if (device.pushCallback) {
                // send the push notification
                log.increment(events.send)
                var pushParams = { 'TTL': '0' }
                if (data) {
                  if (!device.pushPublicKey || !device.pushAuthKey) {
                    reportPushError(new Error(ERR_DATA_BUT_NO_KEYS), deviceId)
                    log.increment(events.noKeys)
                    return
                  }
                  pushParams.userPublicKey = device.pushPublicKey
                  pushParams.userAuth = device.pushAuthKey
                  pushParams.payload = data
                }
                return webpush.sendNotification(device.pushCallback, pushParams)
                .then(
                  function () {
                    log.increment(events.success)
                  },
                  function (err) {
                    // 404 or 410 error from the push servers means
                    // the push settings need to be reset.
                    // the clients will check this and re-register push endpoints
                    if (err.statusCode === 404 || err.statusCode === 410) {
                      // reset device push configuration
                      // Warning: this method is called without any session tokens or auth validation.
                      device.pushCallback = ''
                      device.pushPublicKey = ''
                      device.pushAuthKey = ''
                      return db.updateDevice(uid, device.id, device).catch(function (err) {
                        reportPushError(err, deviceId)
                      }).then(function() {
                        log.increment(events.resetSettings)
                      })
                    } else {
                      reportPushError(err, deviceId)
                      log.increment(events.failed)
                    }
                  }
                )
              } else {
                // keep track if there are any devices with no push urls.
                reportPushError(new Error(ERR_NO_PUSH_CALLBACK), deviceId)
                log.increment(events.noCallback)
              }
            }))
        })
    }
  }
}
