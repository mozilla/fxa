/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var base64url = require('base64url')
var webpush = require('web-push')
var P = require('./promise')

var ERR_NO_PUSH_CALLBACK = 'No Push Callback'
var ERR_DATA_BUT_NO_KEYS = 'Data payload present but missing key(s)'
var ERR_TOO_MANY_DEVICES = 'Too many devices connected to account'

var LOG_OP_PUSH_TO_DEVICES = 'push.pushToDevices'

var PUSH_PAYLOAD_SCHEMA_VERSION = 1
var PUSH_COMMANDS = {
  DEVICE_CONNECTED: 'fxaccounts:device_connected',
  DEVICE_DISCONNECTED: 'fxaccounts:device_disconnected',
  PROFILE_UPDATED: 'fxaccounts:profile_updated',
  PASSWORD_CHANGED: 'fxaccounts:password_changed',
  PASSWORD_RESET: 'fxaccounts:password_reset',
  ACCOUNT_DESTROYED: 'fxaccounts:account_destroyed'
}

var TTL_DEVICE_DISCONNECTED = 5 * 3600 // 5 hours
var TTL_PASSWORD_CHANGED = 6 * 3600 // 6 hours
var TTL_PASSWORD_RESET = TTL_PASSWORD_CHANGED
var TTL_ACCOUNT_DESTROYED = TTL_DEVICE_DISCONNECTED

// An arbitrary, but very generous, limit on the number of active devices.
// Currently only for metrics purposes, not enforced.
var MAX_ACTIVE_DEVICES = 200

var reasonToEvents = {
  accountVerify: {
    send: 'push.account_verify.send',
    success: 'push.account_verify.success',
    resetSettings: 'push.account_verify.reset_settings',
    failed: 'push.account_verify.failed',
    noCallback: 'push.account_verify.no_push_callback',
    noKeys: 'push.account_verify.data_but_no_keys'
  },
  accountConfirm: {
    send: 'push.account_confirm.send',
    success: 'push.account_confirm.success',
    resetSettings: 'push.account_confirm.reset_settings',
    failed: 'push.account_confirm.failed',
    noCallback: 'push.account_confirm.no_push_callback',
    noKeys: 'push.account_confirm.data_but_no_keys'
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
  },
  deviceConnected: {
    send: 'push.device_connected.send',
    success: 'push.device_connected.success',
    resetSettings: 'push.device_connected.reset_settings',
    failed: 'push.device_connected.failed',
    noCallback: 'push.device_connected.no_push_callback',
    noKeys: 'push.device_connected.data_but_no_keys'
  },
  deviceDisconnected: {
    send: 'push.device_disconnected.send',
    success: 'push.device_disconnected.success',
    resetSettings: 'push.device_disconnected.reset_settings',
    failed: 'push.device_disconnected.failed',
    noCallback: 'push.device_disconnected.no_push_callback',
    noKeys: 'push.device_disconnected.data_but_no_keys'
  },
  profileUpdated: {
    send: 'push.profile_updated.send',
    success: 'push.profile_updated.success',
    resetSettings: 'push.profile_updated.reset_settings',
    failed: 'push.profile_updated.failed',
    noCallback: 'push.profile_updated.no_push_callback',
    noKeys: 'push.profile_updated.data_but_no_keys'
  },
  devicesNotify: {
    send: 'push.devices_notify.send',
    success: 'push.devices_notify.success',
    resetSettings: 'push.devices_notify.reset_settings',
    failed: 'push.devices_notify.failed',
    noCallback: 'push.devices_notify.no_push_callback',
    noKeys: 'push.devices_notify.data_but_no_keys'
  },
  accountDestroyed: {
    send: 'push.account_destroyed.send',
    success: 'push.account_destroyed.success',
    resetSettings: 'push.account_destroyed.reset_settings',
    failed: 'push.account_destroyed.failed',
    noCallback: 'push.account_destroyed.no_push_callback',
    noKeys: 'push.account_destroyed.data_but_no_keys'
  }
}

/**
 * A device object returned by the db,
 * typically obtained by calling db.devices(uid).
 * @typedef {Object} Device
 */

module.exports = function (log, db, config) {
  var vapid
  if (config.vapidKeysFile) {
    var vapidKeys = require(config.vapidKeysFile)
    vapid = {
      privateKey: vapidKeys.privateKey,
      publicKey:  vapidKeys.publicKey,
      subject: config.publicUrl
    }
  }

  /**
   * Reports push errors to logs
   *
   * @param {Error} err
   * @param {Buffer} uid
   * @param {String} deviceId
   */
  function reportPushError(err, uid, deviceId) {
    log.error({
      op: LOG_OP_PUSH_TO_DEVICES,
      uid: uid.toString('hex'),
      deviceId: deviceId,
      err: err
    })
  }

  /**
   * Reports push increment actions to logs
   *
   * @param {String} name
   */
  function incrementPushAction(name) {
    if (name) {
      log.info({
        op: LOG_OP_PUSH_TO_DEVICES,
        name: name
      })
    }
  }

  /**
   * Copy sendPush authorized options from an existing options object
   * to a new one
   *
   * @param {Object} options
   */
  function filterOptions(options) {
    var allowedProps = ['TTL', 'data']
    return allowedProps.reduce(function(filtered, prop) {
      if (options[prop]) {
        filtered[prop] = options[prop]
      }
      return filtered
    }, {})
  }

  /**
   * Checks whether the given string is a valid public key for push.
   * This is a little tricky because we need to work around a bug in nodejs
   * where using an invalid ECDH key can cause a later (unrelated) attempt
   * to generate an RSA signature to fail:
   *
   *   https://github.com/nodejs/node/pull/13275
   *
   * @param key
   * The public key as a b64url string.
   */

  var dummySigner = crypto.createSign('RSA-SHA256')
  var dummyKey = Buffer.alloc(0)
  var dummyCurve = crypto.createECDH('prime256v1')
  dummyCurve.generateKeys()

  function isValidPublicKey(publicKey) {
    // Try to use the key in an ECDH agreement.
    // If the key is invalid then this will throw an error.
    try {
      dummyCurve.computeSecret(base64url.toBuffer(publicKey))
      return true
    } catch (err) {
      log.info({
        op: 'push.isValidPublicKey',
        name: 'Bad public key detected'
      })
      // However!  The above call might have left some junk
      // sitting around on the openssl error stack.
      // Clear it by deliberately triggering a signing error
      // before anything yields the event loop.
      try {
        dummySigner.sign(dummyKey)
      } catch (e) {}
      return false
    }
  }

  return {

    isValidPublicKey: isValidPublicKey,

    /**
     * Notifies all devices that there was an update to the account
     *
     * @param {Buffer} uid
     * @param {String} reason
     * @promise
     */
    notifyUpdate: function notifyUpdate(uid, reason) {
      reason = reason || 'accountVerify'
      return this.pushToAllDevices(uid, reason)
    },

    /**
     * Notifies all devices (except the one who joined) that a new device joined the account
     *
     * @param {Buffer} uid
     * @param {String} deviceName
     * @param {String} currentDeviceId
     * @promise
     */
    notifyDeviceConnected: function notifyDeviceConnected(uid, deviceName, currentDeviceId) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.DEVICE_CONNECTED,
        data: {
          deviceName: deviceName
        }
      }))
      var options = { data: data, excludedDeviceIds: [currentDeviceId] }
      return this.pushToAllDevices(uid, 'deviceConnected', options)
    },

    /**
     * Notifies a device that it is now disconnected from the account
     *
     * @param {Buffer} uid
     * @param {String} idToDisconnect
     * @promise
     */
    notifyDeviceDisconnected: function notifyDeviceDisconnected(uid, idToDisconnect) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.DEVICE_DISCONNECTED,
        data: {
          id: idToDisconnect
        }
      }))
      var options = { data: data, TTL: TTL_DEVICE_DISCONNECTED }
      return this.pushToAllDevices(uid, 'deviceDisconnected', options)
    },

    /**
     * Notifies all devices that a the profile attached to the account was updated
     *
     * @param {Buffer} uid
     * @promise
     */
    notifyProfileUpdated: function notifyProfileUpdated(uid) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.PROFILE_UPDATED
      }))
      var options = { data: data }
      return this.pushToAllDevices(uid, 'profileUpdated', options)
    },

    /**
     * Notifies a set of devices that the password was changed
     *
     * @param {Buffer} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordChanged: function notifyPasswordChanged(uid, devices) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.PASSWORD_CHANGED
      }))
      var options = { data: data, TTL: TTL_PASSWORD_CHANGED }
      return this.sendPush(uid, devices, 'passwordChange', options)
    },

    /**
     * Notifies a set of devices that the password was reset
     *
     * @param {Buffer} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordReset: function notifyPasswordReset(uid, devices) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.PASSWORD_RESET
      }))
      var options = { data: data, TTL: TTL_PASSWORD_RESET }
      return this.sendPush(uid, devices, 'passwordReset', options)
    },

    /**
     * Notifies a set of devices that the account no longer exists
     *
     * @param {Buffer} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyAccountDestroyed: function notifyAccountDestroyed(uid, devices) {
      var data = Buffer.from(JSON.stringify({
        version: PUSH_PAYLOAD_SCHEMA_VERSION,
        command: PUSH_COMMANDS.ACCOUNT_DESTROYED,
        data: {
          uid: uid.toString('hex')
        }
      }))
      var options = { data: data, TTL: TTL_ACCOUNT_DESTROYED }
      return this.sendPush(uid, devices, 'accountDestroyed', options)
    },

    /**
     * Send a push notification with or without data to all the devices in the account (except the ones in the excludedDeviceIds)
     *
     * @param {Buffer} uid
     * @param {String} reason
     * @param {Object} options
     * @param {String} options.excludedDeviceIds
     * @param {String} options.data
     * @param {String} options.TTL (in seconds)
     * @promise
     */
    pushToAllDevices: function pushToAllDevices(uid, reason, options) {
      options = options || {}
      var self = this
      return db.devices(uid).then(
        function (devices) {
          if (options.excludedDeviceIds) {
            devices = devices.filter(function(device) {
              return options.excludedDeviceIds.indexOf(device.id.toString('hex')) === -1
            })
          }
          var pushOptions = filterOptions(options)
          return self.sendPush(uid, devices, reason, pushOptions)
        })
    },

    /**
     * Send a push notification with or without data to a set of devices in the account
     *
     * @param {Buffer} uid
     * @param {String[]} ids
     * @param {String} reason
     * @param {Object} options
     * @param {String} options.data
     * @param {String} options.TTL (in seconds)
     * @promise
     */
    pushToDevices: function pushToDevices(uid, ids, reason, options) {
      var self = this
      return db.devices(uid).then(
        function (devices) {
          devices = devices.filter(function(device) {
            return ids.indexOf(device.id.toString('hex')) !== -1
          })
          if (devices.length === 0) {
            return P.reject('Devices ids not found in devices')
          }
          var pushOptions = filterOptions(options || {})
          return self.sendPush(uid, devices, reason, pushOptions)
        })
    },

    /**
     * Send a push notification with or without data to one device in the account
     *
     * @param {Buffer} uid
     * @param {String} id
     * @param {String} reason
     * @param {Object} options
     * @param {String} options.data
     * @param {String} options.TTL (in seconds)
     * @promise
     */
    pushToDevice: function pushToDevice(uid, id, reason, options) {
      return this.pushToDevices(uid, [id], reason, options)
    },

    /**
     * Send a push notification with or without data to a list of devices
     *
     * @param {Buffer} uid
     * @param {Device[]} devices
     * @param {String} reason
     * @param {Object} options
     * @param {String} options.data
     * @param {String} options.TTL (in seconds)
     * @promise
     */
    sendPush: function sendPush(uid, devices, reason, options) {
      options = options || {}
      var command
      try {
        command = JSON.parse(options.data.toString()).command
      } catch (e) {
        command = false
      }
      // Only non collection_changed events are allowed to be sent to ios
      // devices due to empty notifications. TODO: Remove.
      if (command !== 'sync:collection_changed') {
        devices = devices.filter(function(device) {
          var deviceOS = device.uaOS && device.uaOS.toLowerCase()
          return deviceOS !== 'ios'
        })
      }

      var events = reasonToEvents[reason]
      if (! events) {
        return P.reject('Unknown push reason: ' + reason)
      }
      // There's no spec-compliant way to error out as a result of having
      // too many devices to notify.  For now, just log metrics about it.
      if (devices.length > MAX_ACTIVE_DEVICES) {
        reportPushError(new Error(ERR_TOO_MANY_DEVICES), uid, null)
      }
      return P.each(devices, function(device) {
        var deviceId = device.id.toString('hex')

        log.trace({
          op: LOG_OP_PUSH_TO_DEVICES,
          uid: uid,
          deviceId: deviceId,
          pushCallback: device.pushCallback
        })

        if (device.pushCallback) {
          // send the push notification
          incrementPushAction(events.send)
          var pushSubscription = { endpoint: device.pushCallback }
          var pushPayload = null
          var pushOptions = { 'TTL': options.TTL || '0' }
          if (options.data) {
            if (! device.pushPublicKey || ! device.pushAuthKey) {
              reportPushError(new Error(ERR_DATA_BUT_NO_KEYS), uid, deviceId)
              incrementPushAction(events.noKeys)
              return
            }
            pushSubscription.keys = {
              p256dh: device.pushPublicKey,
              auth: device.pushAuthKey
            }
            pushPayload = options.data
          }
          if (vapid) {
            pushOptions.vapidDetails = vapid
          }
          return webpush.sendNotification(pushSubscription, pushPayload, pushOptions)
          .then(
            function () {
              incrementPushAction(events.success)
            },
            function (err) {
              // If we've stored an invalid key in the db for some reason, then we
              // might get an encryption failure here.  Check the key, which also
              // happens to work around bugginess in node's handling of said failures.
              var keyWasInvalid = false
              if (! err.statusCode && device.pushPublicKey) {
                if (! isValidPublicKey(device.pushPublicKey)) {
                  keyWasInvalid = true
                }
              }
              // 404 or 410 error from the push servers means
              // the push settings need to be reset.
              // the clients will check this and re-register push endpoints
              if (err.statusCode === 404 || err.statusCode === 410 || keyWasInvalid) {
                // reset device push configuration
                // Warning: this method is called without any session tokens or auth validation.
                device.pushCallback = ''
                device.pushPublicKey = ''
                device.pushAuthKey = ''
                return db.updateDevice(uid, null, device).catch(function (err) {
                  reportPushError(err, uid, deviceId)
                }).then(function() {
                  incrementPushAction(events.resetSettings)
                })
              } else {
                reportPushError(err, uid, deviceId)
                incrementPushAction(events.failed)
              }
            }
          )
        } else {
          // keep track if there are any devices with no push urls.
          reportPushError(new Error(ERR_NO_PUSH_CALLBACK), uid, deviceId)
          incrementPushAction(events.noCallback)
        }
      })
    }
  }
}
